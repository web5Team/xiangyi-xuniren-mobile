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

  // 修改暂停方法
  public pause() {
    if (!this.isPaused) {
      this.isPaused = true
      this.lastPausedTime = this.audioContext.currentTime
      this.audioContext.suspend()
    }
  }

  // 修改恢复播放方法
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

  // 修改清空方法
  public clear() {
    this.isPaused = false
    this.isPlaying = false
    this.playStartTime = 0
    this.lastPausedTime = 0
    this.audioBufs = []
    this.audioContext.suspend()
  }

  // 销毁实例
  public destroy() {
    this.clear()
    this.recorder.close()
    this.audioContext.close()
  }

  // 添加新方法处理 ReadableStream
  public async appendReadableAudio(stream: ReadableStream<Uint8Array>) {
    const reader = stream.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break

        // 将 Uint8Array 转换为 ArrayBuffer 并添加到播放队列
        this.appendAudio(value.buffer as ArrayBuffer)
      }
    }
    catch (error) {
      console.error('读取音频流失败:', error)
    }
    finally {
      reader.releaseLock()
    }
  }
}

export default AudioStreamPlayer
