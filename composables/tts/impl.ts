import Recorder from 'recorder-core'
import 'recorder-core/src/engine/mp3-engine'
import 'recorder-core/src/extensions/waveview'
import { Logger } from '../utils/logger'

// 可选的插件支持项，把需要的插件按需引入进来即可

class AudioStreamPlayer {
  private recorder: any
  private isPlaying: boolean = false
  private isPaused: boolean = false
  private audioContext: AudioContext
  private playStartTime: number = 0
  private audioBufs: any[] = []
  private lastPausedTime: number = 0 // 记录暂停时的时间点
  private isDestroyed: boolean = false // 新增：标记是否已销毁
  private logger: Logger
  private activeSource: AudioBufferSourceNode | null = null // 新增：跟踪当前播放的音频源

  getIsPlaying() {
    return this.isPlaying
  }

  constructor() {
    this.logger = new Logger('AudioStreamPlayer')
    this.audioContext = new AudioContext()

    // 添加状态检查
    this.logger.info('AudioContext state:', this.audioContext.state)

    // 尝试恢复 AudioContext
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        this.logger.info('AudioContext resumed successfully')
      })
    }

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

  public appendAudio(audioData: ArrayBuffer) {
    if (!audioData || audioData.byteLength === 0 || this.isDestroyed)
      return

    this.logger.info('收到音频数据，大小:', audioData.byteLength)

    this.audioBufs.push({
      data: audioData,
      time: Date.now(),
    })

    // 如果当前没有在播放且没有暂停，开始播放
    if (!this.isPlaying && !this.isPaused)
      this.decodeAndPlay()
  }

  private async decodeAndPlay() {
    // 如果已经在播放或已销毁，则不执行
    if (this.isDestroyed)
      return

    this.isPlaying = true

    this.logger.info('开始解码和播放，缓冲区长度:', this.audioBufs.length)

    while (this.audioBufs.length > 0 && !this.isDestroyed) {
      const buf = this.audioBufs[0]

      try {
        const audioBuffer = await this.audioContext.decodeAudioData(buf.data)
        this.logger.info('音频解码成功，时长:', audioBuffer.duration)

        const source = this.audioContext.createBufferSource()
        this.activeSource = source // 保存当前音频源的引用
        source.buffer = audioBuffer
        source.connect(this.audioContext.destination)

        if (this.playStartTime === 0)
          this.playStartTime = this.audioContext.currentTime

        source.onended = () => {
          // 当前片段播放结束
          if (!this.isDestroyed && !this.isPaused) {
            // 继续检查并播放队列中的下一个
            setTimeout(() => {
              this.checkAndPlay()
            }, 100)
          }
        }

        this.logger.info('开始播放片段，当前时间:', this.playStartTime)
        source.start(this.playStartTime)
        this.playStartTime += audioBuffer.duration

        this.audioBufs.shift()
      }
      catch (e) {
        this.logger.error('解码音频失败:', e)
        this.audioBufs.shift()
      }
    }

    this.isPlaying = false
    // 检查是否还有新的音频需要播放
    this.checkAndPlay()
  }

  // 新增：检查并播放方法
  private checkAndPlay() {
    if (!this.isDestroyed && !this.isPaused && this.audioBufs.length > 0 && !this.isPlaying)
      this.decodeAndPlay()
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

    // 立即停止当前正在播放的音频
    if (this.activeSource) {
      try {
        this.activeSource.stop()
      }
      catch (e) {
        this.logger.error('停止当前音频源时出错:', e)
      }
      this.activeSource = null
    }

    this.audioBufs = []
  }

  public destroy() {
    this.isDestroyed = true
    this.clear()
    this.recorder.close()
    this.audioContext.close()
  }

  // 修改 appendReadableAudio 方法
  public async appendReadableAudio(stream: ReadableStream<Uint8Array>) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        const reader = stream.getReader()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done)
              break

            this.appendAudio(value.buffer as ArrayBuffer)
          }

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
      }, 50)
    })
  }

  public async initialize() {
    try {
      await this.audioContext.resume()
      this.logger.info('AudioContext 已就绪:', this.audioContext.state)
      return true
    }
    catch (error) {
      this.logger.error('AudioContext 初始化失败:', error)
      return false
    }
  }
}

export default AudioStreamPlayer
