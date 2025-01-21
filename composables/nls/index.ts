import * as Nls from 'alibabacloud-nls'

const sleep = waitTimeInMs => new Promise(resolve => setTimeout(resolve, waitTimeInMs))

const END_URL = 'wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1'
const APPKEY = 'ckxnZMvhbPN4jD6g' // 获取Appkey请前往控制台：https://nls-portal.console.aliyun.com/applist
const TOKEN = 'c63b5f4f89a44ce7b5defb391f837630' // 获取Token具体操作，请参见：https://help.aliyun.com/document_detail/450514.html

export class SpeechTranscriptionService {
  private audioStream: MediaStream | null = null
  private audioChunks: Blob[] = []

  constructor(audioStream: MediaStream) {
    this.audioStream = audioStream
    const mediaRecorder = new MediaRecorder(this.audioStream)

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0)
        this.audioChunks.push(event.data)
    }

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioData = new Uint8Array(arrayBuffer)

      // while (true) {
      const st = new Nls.SpeechTranscription({
        url: END_URL,
        appkey: APPKEY,
        token: TOKEN,
      })

      console.log('start to connect', { st, mediaRecorder }, END_URL)

      st.on('started', (msg) => {
        console.log('Client recv started:', msg)
      })

      st.on('changed', (msg) => {
        console.log('Client recv changed:', msg)
      })

      st.on('completed', (msg) => {
        console.log('Client recv completed:', msg)
        this.result += msg.result
      })

      st.on('closed', () => {
        console.log('Client recv closed')
      })

      st.on('failed', (msg) => {
        console.log('Client recv failed:', msg)
      })

      st.on('begin', (msg) => {
        console.log('Client recv begin:', msg)
      })

      st.on('end', (msg) => {
        console.log('Client recv end:', msg)
      })

      try {
        await st.start(st.defaultStartParams(), true, 6000)
      }
      catch (error) {
        console.log('error on start:', error)
        console.warn(error)
        // continue
      }

      try {
        if (!st.sendAudio(audioData))
          throw new Error('send audio failed')

        await sleep(20)
      }
      catch (error) {
        console.log('sendAudio failed:', error)
        // continue
      }

      try {
        console.log('close...')
        await st.close()
      }
      catch (error) {
        console.log('error on close:', error)
      }
      await sleep(2000)
      // break // 仅进行一次识别
      // }
    }

    mediaRecorder.start()
  }

  private result = ''

  async transcribe(): Promise<string> {
    return new Promise((resolve) => {
      resolve(this.result)
    })
  }
}
