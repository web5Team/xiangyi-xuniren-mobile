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
    const canvas = ref(null) // Canvas 元素
    let audioContext = null // Web Audio API 上下文
    let analyser = null // 分析器节点
    let dataArray = null // 存储音频数据的数组
    let canvasCtx = null // Canvas 上下文
    let animationFrameId = null // 动画帧 ID
    let source = null // 音频源节点

    // 可配置参数
    const amplitudeScale = 3 // 振幅缩放系数，值越大，波形上下波动幅度越大
    const smoothing = 0.8 // 平滑系数 (0 到 1，值越大越平滑)
    const lineWidth = 15 // 线条宽度
    const waveColor = '#8E6FF7' // 波形颜色
    const threshold = 0.85 // 波动阈值，小于该值的波动将被过滤掉

    let previousData = null // 用于存储上一帧的数据

    // 初始化音频分析器
    const initAnalyser = () => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 1024 // 设置 FFT 大小
      analyser.smoothingTimeConstant = smoothing // 设置平滑系数
      const bufferLength = analyser.frequencyBinCount
      dataArray = new Uint8Array(bufferLength) // 初始化数据数组
      previousData = new Float32Array(bufferLength) // 初始化上一帧数据
    }

    // 开始绘制波形
    const startVisualization = () => {
      if (!props.audioStream) {
        console.error('No audio stream provided')
        return
      }
      initAnalyser() // 初始化分析器
      source = audioContext.createMediaStreamSource(props.audioStream) // 创建音频源
      source.connect(analyser) // 连接分析器
      drawWaveform() // 开始绘制
    }

    // 停止绘制波形
    const stopVisualization = () => {
      if (source)
        source.disconnect() // 断开音频源

      cancelAnimationFrame(animationFrameId) // 停止动画帧
    }

    // 绘制波形图
    const drawWaveform = () => {
      analyser.getByteTimeDomainData(dataArray) // 获取时域数据
      canvasCtx.fillStyle = 'rgb(255, 255, 255)' // 清空画布
      canvasCtx.fillRect(0, 0, canvas.value.width, canvas.value.height)
      canvasCtx.lineWidth = lineWidth // 设置线条宽度
      canvasCtx.strokeStyle = waveColor // 设置线条颜色
      canvasCtx.beginPath()

      const sliceWidth = (canvas.value.width * 5.0) / dataArray.length // 计算每个数据点的宽度
      const centerY = -canvas.value.height * 1 // Canvas 的中心 Y 坐标
      let x = 0

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0 // 归一化数据
        const y = (v * canvas.value.height * amplitudeScale) / 2 // 计算 Y 坐标，应用振幅缩放

        // 平滑处理：与上一帧的数据进行插值
        if (previousData[i] !== undefined)
          previousData[i] = previousData[i] * smoothing + y * (1 - smoothing)
        else
          previousData[i] = y

        // 过滤掉小于阈值的波动
        if (Math.abs(previousData[i]) < threshold)
          previousData[i] = 0

        if (i === 0)
          canvasCtx.moveTo(x, centerY + previousData[i]) // 移动到起点
        else
          canvasCtx.lineTo(x, centerY + previousData[i]) // 绘制线条

        x += sliceWidth // 更新 X 坐标
      }

      canvasCtx.stroke() // 描边
      animationFrameId = requestAnimationFrame(drawWaveform) // 请求下一帧
    }

    // 组件挂载时初始化 Canvas 上下文
    onMounted(() => {
      canvasCtx = canvas.value.getContext('2d')

      startVisualization()
    })

    // 组件卸载时停止绘制
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
