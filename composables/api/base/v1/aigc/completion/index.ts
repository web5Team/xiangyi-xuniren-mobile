import { endHttp } from '~/composables/api/axios'
import { ENDS_URL, globalOptions } from '~/constants'

export async function getAIGCCompletionStream(
  question: string,
  onMessage: (message: string) => void,
  onError: (error: any) => void,
  onComplete: () => void,
) {
  // const url = `${globalOptions.getEndsUrl()}bot/chat`

  const controller = new AbortController()

  try {
    const response: ReadableStream = await endHttp.$http({
      url: 'bot/chat',
      method: 'POST',
      data: {
        message: question,
      },
      headers: {
        server: 'true',
        Accept: 'text/event-stream',
      },
      adapter: 'fetch',
      responseType: 'stream',
      signal: controller.signal,
    })
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers: {
    //     'server': 'true',
    //     'Content-Type': 'application/json',
    //     'Authorization': `${userStore.value.token?.accessToken}`,
    //   },
    //   body: JSON.stringify({
    //     message: question,
    //   }),
    //   signal: controller.signal,
    // })

    // if (!response.ok) {
    //   const error = await response.json()
    //   onError(error)
    //   return
    // }

    const reader = response.pipeThrough(new TextDecoderStream()).getReader()
    if (!reader) {
      onError(new Error('No reader available'))
      return
    }

    // const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        onComplete()
        break
      }

      buffer += value
      const messages = buffer.split('\n\n')
      buffer = messages.pop() || ''

      messages.forEach((message) => {
        if (message.startsWith('data: ')) {
          const data = message.slice(6)
          if (data === '[DONE]') {
            onComplete()
          }
          else {
            try {
              const json = JSON.parse(data)
              if (json.data)
                onMessage(json)
            }
            catch (parseError) {
              onError(parseError)
            }
          }
        }
      })
    }
  }
  catch (error) {
    onError(error)
  }

  return controller
}

// 实现一个语音合成流 传入文本 然后返回一个播放和停止的方法 可以一边下载一边播放
export class VoiceSynthesizer {
  private audio: HTMLAudioElement
  private streamController: AbortController
  private isPlaying: boolean
  private textQueue: string[]
  private currentStream: ReadableStream<Uint8Array> | null
  private audioContext: AudioContext | null

  getQueue() {
    return this.textQueue
  }

  constructor() {
    this.audio = new Audio()
    this.streamController = new AbortController()
    this.isPlaying = false
    this.textQueue = []
    this.currentStream = null
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }

  // 请求合成并返回音频文件 URL
  private async fetchAudioStream(text: string): Promise<string> {
    try {
      const response = await endHttp.$http({
        url: 'bot/tts', // 修改接口为 bot/tts
        method: 'POST',
        data: { text },
        headers: { server: 'true' },
        adapter: 'fetch',
        responseType: 'json', // 这里返回 JSON 格式
        signal: this.streamController.signal,
      })

      // 确保响应格式正确
      if (response.code === 1 && response.data && response.data.url)
        return response.data.url
      else
        throw new Error('Failed to get valid audio URL')
    }
    catch (error) {
      console.error('Error fetching audio stream:', error)
      throw error
    }
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
      const audioUrl = await this.fetchAudioStream(text) // 获取音频文件 URL

      // 使用音频 URL 播放
      this.audio.src = audioUrl
      this.audio.play()

      // 等待音频播放结束后，播放下一个
      this.audio.onended = () => {
        if (this.textQueue.length > 0) {
          const nextText = this.textQueue.shift()!

          setTimeout(() => {
            this.playAudioStream(nextText) // 播放下一个文本
          }, 200)
        }
        else {
          this.isPlaying = false // 如果队列为空，停止播放
          console.log('Audio playback finished.')
        }
      }
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
      this.audio.pause() // 停止当前播放
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
}

// 使用示例
export const speechStream = new VoiceSynthesizer()

window.$speechStream = speechStream

// 停止播放
// speechStream.stop();

export class TextAggregator {
  private textBuffer: string = '' // 用来存储累积的文本
  private lastAppendTime: number = Date.now() // 最后一次追加的时间
  private timeout: NodeJS.Timeout | null = null // 超时定时器
  private forceTimeoutDuration: number = 2000 // 超过2秒后强制返回内容
  private minSentenceLength: number = 3 // 最小有效句子长度

  constructor(private callback: (text: string) => void) { }

  // 用来处理追加的文本
  appendText(newText: string): void {
    this.textBuffer += newText // 累积文本
    this.lastAppendTime = Date.now() // 更新最后一次追加的时间

    // 每次接收到新文本后重置定时器
    this.resetTimeout()

    // 只要积累的文本中有完整的句子，就返回
    while (this.shouldFlushSentence()) {
      const sentence = this.extractSentence()
      if (sentence.length >= this.minSentenceLength)
        this.callback(sentence) // 返回有效句子
    }
  }

  // 判断当前文本是否满足返回一个句子的条件
  private shouldFlushSentence(): boolean {
    // 如果遇到结束标点符号或换行符，认为是一句结束
    const sentenceEndSymbols = ['。', '！', '？', '.', '!', '?', '，', ',', '\n']
    for (let i = 0; i < this.textBuffer.length; i++) {
      if (sentenceEndSymbols.includes(this.textBuffer[i]))
        return true
    }
    return false
  }

  // 从积累的文本中提取出完整的句子
  private extractSentence(): string {
    const sentenceEndSymbols = ['。', '！', '？', '.', '!', '?', '，', ',', '\n']
    let sentenceEndIndex = -1

    // 查找第一个句子结束符
    for (let i = 0; i < this.textBuffer.length; i++) {
      if (sentenceEndSymbols.includes(this.textBuffer[i])) {
        sentenceEndIndex = i + 1 // 包含结束符
        break
      }
    }

    if (sentenceEndIndex === -1)
      return '' // 如果没有找到有效结束符，返回空字符串

    // 提取句子
    const sentence = this.textBuffer.slice(0, sentenceEndIndex).trim()
    this.textBuffer = this.textBuffer.slice(sentenceEndIndex).trim() // 清除已经提取的句子

    return sentence
  }

  // 重置定时器，如果 2 秒没有新内容，直接返回当前内容
  private resetTimeout(): void {
    if (this.timeout)
      clearTimeout(this.timeout) // 清除之前的定时器

    // 设置一个新的定时器，如果 2 秒内没有新的追加，自动返回内容
    this.timeout = setTimeout(() => {
      const remainingText = this.textBuffer.trim()
      if (remainingText && !this.isOnlySymbols(remainingText)) {
        this.callback(remainingText) // 调用回调返回剩余内容
        this.textBuffer = '' // 清空当前文本
      }
    }, this.forceTimeoutDuration) // 2秒后自动触发
  }

  // 判断文本是否仅包含符号或空白字符
  private isOnlySymbols(text: string): boolean {
    // 判断文本是否只包含符号或空白字符（不包含实际内容的句子）
    return /^[\s\p{P}]*$/u.test(text) // 如果文本只包含空白符或标点符号，返回 true
  }
}
