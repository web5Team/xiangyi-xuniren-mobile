<script setup lang="ts">
import TouchDialog from '~/components/dialog/TouchDialog.vue'
import MainPage from '~/components/chore/model/MainPage.vue'
import { Viewer } from '~/composables/model/vrmViewer/viewer'
import model from '/xyfemale.vrm'

const dom = ref<HTMLElement>()
const container = ref<HTMLElement>()
const progress = ref(0)
const { x, y } = useMouse()
const shareDialog = ref(false)

const viewer = new Viewer()

onMounted(() => {
  progress.value = 100
  dom.value?.attributes.removeNamedItem('op-0')
  container.value?.attributes.removeNamedItem('op-0')

  const canvas = dom.value!.querySelector('canvas') as HTMLCanvasElement

  viewer.setup(canvas)

  console.log({ viewer })
  viewer.loadVrm(model)
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
  // z-index: 2;
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

    // pointer-events: none;
  }
  z-index: 2;

  width: 100%;
  height: 100%;

  background-color: var(--el-bg-color);
}
</style>
