import { createTapTip } from '../tip'

const END_URL = 'wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1'
const APPKEY = 'ckxnZMvhbPN4jD6g' // 获取Appkey请前往控制台：https://nls-portal.console.aliyun.com/applist
const TOKEN = '6a38d4fe38c94abba2bce34d3cc04c9b' // 获取Token具体操作，请参见：https://help.aliyun.com/document_detail/450514.html

export enum SpeechStatus {
  CONNECTING = 'Connecting',
  DISCONNECTED = 'Disconnected',
  CONNECTED = 'Connected',

  Ready = 'Ready',
  Listening = 'Listening',
  // Processing = 'Processing',
  End = 'End',

  Error = 'Error',
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

  cacheSentence: string = ''

  status: SpeechStatus = SpeechStatus.DISCONNECTED
  statusBus = useEventBus<SpeechStatus>('ON_STATUS_UPDATED')
  sentenceBus = useEventBus<Payload>('ON_SENTENCE')
  sentenceCacheBus = useEventBus<Payload>('ON_SENTENCE_CACHE')
  dataBus = useEventBus<RootObject>('ON_DATA')

  updateStatus(status: SpeechStatus) {
    this.status = status
    this.statusBus.emit(status)
  }

  async connect() {
    this.updateStatus(SpeechStatus.CONNECTING)

    const socketUrl = `${END_URL}?token=${TOKEN}`

    const websocket = this.ws = new WebSocket(socketUrl)

    websocket.onopen = () => {
      this.updateStatus(SpeechStatus.CONNECTED)

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

      websocket.send(JSON.stringify(startTranscriptionMessage))
    }

    const tiptap = createTapTip()

    websocket.onmessage = (event) => {
      console.log(`服务端: ${event.data}`)

      const message = JSON.parse(event.data) as RootObject

      this.dataBus.emit(message)

      if (message.header.name === 'TranscriptionStarted') { this.updateStatus(SpeechStatus.Ready) }
      else if (message.header.name === 'SentenceBegin') {
        this.cacheSentence = ''
        this.sentenceCacheBus.emit(message.payload)

        tiptap.setLoading(true).setType(TipType.INFO).setMessage('识别中...').setStay(-1).show()
      }
      else if (message.header.name === 'TranscriptionResultChanged') {
        this.cacheSentence = message.payload.result
        this.sentenceCacheBus.emit(message.payload)
      }
      else if (message.header.name === 'SentenceEnd') {
        this.cacheSentence = message.payload.result
        this.sentenceCacheBus.emit(message.payload)

        this.sentenceBus.emit(message.payload)

        tiptap.setLoading(false).setType(TipType.SUCCESS).setMessage('识别完成').setStay(2200).show()
      }
      else if (message.header.name === 'TaskFailed') {
        console.error('Task failed:', message.payload)

        tiptap.setLoading(false).setType(TipType.ERROR).setMessage('无法完成识别').setStay(3000).show()
      }
    }

    websocket.onerror = (event) => {
      this.updateStatus(SpeechStatus.Error)

      console.error('WebSocket error observed:', event)
    }

    websocket.onclose = () => {
      this.updateStatus(SpeechStatus.DISCONNECTED)
    }
  }

  disconnect() {
    this.ws?.close()
  }

  async startRecording(audioStream: MediaStream) {
    if (this.status === SpeechStatus.DISCONNECTED) {
      console.error('WebSocket is not connected')
      return
    }

    try {
      // 获取音频输入设备
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      })
      this.audioInput = this.audioContext.createMediaStreamSource(audioStream)

      // 设置缓冲区大小为2048的脚本处理器
      this.scriptProcessor = this.audioContext.createScriptProcessor(2048, 1, 1)

      this.scriptProcessor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0)
        const inputData16 = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; ++i)
          inputData16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF // PCM 16-bit

        if (this.ws && this.ws.readyState === WebSocket.OPEN)
          this.ws.send(inputData16.buffer)
      }

      this.audioInput.connect(this.scriptProcessor)
      this.scriptProcessor.connect(this.audioContext.destination)

      this.updateStatus(SpeechStatus.Listening)
    }
    catch (e) {
      console.error('Start record error', e)
    }
  }

  stopRecording() {
    if (this.scriptProcessor)
      this.scriptProcessor.disconnect()

    if (this.audioInput)
      this.audioInput.disconnect()

    // if (this.audioStream)
    //   this.audioStream.getTracks().forEach(track => track.stop())

    if (this.audioContext)
      this.audioContext.close()

    this.updateStatus(SpeechStatus.End)
  }
}

function generateUUID() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)).replace(/-/g, '')
}
