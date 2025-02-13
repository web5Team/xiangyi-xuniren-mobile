const END_URL = 'wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1'
const APPKEY = 'ckxnZMvhbPN4jD6g' // 获取Appkey请前往控制台：https://nls-portal.console.aliyun.com/applist
// DEPRECATED const TOKEN = '5068bcef6c304c00aad17769f3944751' // 获取Token具体操作，请参见：https://help.aliyun.com/document_detail/450514.html

const LOG_STYLES = {
  info: 'color: #8bb4f7',
  success: 'color: #67C23A',
  warning: 'color: #E6A23C',
  error: 'color: #F56C6C',
  highlight: 'color: #409EFF; font-weight: bold',
} as const

function log(message: string, style: keyof typeof LOG_STYLES = 'info') {
  console.log(`%c${message}`, LOG_STYLES[style])
}

export enum SpeechStatus {
  CONNECTING = 'Connecting',
  DISCONNECTED = 'Disconnected',
  CONNECTED = 'Connected',

  Ready = 'Ready',
  Listening = 'Listening',
  // Processing = 'Processing',
  End = 'End',

  Error = 'Error',
  Speaking = 'Speaking',
  Silent = 'Silent',
}

interface RootObject {
  header: Header
  payload: Payload
}

interface Payload {
  index: number
  time: number
  result: string
  confidence: number
  words: any[]
  status: number
  gender: string
  begin_time: number
  fixed_result: string
  unfixed_result: string
  stash_result: Stashresult
  audio_extra_info: string
  sentence_id: string
  gender_score: number
}

interface Stashresult {
  sentenceId: number
  beginTime: number
  text: string
  fixedText: string
  unfixedText: string
  currentTime: number
  words: any[]
}

interface Header {
  namespace: string
  name: string
  status: number
  message_id: string
  task_id: string
  status_text: string
}

export class SpeechNls {
  ws: WebSocket | undefined
  audioContext: AudioContext | undefined
  scriptProcessor: ScriptProcessorNode | undefined
  audioInput: MediaStreamAudioSourceNode | undefined
  // audioStream: MediaStream | undefined

  private token: string = ''
  cacheSentence: string = ''
  error: string = ''

  status: SpeechStatus = SpeechStatus.DISCONNECTED
  statusBus = useEventBus<SpeechStatus>('ON_STATUS_UPDATED')
  sentenceBus = useEventBus<Payload>('ON_SENTENCE')
  sentenceCacheBus = useEventBus<Payload>('ON_SENTENCE_CACHE')
  dataBus = useEventBus<RootObject>('ON_DATA')
  newConnectionStartBus = useEventBus<boolean>('ON_NEW_CONNECTION_START')

  private isSpeaking: boolean = false
  private silenceTimer: NodeJS.Timeout | null = null
  private readonly MAX_SILENCE_DURATION = 4000 // 4秒无声自动断开
  private lastSpeechTime: number = Date.now()

  private speakingBus = useEventBus<boolean>('ON_SPEAKING_STATUS')
  private lastSpeakingState: boolean = false
  private isMonitoring: boolean = false

  // 配置参数
  private readonly SPEECH_THRESHOLD = 0.008 // 声音检测阈值
  private volumeLevel: number = 0

  private animationFrameId: number | null = null
  private readonly LOG_OUTPUT_INTERVAL = 3000 // 3秒输出一次日志
  private lastLogTime: number = 0
  private isProcessingAudio: boolean = false

  private hasStartedTranscription: boolean = false
  private isConnecting: boolean = false

  private audioBuffer: Float32Array[] = [] // 存储音频数据的缓冲区
  private canSendAudio: boolean = false // 控制是否可以发送音频的标志
  private speakingStartTime: number = 0 // 开始说话的时间戳
  private readonly BUFFER_MAX_LENGTH = 2560 // 限制缓冲区大小
  private readonly MIN_SPEAKING_DURATION = 2000 // 最小说话持续时间（2秒）

  private currentUUID: string = ''

  getSpeakingStartTime() {
    return this.speakingStartTime
  }

  updateStatus(status: SpeechStatus) {
    this.status = status
    this.statusBus.emit(status)
  }

