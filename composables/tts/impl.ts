import Recorder from 'recorder-core'
import 'recorder-core/src/engine/mp3-engine'
import 'recorder-core/src/extensions/waveview'

// 可选的插件支持项，把需要的插件按需引入进来即可

class AudioStreamPlayer {
  private recorder: any
  private isPlaying: boolean = false
  private isPaused: boolean = false
  private audioContext: AudioContext
  private playStartTime: number = 0
  private audioBufs: any[] = []
  private lastPausedTime: number = 0 // 新增：记录暂停时的时间点
  private synthesisQueue: Array<() => Promise<void>> = [] // 新增：合成请求队列
  private isProcessingQueue: boolean = false // 新增：是否正在处理队列
  private lastSynthesisTime: number = 0 // 新增：上次合成的时间戳
  private abortController: AbortController | null = null // 新增：用于取消请求

  getIsPlaying() {
    return this.isPlaying
  }

  constructor() {
    this.audioContext = new AudioContext()

    // 初始化 recorder
    this.recorder = Recorder({
      type: 'mp3',
      sampleRate: 16000,
      bitRate: 16,
      onProcess: (_buffers: any[], _powerLevel: number, _duration: number, _sampleRate: number) => {
        // 实时录音处理回调
      },
    })
  }

  // 修改 appendAudio 方法，移除暂停检查
  public appendAudio(audioData: ArrayBuffer) {
    // 将音频数据添加到缓冲区，无论是否暂停都接收
    this.audioBufs.push({
      data: audioData,
      time: Date.now(),
    })

    // 只有在播放状态且未暂停时才进行解码播放
    if (!this.isPlaying && !this.isPaused)
      this.decodeAndPlay()
  }

  private async decodeAndPlay() {
    this.isPlaying = true

    while (this.audioBufs.length > 0) {
      const buf = this.audioBufs[0]

      try {
        const audioBuffer = await this.audioContext.decodeAudioData(buf.data)
        const source = this.audioContext.createBufferSource()
        source.buffer = audioBuffer
        source.connect(this.audioContext.destination)

        if (this.playStartTime === 0)
          this.playStartTime = this.audioContext.currentTime

        source.start(this.playStartTime)
        this.playStartTime += audioBuffer.duration

        this.audioBufs.shift()
      }
      catch (e) {
        console.error('解码音频失败:', e)
        this.audioBufs.shift()
      }
    }

    this.isPlaying = false
  }

  public pause() {
    if (!this.isPaused) {
      this.isPaused = true
      this.lastPausedTime = this.audioContext.currentTime
      this.audioContext.suspend()
    }
  }

  public resume() {
    if (this.isPaused) {
      this.isPaused = false
      // 调整 playStartTime 以确保从正确的时间点继续播放
      const timeDiff = this.audioContext.currentTime - this.lastPausedTime
      this.playStartTime += timeDiff
      this.audioContext.resume()
      this.decodeAndPlay()
    }
  }

  public clear() {
    this.isPaused = false
    this.isPlaying = false
    this.playStartTime = 0
    this.lastPausedTime = 0
    this.audioBufs = []
    this.audioContext.suspend()
    // 新增：清除合成队列和终止当前请求
    this.synthesisQueue = []
    this.isProcessingQueue = false
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  // 销毁实例
  public destroy() {
    this.clear()
    this.recorder.close()
    this.audioContext.close()
  }

  // 修改 appendReadableAudio 方法
  public async appendReadableAudio(stream: ReadableStream<Uint8Array>) {
    return new Promise<void>((resolve, reject) => {
      // 将新的合成请求添加到队列
      this.synthesisQueue.push(async () => {
        // 确保合成间隔至少1秒
        const now = Date.now()
        const timeSinceLastSynthesis = now - this.lastSynthesisTime
        if (timeSinceLastSynthesis < 1000)
          await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastSynthesis))

        this.abortController = new AbortController()
        const reader = stream.getReader()

        try {
          while (true) {
            // 检查是否被取消
            if (this.abortController.signal.aborted) {
              reader.releaseLock()
              throw new Error('Synthesis cancelled')
            }

            const { done, value } = await reader.read()
            if (done)
              break

            this.appendAudio(value.buffer as ArrayBuffer)
          }
          this.lastSynthesisTime = Date.now()
          resolve()
        }
        catch (error: any) {
          if (error.message === 'Synthesis cancelled')
            resolve() // 如果是主动取消，则正常结束
          else
            reject(error)
        }
        finally {
          reader.releaseLock()
        }
      })

      // 如果队列没有在处理，开始处理
      if (!this.isProcessingQueue)
        this.processQueue()
    })
  }

  // 新增：处理合成队列的方法
  private async processQueue() {
    if (this.isProcessingQueue)
      return

    this.isProcessingQueue = true

    while (this.synthesisQueue.length > 0) {
      const synthesisTask = this.synthesisQueue[0]
      try {
        await synthesisTask()
      }
      catch (error) {
        console.error('合成任务执行失败:', error)
      }
      this.synthesisQueue.shift()
    }

    this.isProcessingQueue = false
  }
}

export default AudioStreamPlayer
