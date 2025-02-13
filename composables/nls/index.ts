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

  private isSpeaking: boolean = false
  private silenceTimer: NodeJS.Timeout | null = null
  private readonly MAX_SILENCE_DURATION = 8000 // 8秒无声自动断开
  private lastSpeechTime: number = Date.now()

  private speakingBus = useEventBus<boolean>('ON_SPEAKING_STATUS')
  private lastSpeakingState: boolean = false
  private isMonitoring: boolean = false

  // 添加新的配置参数
  private readonly SPEECH_THRESHOLD = 0.018 // 声音检测阈值
  private volumeLevel: number = 0

  private animationFrameId: number | null = null
  private readonly LOG_OUTPUT_INTERVAL = 3000 // 3秒输出一次日志
  private lastLogTime: number = 0
  private isProcessingAudio: boolean = false

  private hasStartedTranscription: boolean = false // 添加新状态跟踪是否已发送识别指令

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
    await this.startConnection()
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

  async startConnection() {
    if (!this.token)
      throw new Error('Token is not set')

    log('[NLS] 开始建立WebSocket连接...', 'highlight')
    const socketUrl = `${END_URL}?token=${this.token}`
    log(`[NLS] WebSocket URL: ${socketUrl}`, 'info')

    const websocket = this.ws = new WebSocket(socketUrl)

    websocket.onopen = () => {
      log('[NLS] ✅ WebSocket连接已建立', 'success')
      this.updateStatus(SpeechStatus.CONNECTED)
      this.startSilenceDetection()
      this.sendStartTranscription() // 移到单独的方法中
    }

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data) as RootObject
      this.dataBus.emit(message)

      // 根据不同消息类型记录日志
      switch (message.header.name) {
        case 'TranscriptionStarted':
          log('[NLS] 🎯 开始语音识别', 'success')
          this.updateStatus(SpeechStatus.Ready)
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
        task_id: generateUUID(),
        message_id: generateUUID(),
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
          task_id: generateUUID(),
          message_id: generateUUID(),
        },
      }
      this.ws.send(JSON.stringify(stopTranscriptionMessage))
      this.hasStartedTranscription = false // 重置状态
      log('[NLS] 停止识别指令已发送', 'info')

      this.ws?.close()
      log('[NLS] WebSocket连接已关闭', 'info')
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

        // 检测到说话时，确保已发送识别指令
        if (this.isSpeaking && !wasSpeaking)
          this.sendStartTranscription()

        // 只在状态改变时输出音量日志
        if (this.isSpeaking !== wasSpeaking) {
          const status = this.isSpeaking ? '开始说话' : '停止说话'
          log(`[NLS] 🎤 ${status} - 音量: ${rms.toFixed(6)}`, this.isSpeaking ? 'success' : 'warning')
          this.speakingBus.emit(this.isSpeaking)
        }

        if (this.isSpeaking)
          this.lastSpeechTime = Date.now()

        // 说话时，连接存在就发送音频数据
        if (this.ws?.readyState === WebSocket.OPEN) {
          // let inputData16: Int16Array | null = null

          if (this.isSpeaking) {
            const inputData16 = new Int16Array(inputData.length)

            for (let i = 0; i < inputData.length; ++i)
              inputData16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF

            this.ws.send(inputData16.buffer)

            // log(`[NLS] 📊 发送音频数据 - 音量: ${rms.toFixed(6)}, 数据长度: ${inputData16.length}`, 'info')
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

  // 添加新方法用于完全停止音频监测
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
}

function generateUUID(): string {
  return `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, (c: string) =>
    (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4)).toString(16)).replace(/-/g, '')
}