  async connect(token: string) {
    this.token = token
    this.error = ''
    this.updateStatus(SpeechStatus.CONNECTING)
    this.isMonitoring = true
    this.lastSpeechTime = Date.now()
    this.startConnection()
  }

  private reconnect() {
    if (this.token) {
      setTimeout(() => {
        // 只有在仍然在监测状态时才重新连接
        if (this.isMonitoring)
          this.connect(this.token)
      }, 1200)
    }
  }

  startConnection() {
    if (!this.token)
      throw new Error('Token is not set')

    if (this.isConnecting)
      return

    this.currentUUID = generateUUID()

    this.isConnecting = true

    log('[NLS] 开始建立WebSocket连接...', 'highlight')
    const socketUrl = `${END_URL}?token=${this.token}`
    log(`[NLS] WebSocket URL: ${socketUrl}`, 'info')

    const websocket = this.ws = new WebSocket(socketUrl)

    websocket.onopen = () => {
      log('[NLS] ✅ WebSocket连接已建立', 'success')
      this.updateStatus(SpeechStatus.CONNECTED)
      this.startSilenceDetection()
      this.sendStartTranscription()

      this.isConnecting = false
    }

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data) as RootObject
      this.dataBus.emit(message)

      // 根据不同消息类型记录日志
      switch (message.header.name) {
        case 'TranscriptionStarted':
          log('[NLS] 🎯 开始语音识别', 'success')
          this.updateStatus(SpeechStatus.Ready)
          this.newConnectionStartBus.emit(true)
          break
        case 'SentenceBegin':
          log('[NLS] 📝 开始新句子', 'info')
          this.cacheSentence = ''
          this.sentenceCacheBus.emit(message.payload)
          break
        case 'TranscriptionResultChanged':
          log(`[NLS] 🔄 实时识别结果: ${message.payload.result}`, 'info')
          this.cacheSentence = message.payload.result
          this.sentenceCacheBus.emit(message.payload)
          break
        case 'SentenceEnd':
          log(`[NLS] ✨ 句子完成: ${message.payload.result}`, 'success')
          this.cacheSentence = message.payload.result
          this.sentenceCacheBus.emit(message.payload)
          this.sentenceBus.emit(message.payload)
          this.hasStartedTranscription = false // 句子结束后重置状态
          break
        case 'TaskFailed':
          this.error = '无法完成识别'
          log(`[NLS] ❌ 识别任务失败: ${message.header.status_text}`, 'error')
          console.error('Task failed:', message)
          this.endConnection()
          break
        default:
          log(`[NLS] 收到消息: ${message.header.name}`, 'info')
      }
    }

    websocket.onerror = (event) => {
      this.error = '无法连接至远程服务器'
      log('[NLS] ❌ WebSocket连接错误', 'error')
      console.error('WebSocket error:', event)
      this.updateStatus(SpeechStatus.Error)
      this.isMonitoring = false
      if (this.silenceTimer) {
        clearInterval(this.silenceTimer)
        this.silenceTimer = null
      }
    }

    websocket.onclose = () => {
      log('[NLS] WebSocket连接已关闭', 'warning')
      this.updateStatus(SpeechStatus.DISCONNECTED)
      this.currentUUID = ''
      this.hasStartedTranscription = false // 重置状态
    }
  }

  private sendStartTranscription() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.hasStartedTranscription)
      return

    const startTranscriptionMessage = {
      header: {
        appkey: APPKEY,
        namespace: 'SpeechTranscriber',
        name: 'StartTranscription',
        task_id: this.currentUUID,
        message_id: this.currentUUID,
      },
      payload: {
        format: 'pcm',
        sample_rate: 16000,
        enable_intermediate_result: true,
        enable_punctuation_prediction: true,
        enable_inverse_text_normalization: true,
      },
    }

    log('[NLS] 发送开始识别指令', 'info')
    this.ws.send(JSON.stringify(startTranscriptionMessage))
    this.hasStartedTranscription = true
  }

  async endConnection() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      log('[NLS] 发送停止识别指令', 'warning')
      const stopTranscriptionMessage = {
        header: {
          appkey: APPKEY,
          namespace: 'SpeechTranscriber',
          name: 'StopTranscription',
          task_id: this.currentUUID,
          message_id: this.currentUUID,
        },
      }
      this.ws.send(JSON.stringify(stopTranscriptionMessage))
      this.hasStartedTranscription = false // 重置状态
      log('[NLS] 停止识别指令已发送', 'info')

      // 给一个2s处理时间
      setTimeout(() => {
        this.ws?.close()
        log('[NLS] WebSocket连接已关闭', 'info')
      }, 2000)
    }
  }

  disconnect() {
    log('[NLS] 开始断开连接...', 'warning')
    this.endConnection()
    if (this.ws) {
      this.ws.close()
      log('[NLS] WebSocket连接已关闭', 'info')
    }
    this.token = ''
    this.isMonitoring = false
    log('[NLS] 连接已完全断开', 'success')
  }

  async startRecording(audioStream: MediaStream) {
    try {
      log('[NLS] 开始录音和音频监测...', 'highlight')
      this.lastSpeechTime = Date.now()
      this.isMonitoring = true
      this.isProcessingAudio = true

      this.audioContext = new AudioContext({
        sampleRate: 16000,
      })
      this.audioInput = this.audioContext.createMediaStreamSource(audioStream)
      this.scriptProcessor = this.audioContext.createScriptProcessor(2048, 1, 1)

      this.scriptProcessor.onaudioprocess = (event) => {
        if (!this.isMonitoring)
          return

        const inputData = event.inputBuffer.getChannelData(0)
        const rms = Math.sqrt(inputData.reduce((acc, val) => acc + val * val, 0) / inputData.length)
        this.volumeLevel = rms
        const wasSpeaking = this.isSpeaking
        this.isSpeaking = rms > this.SPEECH_THRESHOLD

        // 检测说话状态变化
        if (this.isSpeaking && !wasSpeaking) {
          this.speakingStartTime = Date.now()
          this.canSendAudio = false
          this.audioBuffer = [] // 清空缓冲区
        }

        // 更新说话状态
        if (this.isSpeaking !== wasSpeaking) {
          const status = this.isSpeaking ? '开始说话' : '停止说话'
          log(`[NLS] 🎤 ${status} - 音量: ${rms.toFixed(6)}`, this.isSpeaking ? 'success' : 'warning')
          this.speakingBus.emit(this.isSpeaking)
        }

        if (this.isSpeaking) {
          this.lastSpeechTime = Date.now()

          // 只要开始说话 要确保连接到服务器
          if (this.ws?.readyState !== WebSocket.OPEN)
            this.startConnection()

          // 存储音频数据
          this.audioBuffer.push(new Float32Array(inputData))
          if (this.audioBuffer.length > this.BUFFER_MAX_LENGTH)
            this.audioBuffer.shift() // 移除最旧的数据

          // 检查是否已经说话超过2秒
          if (!this.canSendAudio && Date.now() - this.speakingStartTime >= this.MIN_SPEAKING_DURATION) {
            this.canSendAudio = true
            // 发送缓冲区中的所有数据
            this.sendBufferedAudio()
          }

          // 如果可以发送，且WebSocket连接正常
          // this.canSendAudio &&
          if (this.ws?.readyState === WebSocket.OPEN) {
            const inputData16 = new Int16Array(inputData.length)
            for (let i = 0; i < inputData.length; ++i)
              inputData16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF

            this.ws.send(inputData16.buffer)
          }
        }
      }

      this.startVoiceCheck()
      this.audioInput.connect(this.scriptProcessor)
      this.scriptProcessor.connect(this.audioContext.destination)

      log('[NLS] ✅ 录音初始化成功', 'success')
      this.updateStatus(SpeechStatus.Listening)
    }
    catch (e) {
      log('[NLS] ❌ 录音启动失败', 'error')
      console.error(e)
      throw e
    }
  }

  private startSilenceDetection() {
    // 清除之前的计时器
    if (this.silenceTimer)
      clearInterval(this.silenceTimer)

    // 每秒检查一次是否超过沉默时间
    this.silenceTimer = setInterval(() => {
      const silenceDuration = Date.now() - this.lastSpeechTime
      if (silenceDuration >= this.MAX_SILENCE_DURATION)
        this.handleLongSilence()
    }, 1000)
  }

  private async handleLongSilence() {
    if (this.silenceTimer) {
      clearInterval(this.silenceTimer)
      this.silenceTimer = null
    }

    try {
      await this.stopRecording()
      this.error = '检测到长时间无人说话，已自动断开连接'
      log('[NLS] ⚠️ 检测到长时间静音，自动断开连接', 'warning')
      this.updateStatus(SpeechStatus.Error)
    }
    catch (e) {
      log('[NLS] ❌ 处理长时间静音失败', 'error')
      console.error(e)
    }
  }

  private async handleStartSpeaking() {
    // 如果当前未连接或处于错误状态，尝试重新连接
    if (this.status === SpeechStatus.DISCONNECTED
      || this.status === SpeechStatus.Error) {
      try {
        if (this.token)
          await this.startConnection()
      }
      catch (e) {
        console.error('Failed to reconnect on speaking:', e)
      }
    }
  }

  private startVoiceCheck() {
    const checkVoice = () => {
      if (!this.isMonitoring) {
        this.animationFrameId = null
        return
      }

      const now = Date.now()
      // 降低普通状态日志的输出频率到每3秒一次
      if (now - this.lastLogTime >= this.LOG_OUTPUT_INTERVAL) {
        const silenceDuration = ((now - this.lastSpeechTime) / 1000).toFixed(1)
        log(
          `[NLS] 监测状态 - 音量: ${this.volumeLevel.toFixed(6)}, `
          + `状态: ${this.isSpeaking ? '说话中' : '静音'}, `
          + `静音持续: ${silenceDuration}s`,
          'info',
        )
        this.lastLogTime = now
      }

      this.animationFrameId = requestAnimationFrame(checkVoice)
    }

    checkVoice()
  }

  async stopRecording() {
    try {
      log('[NLS] 停止WebSocket连接...', 'warning')
      await this.endConnection()

      log('[NLS] ✅ WebSocket连接已关闭，继续进行音频监测', 'success')
      this.updateStatus(SpeechStatus.End)
    }
    catch (e) {
      log('[NLS] ❌ 停止WebSocket连接失败', 'error')
      console.error(e)
      throw e
    }
  }

  // 完全停止音频监测
  async stopAudioMonitoring() {
    this.isMonitoring = false
    this.isProcessingAudio = false

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    if (this.silenceTimer) {
      clearInterval(this.silenceTimer)
      this.silenceTimer = null
    }

    if (this.scriptProcessor)
      this.scriptProcessor.disconnect()

    if (this.audioInput)
      this.audioInput.disconnect()

    if (this.audioContext)
      await this.audioContext.close()

    log('[NLS] ✅ 音频监测已完全停止', 'success')
  }

  // 获取当前是否有人在说话的状态
  public getIsSpeaking(): boolean {
    return this.isSpeaking
  }

  // 新增：发送缓冲区中的音频数据
  private sendBufferedAudio() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
      return

    log('[NLS] 开始发送缓存的音频数据', 'info')

    for (const audioData of this.audioBuffer) {
      const inputData16 = new Int16Array(audioData.length)
      for (let i = 0; i < audioData.length; ++i)
        inputData16[i] = Math.max(-1, Math.min(1, audioData[i])) * 0x7FFF

      this.ws.send(inputData16.buffer)
    }

    this.audioBuffer = [] // 清空缓冲区
  }

  /**
   * 判断当前是否满足打断条件
   * @returns boolean 是否满足打断条件
   */
  public checkInterruption(): boolean {
    // 必须满足条件：
    // 1. 当前正在进行语音合成
    // 2. 当前音量超过阈值(正在说话)
    // 3. 持续说话超过2秒
    const speakingDuration = this.isSpeaking ? Date.now() - this.speakingStartTime : 0
    const volumeAboveThreshold = this.volumeLevel > this.SPEECH_THRESHOLD

    return volumeAboveThreshold
      && speakingDuration >= 200
  }
}

function generateUUID(): string {
  return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c: string) =>
    (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4)).toString(16)).replace(/-/g, '')
}
