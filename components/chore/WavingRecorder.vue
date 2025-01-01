<script>
import { onBeforeUnmount, onMounted, ref } from 'vue'

export default {
  props: {
    audioStream: {
      type: MediaStream,
      required: true,
    },
  },
  setup(props) {
    const canvas = ref(null)
    let audioContext = null
    let analyser = null
    let dataArray = null
    let canvasCtx = null
    let animationFrameId = null
    let source = null

    // 可配置参数
    const amplitudeScale = 3 // 振幅缩放系数，值越大，波形上下波动幅度越大
    const smoothing = 0.8 // 平滑系数 (0 到 1，值越大越平滑)
    const lineWidth = 15 // 线条宽度
    const waveColor = '#8E6FF7' // 波形颜色
    const threshold = 0.85 // 波动阈值，小于该值的波动将被过滤掉

    let previousData = null

    // 初始化音频分析器
    const initAnalyser = () => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()

      analyser = audioContext.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = smoothing

      const bufferLength = analyser.frequencyBinCount
      dataArray = new Uint8Array(bufferLength)
      previousData = new Float32Array(bufferLength)
    }

    // 绘制波形图
    const drawWaveform = () => {
      analyser.getByteTimeDomainData(dataArray)
      canvasCtx.fillStyle = 'rgb(255, 255, 255)'
      canvasCtx.fillRect(0, 0, canvas.value.width, canvas.value.height)
      canvasCtx.lineWidth = lineWidth
      canvasCtx.strokeStyle = waveColor
      canvasCtx.beginPath()

      const sliceWidth = (canvas.value.width * 5.0) / dataArray.length
      const centerY = -canvas.value.height * 1
      let x = 0

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.value.height * amplitudeScale) / 2

        // 插值
        if (previousData[i] !== undefined)
          previousData[i] = previousData[i] * smoothing + y * (1 - smoothing)
        else
          previousData[i] = y

        if (Math.abs(previousData[i]) < threshold)
          previousData[i] = 0

        if (i === 0)
          canvasCtx.moveTo(x, centerY + previousData[i])
        else
          canvasCtx.lineTo(x, centerY + previousData[i])

        x += sliceWidth
      }

      canvasCtx.stroke()
      animationFrameId = requestAnimationFrame(drawWaveform) // 请求下一帧
    }

    const startVisualization = () => {
      if (!props.audioStream) {
        console.error('No audio stream provided')
        return
      }

      initAnalyser()
      source = audioContext.createMediaStreamSource(props.audioStream)
      source.connect(analyser)

      drawWaveform()
    }

    const stopVisualization = () => {
      if (source)
        source.disconnect()

      cancelAnimationFrame(animationFrameId)
    }

    onMounted(() => {
      canvasCtx = canvas.value.getContext('2d')

      startVisualization()
    })

    onBeforeUnmount(() => {
      stopVisualization()
    })

    return {
      canvas,
      startVisualization,
      stopVisualization,
    }
  },
}
</script>

<template>
  <div class="WavinGRecorder">
    <canvas ref="canvas" width="600" height="200" />
  </div>
</template>

<style lang="scss" scoped>
.WavinGRecorder {
  canvas {
    width: 200px;
  }

  margin: 0 auto;

  width: 120px;

  overflow: hidden;
  // transform: scale(1.5);
}
</style>
