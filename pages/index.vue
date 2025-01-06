<script setup lang="ts">
import { userStore } from '../composables/user'
import LoginPage from '~/components/chore/login/LoginPage.vue'
import TouchDialog from '~/components/dialog/TouchDialog.vue'
import MainPage from '~/components/chore/model/MainPage.vue'
import { Viewer } from '~/composables/model/vrmViewer/viewer'
import model from '/xyfemale.vrm'
import { useLoginState } from '~/components/chore/login'
import {
  $model,
  ensurePermissions,
  permissionGranted,
  result,
} from '~/components/chore/model/model-manager'
import IndexPage from '~/components/chore/model/IndexPage.vue'

const dom = ref<HTMLElement>()
const container = ref<HTMLElement>()
const progress = ref(0)
const { x, y } = useMouse()
const shareDialog = ref(false)

const viewer = new Viewer()
const loginState = useLoginState()

const actions = ['idle_01', 'idle_02', 'idle_03', 'idle_01', 'idle_02', 'idle_03', 'sitting', 'standing_greeting', 'idel_happy_01']
const emotions = ['happy', 'neutral', 'blinkLeft', 'blinkRight', 'blink', 'neutral', 'relaxed', 'sad', 'surprised']

function recordGranted() {
  if (permissionGranted.value)
    return

  const cb = whenever(() => loginState.data.dialogVisible === false, async () => {
    setTimeout(() => {
      cb()
    })

    // granted
    await ensurePermissions()
    if (permissionGranted.value) {
      $model.startRecord()

      // go action
      setTimeout(() => actionToggle(), 15000)
    }
    else {
      // Exit page
      location.reload()
    }
  }, { immediate: true })
}

function actionToggle() {
  useIntervalFn(() => {
    const action = actions[Math.floor(Math.random() * actions.length)]
    const emotion = emotions[Math.floor(Math.random() * emotions.length)]

    viewer.model?.loadFBX(action)
    viewer.model?.emote(emotion as any)
  }, 15000)
}

onMounted(() => {
  const canvas = dom.value!.querySelector('canvas') as HTMLCanvasElement

  viewer.setup(canvas)

  viewer.loadVrm(model)

  viewer._animationList.push(() => {
    viewer.updateEye(x.value, y.value)
  })

  const pausable = useIntervalFn(async () => {
    progress.value += Math.random() * 5

    if (progress.value >= 100) {
      pausable.pause()

      progress.value = 100

      await sleep(500)

      if (!userStore.value.isLogin)
        changeModelPage(IndexPage, true)

      else recordGranted()

      dom.value?.attributes.removeNamedItem('op-0')
      container.value?.attributes.removeNamedItem('op-0')
    }
  }, 50)
})

onBeforeUnmount(() => {
  $model.stopRecord()

  viewer._animationList.length = 0
  viewer.unloadVRM()
})

const modelComponent = shallowRef<Component>(MainPage)

async function changeModelPage(targetComponent: Component, modelShow: boolean = true) {
  const el = container.value
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
provide('canvasDom', dom)
provide('viewer', viewer)
provide('recordGranted', recordGranted)

$model.saidEvent.on((phrase: string) => {
  console.log('user said', phrase)
})
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
        <div class="LoginWrapper transition-cubic" :class="{ visible: loginState.data.dialogVisible }">
          <LoginPage v-if="loginState.data.dialogVisible" />
        </div>

        <TouchDialog v-model="shareDialog" :slider="false">
          <ChoreModelSharePage />
        </TouchDialog>
      </teleport>
    </client-only>
  </div>
</template>

<style lang="scss">
.LoginWrapper {
  &.visible {
    transform: translate(0, 0);
    // box-shadow: unset;
  }
  z-index: 10;
  position: absolute;

  width: 100%;
  height: 100%;

  border-radius: 32px;
  transform: translate(120%, 0);
  // box-shadow: var(--el-box-shadow);
  background-color: var(--el-bg-color);
}

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
    position: absolute;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  width: 100%;
  height: 100%;

  background-color: var(--el-bg-color);
}
</style>
