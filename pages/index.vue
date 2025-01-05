<script setup lang="ts">
import TouchDialog from '~/components/dialog/TouchDialog.vue'
import MainPage from '~/components/chore/model/MainPage.vue'
import { AnimationInterval, modelManager } from '~/composables/model'
import { PoseManager, Posed } from '~/composables/model/pose'
import { toggleManager } from '~/composables/model/toggle'
import { AnimationManager } from '~/composables/model/animations'
import StandardWalk from '~/composables/model/xymalegltf/Hip Hop Dancing.fbx?url'
import { Viewer } from '~/composables/model/vrmViewer/viewer'
import model from '/xyfemale.vrm'

const dom = ref<HTMLElement>()
const container = ref<HTMLElement>()
const progress = ref(0)
const { x, y } = useMouse()
const shareDialog = ref(false)

onMounted(() => {
  dom.value?.attributes.removeNamedItem('op-0')
  container.value?.attributes.removeNamedItem('op-0')

  const canvas = dom.value!.querySelector('canvas') as HTMLCanvasElement
  const viewer = new Viewer()

  viewer.setup(canvas)

  console.log({ viewer })
  viewer.loadVrm(model)
  // modelManager.modelLoadBus.on((p: number) => {
  //   progress.value = p

  //   if (p >= 100) {
  //     setTimeout(() => {
  //       dom.value?.attributes.removeNamedItem('op-0')
  //       container.value?.attributes.removeNamedItem('op-0')
  //     }, 200)
  //   }
  // })

  // modelManager.load(dom.value!)

  // modelManager.modelLoadEndBus.on(() => {
  //   // const poseManager = new PoseManager(Posed.HiPose)
  //   const yePoseManager = new PoseManager(Posed.YePose)
  //   modelManager.onAnimate((vrm) => {
  //     modelManager.updateEye(x.value, y.value, vrm)

  //     yePoseManager.apply(vrm)
  //   })

  //   const blinkInterval = new AnimationInterval(10, (vrm: any) => {
  //     const now = Date.now()
  //     const lastBlink = blinkInterval.data.lastBlink || -1
  //     if (now - lastBlink < (blinkInterval.data.nextInterval || 2000)) {
  //       blinkInterval.data.nextInterval = Math.random() * 2000 + 1500
  //       return
  //     }

  //     if (blinkInterval.data.closing)
  //       blinkInterval.data.weight -= 8
  //     else
  //       blinkInterval.data.weight += 8

  //     const expression = modelManager.useExpression('blink', vrm)

  //     expression.weight = blinkInterval.data.weight / 100

  //     if (expression.weight >= 0.9) {
  //       blinkInterval.data.closing = true
  //     }
  //     else if (blinkInterval.data.closing && expression.weight <= 0.1) {
  //       // console.log('blink end wait for next')
  //       blinkInterval.data.lastBlink = now
  //       blinkInterval.data.weight = 0

  //       blinkInterval.data.closing = false
  //     }
  //   })
  //   blinkInterval.data.weight = 0
  //   modelManager.onInterval(blinkInterval)

  // Animation
  // const animationManager = new AnimationManager()

  // console.log('animation', StandardWalk)

  // animationManager.apply(StandardWalk, modelManager.gltf.userData.vrm.scene)

  // const animationInterval = new AnimationInterval(15000, (vrm: any) => {
  //   console.log('animation')

  //   animationManager.onAnimate(vrm, clock)
  // })
  // modelManager.onAnimate(animationManager.onAnimate.bind(animationManager))
  // })

  useEventListener('resize', () => modelManager.resize(dom.value!))
})

const modelComponent = shallowRef<Component>(MainPage)

async function changeModelPage(targetComponent: Component, modelShow: boolean = true) {
  const el = container.value
  console.log({ el })
  if (!el) {
    modelComponent.value = targetComponent
    return
  }

  el.style.opacity = '0'

  await sleep(300)

  if (dom.value)
    dom.value!.style.opacity = modelShow ? '1' : '0'

  modelComponent.value = targetComponent

  await sleep(300)

  el.style.opacity = '1'
}

provide('changeModelPage', changeModelPage)
provide('shareDialog', shareDialog)
</script>

<template>
  <div class="ModelPage">
    <div ref="dom" op-0 class="ModelPage-Model transition-cubic">
      <canvas />
    </div>

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

    <client-only>
      <teleport to="body">
        <TouchDialog v-model="shareDialog" :slider="false">
          <ChoreModelSharePage />
        </TouchDialog>
      </teleport>
    </client-only>
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
