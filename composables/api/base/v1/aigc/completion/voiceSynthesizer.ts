export class VoiceSynthesizer {
  private audio: SpeechSynthesisUtterance | null // 修改: 使用 SpeechSynthesisUtterance
  private streamController: AbortController
  private isPlaying: boolean
  private textQueue: string[]
  private currentStream: ReadableStream<Uint8Array> | null
  private audioContext: AudioContext | null

  getQueue() {
    return this.textQueue
  }

  constructor() {
    this.audio = null // 修改: 初始化为 null
    this.streamController = new AbortController()
    this.isPlaying = false
    this.textQueue = []
    this.currentStream = null
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }

  // 将新文本追加到队列中
  public appendText(text: string): void {
    this.textQueue.push(text) // 将新文本加入队列
    if (!this.isPlaying)
      this.start() // 如果没有在播放，启动播放
  }

  // 播放音频流
  private async playAudioStream(text: string): Promise<void> {
    try {
      if (this.audio)
        speechSynthesis.cancel() // 停止之前的语音合成

      this.audio = new SpeechSynthesisUtterance(text)
      this.audio.onend = async () => {
        await sleep(1200)

        if (this.textQueue.length > 0) {
          const nextText = this.textQueue.shift()!
          setTimeout(() => {
            this.playAudioStream(nextText) // 播放下一个文本
          }, 3000)
        }
        else {
          this.isPlaying = false // 如果队列为空，停止播放
          console.log('Audio playback finished.')

          this._sppechEndCallback?.()
        }
      }

      this.audio.onerror = (event) => {
        console.error('Speech synthesis error:', event)
        this.isPlaying = false
      }

      speechSynthesis.speak(this.audio)
    }
    catch (error) {
      console.error('Error during audio playback:', error)
      this.isPlaying = false
    }
  }

  // 启动播放
  public async start(): Promise<void> {
    if (this.isPlaying) {
      console.warn('Audio is already playing.')
      return
    }

    this.isPlaying = true

    // 从文本队列中读取并播放文本
    while (this.textQueue.length > 0) {
      const text = this.textQueue.shift()!
      await this.playAudioStream(text) // 播放并等待当前片段播放完
    }

    this.isPlaying = false
  }

  // 停止播放
  public stop(): void {
    if (this.isPlaying) {
      this.streamController.abort() // 终止流的下载
      if (this.audio)
        speechSynthesis.cancel() // 停止当前播放

      this.isPlaying = false
      this.textQueue = [] // 清空缓存队列
      console.log('Audio playback stopped.')
    }
    else {
      console.warn('No audio is playing.')
    }
  }

  // 清除缓存
  public clearCache(): void {
    this.textQueue = []
    this.isPlaying = false
    console.log('Audio cache cleared.')
  }

  _sppechEndCallback: any

  public onSpeechEnd(callback: () => void) {
    this._sppechEndCallback = callback
  }
}
