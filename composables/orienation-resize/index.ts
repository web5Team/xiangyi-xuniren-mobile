import { useDeviceOrientation } from '@vueuse/core'
import { type ComputedRef, type Ref, computed, onMounted, onUnmounted, ref, watch } from 'vue'

export type DeviceOrientation = 'up' | 'down' | 'left' | 'right' | 'flat'

export function useDeviceOrientationDirection(): ComputedRef<DeviceOrientation> {
  const { beta, gamma } = useDeviceOrientation()
  const previousGamma = ref(0)
  const direction = ref<DeviceOrientation>('flat')

  // 监听gamma值的变化
  watch(gamma, (newGamma) => {
    const gammaValue = newGamma || 0

    if (Math.abs(gammaValue) > 30) {
      // 通过比较当前gamma值和前一个gamma值来确定方向
      if (Math.abs(gammaValue) > Math.abs(previousGamma.value)) {
        // gamma值在增加，说明正在向一个方向倾斜
        direction.value = gammaValue > 0 ? 'right' : 'left'
      }
      // 保持当前方向不变，直到设备回到平面位置
    }
    else {
      direction.value = 'flat'
    }

    previousGamma.value = gammaValue
  })

  return computed(() => direction.value)
}

interface UseRotateElementOptions {
  // 可选的固定尺寸
  defaultWidth?: number
  defaultHeight?: number
  // 是否使用父容器尺寸作为约束
  useParentContainer?: boolean
}

export function useRotateElement(
  el: Ref<HTMLElement | null>,
  orientation: ComputedRef<DeviceOrientation>,
  options: UseRotateElementOptions = {},
) {
  // 存储初始尺寸
  const initialSize = ref({
    width: 0,
    height: 0,
  })

  // 存储父容器尺寸
  const containerSize = ref({
    width: 0,
    height: 0,
  })

  // 获取元素和容器尺寸
  const updateSizes = () => {
    if (!el.value)
      return

    // 获取元素初始尺寸
    const rect = el.value.getBoundingClientRect()
    initialSize.value = {
      width: options.defaultWidth ?? rect.width,
      height: options.defaultHeight ?? rect.height,
    }

    // 获取父容器尺寸
    if (options.useParentContainer && el.value.parentElement) {
      const parentRect = el.value.parentElement.getBoundingClientRect()
      containerSize.value = {
        width: parentRect.width,
        height: parentRect.height,
      }
    }
    else {
      // 使用视窗尺寸
      containerSize.value = {
        width: window.innerWidth,
        height: window.innerHeight,
      }
    }
  }

  // 计算旋转后的尺寸
  const calculateRotatedSize = (originalWidth: number, originalHeight: number, isLandscape: boolean) => {
    // 获取容器尺寸
    const maxWidth = containerSize.value.width
    const maxHeight = containerSize.value.height

    if (isLandscape) {
      // 横向旋转时，使用容器的高度作为宽度，宽度作为高度
      return {
        width: maxHeight,
        height: maxWidth,
      }
    }

    // 竖直方向时直接使用容器尺寸
    return {
      width: maxWidth,
      height: maxHeight,
    }
  }

  // 监听方向变化并更新样式
  watch(orientation, (newOrientation) => {
    if (!el.value)
      return

    const isLandscape = newOrientation === 'left' || newOrientation === 'right'
    const { width, height } = calculateRotatedSize(
      initialSize.value.width,
      initialSize.value.height,
      isLandscape,
    )

    // 重置样式
    el.value.style.transform = ''
    el.value.style.width = `${width}px`
    el.value.style.height = `${height}px`

    switch (newOrientation) {
      case 'left':
      case 'right': {
        const degree = newOrientation === 'left' ? 90 : -90
        // 旋转时的位置调整，确保居中且铺满屏幕
        const translateX = (height - width) / 2
        const translateY = (width - height) / 2
        el.value.style.transform = `rotate(${degree}deg) translate(${translateX}px, ${translateY}px)`
        el.value.style.transformOrigin = 'center center'
        break
      }
      case 'up':
      case 'down': {
        const degree = newOrientation === 'up' ? 180 : 0
        el.value.style.transform = `rotate(${degree}deg)`
        break
      }
      case 'flat':
      default:
        break
    }
  }, { immediate: true })

  // 在组件挂载时获取初始尺寸
  onMounted(() => {
    updateSizes()
    // 监听窗口大小变化
    window.addEventListener('resize', updateSizes)
  })

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener('resize', updateSizes)
  })
}
