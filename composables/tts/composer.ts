import { audioStreamPlayer } from './core'
import { getTextToSpeechStream } from './network'

// 常量定义
const SYNTHESIS_INTERVAL = 500 // 合成间隔时间(ms)
const EMPTY_ARRAY_LENGTH = 0 // 空数组长度

export interface AudioStreamCallback {
  (stream: ReadableStream): void
}

export class AudioComposer {
  private textQueue: string[] = []
  private isProcessing: boolean = false
  private lastSynthesisTime: number = 0

  constructor(private callback: AudioStreamCallback) {}

  /**
   * 添加文本到合成队列
   */
  public appendText(text: string): void {
    this.textQueue.push(text)
    this.processQueue()
  }

  /**
   * 清空合成队列
   */
  public clear(): void {
    this.textQueue = []
    this.isProcessing = false
  }

  /**
   * 处理合成队列
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.textQueue.length === EMPTY_ARRAY_LENGTH)
      return

    this.isProcessing = true

    while (this.isProcessing) {
      if (this.textQueue.length <= EMPTY_ARRAY_LENGTH)
        return

      const currentTime = Date.now()
      const timeSinceLastSynthesis = currentTime - this.lastSynthesisTime

      // 确保合成间隔至少500ms
      if (timeSinceLastSynthesis < SYNTHESIS_INTERVAL) {
        await new Promise(resolve =>
          setTimeout(resolve, SYNTHESIS_INTERVAL - timeSinceLastSynthesis),
        )
      }

      const text = this.textQueue.shift()
      console.log('processQueue', this.textQueue.length, text)

      if (text) {
        try {
          // 这里假设有一个synthesize方法来实际执行文本转语音
          // 实际实现时需要集成具体的TTS服务
          const stream = await this.synthesize(text)
          this.callback(stream)
        }
        catch (error) {
          console.error('合成失败:', error)
        }
      }

      this.lastSynthesisTime = Date.now()
    }

    // this.isProcessing = false
  }

  /**
   * 文本转语音合成方法
   * 这个方法需要根据实际使用的TTS服务来实现
   */
  private async synthesize(text: string): Promise<ReadableStream> {
    const stream = await getTextToSpeechStream({
      text,
    })

    console.log('synthesized text', text)

    return stream
  }
}

export const composer = new AudioComposer(async (stream) => {
  const audioStream = await audioStreamPlayer.appendReadableAudio(stream)
  console.log('appendReadableAudio done', audioStream)
})

export function useTestAudio() {
  const audio = new Audio()
  audio.src = '/test_audio.mpga'
  audio.play()

  console.log(audio, audio.src)
}

// @ts-expect-error exist
window.useTestAudio = useTestAudio

// @ts-expect-error exist
window.composer = composer
