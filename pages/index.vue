<script setup lang="ts">
import MainPage from '~/components/chore/model/MainPage.vue'
import { AnimationInterval, IAnimationInterval, modelManager } from '~/composables/model'
import { PoseManager, Posed } from '~/composables/model/pose'

const dom = ref<HTMLElement>()
const container = ref<HTMLElement>()
const progress = ref(0)
const { x, y } = useMouse()

onMounted(() => {
  modelManager.modelLoadBus.on((p: number) => {
    progress.value = p

    if (p >= 100) {
      setTimeout(() => {
        dom.value?.attributes.removeNamedItem('op-0')
        container.value?.attributes.removeNamedItem('op-0')
      }, 200)
    }
  })

  modelManager.load(dom.value!)

  modelManager.modelLoadEndBus.on(() => {
    // let applied = -1
    const poseManager = new PoseManager(Posed.HiPose)
    const yePoseManager = new PoseManager(Posed.YePose)
    modelManager.onAnimate((vrm) => {
      modelManager.updateEye(x.value, y.value, vrm)

      yePoseManager.apply(vrm)
    })

    const blinkInterval = new AnimationInterval(10, (vrm: any) => {
      const now = Date.now()
      const lastBlink = blinkInterval.data.lastBlink || -1
      if (now - lastBlink < 2000)
        return

      if (blinkInterval.data.closing)
        blinkInterval.data.weight -= 8
      else
        blinkInterval.data.weight += 8

      const expression = modelManager.useExpression('blink', vrm)

      expression.weight = blinkInterval.data.weight / 100

      if (expression.weight >= 0.9) {
        blinkInterval.data.closing = true
      }
      else if (blinkInterval.data.closing && expression.weight <= 0.1) {
        // console.log('blink end wait for next')
        blinkInterval.data.lastBlink = now
        blinkInterval.data.weight = 0

        blinkInterval.data.closing = false
      }
    })
    blinkInterval.data.weight = 0
    modelManager.onInterval(blinkInterval)

    // modelManager.onAnimate((vrm) => {

    // })
  })

  useEventListener('resize', () => modelManager.resize(dom.value))
})

const modelComponent = ref<Component>(MainPage)

async function changeModelPage(targetComponent: Component, modelShow: boolean = true) {
  const el = container.value
  console.log({ el })
  if (!el) {
    modelComponent.value = targetComponent
    return
  }

  el.style.opacity = '0'

  if (dom.value)
    dom.value!.style.opacity = modelShow ? '1' : '0'

  await sleep(300)

  modelComponent.value = targetComponent

  await sleep(300)

  el.style.opacity = '1'
}

provide('changeModelPage', changeModelPage)
</script>

<template>
  <div class="ModelPage">
    <div ref="dom" op-0 class="ModelPage-Model transition-cubic" />

    <div ref="container" op-0 class="ModelPage-Container transition-cubic">
      <component :is="modelComponent" />
    </div>

    <div class="ModelPage-Mask">
      <div
        :class="{ hide: progress >= 100 }" :style="`--p: ${progress}%`"
        class="ModelPage-Mask-Progress transition-cubic"
      >
        <div class="ModelPage-Mask-Progress-Inner transition-cubic" />
        <div class="ModelPage-Mask-Progress-Bg transition-cubic" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.ModelPage-Mask {
  &-Progress {
    &.hide {
      opacity: 0;
      pointer-events: none !important;
    }

    div {
      position: absolute;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      background-color: var(--theme-color);
    }

    &-Bg {
      opacity: 0.25 !important;
    }

    &-Inner {
      width: var(--p) !important;
    }

    position: absolute;

    top: 50%;
    left: 50%;

    width: 80%;
    height: 20px;

    overflow: hidden;
    border-radius: 4px;
    transform: translate(-50%, -50%);
  }

  z-index: 1;
  position: absolute;

  top: 50%;
  left: 50%;

  width: 85vmin;
  height: 85vmin;

  transform: translate(-50%, -50%);
}

.ModelPage-Container {
  z-index: 2;
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}

.ModelPage {
  &-Model {
    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  width: 100%;
  height: 100%;

  background-color: var(--el-bg-color);
}
</style>
