<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { userStore } from '../composables/user'
import QuestionarePage from '~/components/chore/model/QuestionarePage.vue'
import LoginPage from '~/components/chore/login/LoginPage.vue'
import MainPage from '~/components/chore/model/MainPage.vue'
import { Viewer } from '~/composables/model/vrmViewer/viewer'
import model from '/xyfemale.vrm'
import { useLoginState } from '~/components/chore/login'
import {
  $model,
  ensurePermissions,
  permissionGranted,
  speechNls,
} from '~/components/chore/model/model-manager'
import IndexPage from '~/components/chore/model/IndexPage.vue'
import { $endApi } from '~/composables/api/base'
import { ActionManager } from '~/composables/model/action-manager'
import { $aigc } from '~/composables/aigc'

const dom = ref<HTMLElement>()
const container = ref<HTMLElement>()
const { x, y } = useMouse()
const shareDialog = ref(false)
const actionManager = shallowRef<ActionManager>()

const { share, isSupported } = useShare()

watch(
  () => shareDialog.value,
  (val) => {
    if (!isSupported) {
      ElMessage.error('当前设备不支持分享')
      return
    }

    if (val) {
      share({
        title: '相一APP',
        text: 'XiangYi',
        url: location.href,
      })

      shareDialog.value = false
    }
  },
)

const viewer = new Viewer()
const loginState = useLoginState()

const options = reactive({
  init: false,
  voiceEnable: true,
  actionEnable: true,
})

async function handleInit() {
  if (options.init)
    return

  if (!userStore.value.isLogin)
    return

  const res = await $endApi.v1.auth.getNlsToken()

  if (
    responseMessage(res, {
      success: '',
      triggerOnDataNull: false,
    })
  ) {
    options.init = true
    await speechNls.connect(res.data.token)
    $model.startRecord()
  }
}

function recordGranted() {
  if (permissionGranted.value) {
    handleInit()
    return
  }

  const cb = whenever(
    () => loginState.data.dialogVisible === false && userStore.value.completeQuestion,
    async () => {
      setTimeout(() => {
        cb()
      })

      // granted
      await ensurePermissions()
      if (permissionGranted.value) {
        handleInit()
      }
      else {
        // Exit page
        location.reload()
      }
    },
    { immediate: true },
  )
}

onMounted(() => {
  const canvas = dom.value!.querySelector('canvas') as HTMLCanvasElement

  viewer.setup(canvas)

  const promise = viewer.loadVrm(model)

  viewer._animationList.push(() => {
    viewer.updateEye(x.value, y.value)
  })

  promise
    .then(() => {
      if (!userStore.value.isLogin) {
        changeModelPage(IndexPage, true)
      }
      else {
        setTimeout(async () => {
          const res = await $endApi.v1.initial.modelInfo()

          if (res.code === 1)
            Object.assign(userStore.value, res.data)

          if (!userStore.value.completeQuestion)
            changeModelPage(QuestionarePage, true)
        })

        recordGranted()

        actionManager.value = new ActionManager(viewer)
        actionManager.value.startToggle()
      }

      dom.value?.attributes.removeNamedItem('op-0')

      container.value?.attributes.removeNamedItem('op-0')
    })
    .catch(() => {
      ElMessage.error('请检查网络连接，或刷新重试...')
    })
})

watch(
  () => options.actionEnable,
  (val) => {
    if (val)
      actionManager.value?.startToggle()
    else actionManager.value?.endToggle()
  },
)

onBeforeUnmount(() => {
  $model.stopRecord()

  speechNls.disconnect()

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

  await sleep(200)

  if (dom.value)
    dom.value!.style.opacity = modelShow ? '1' : '0'

  modelComponent.value = targetComponent

  await sleep(200)

  el.style.opacity = '1'
}

provide('changeModelPage', changeModelPage)
provide('shareDialog', shareDialog)
provide('canvasDom', dom)
provide('viewer', viewer)
provide('recordGranted', recordGranted)
provide('options', options)
provide('handleConversationStart', handleConversationStart)

speechNls.sentenceBus.on((payload) => {
  handleConversationStart(payload.result)
})

const sentence = ref('')

speechNls.sentenceCacheBus.on((payload) => {
  // if (!speechNls.cacheSentence) {
  //   $model.stopRecord()

  //   lastSignal?.abort?.()
  // }
  sentence.value = payload.result
})

// const voiceSynthesizer = new VoiceSynthesizer();

async function handleConversationStart(sentence: string) {
  $aigc.startConversation(sentence, true)
}

window.$handleConversationStart = handleConversationStart
window.$mockConversation = $aigc.mockConversation
</script>

<template>
  <div class="ModelPage">
    <div ref="dom" op-0 class="ModelPage-Model transition-cubic">
      <canvas />
    </div>

    <div ref="container" op-0 class="ModelPage-Container transition-cubic">
      <component :is="modelComponent" />
    </div>

    <div class="ModelPage-Footer">
      {{ sentence }}
    </div>

    <client-only>
      <teleport to="body">
        <div
          class="LoginWrapper transition-cubic"
          :class="{ visible: loginState.data.dialogVisible }"
        >
          <LoginPage v-if="loginState.data.dialogVisible" />
        </div>
      </teleport>
    </client-only>
  </div>
</template>

<style lang="scss">
.ModelPage-Footer {
  position: absolute;

  left: 50%;
  bottom: 1.5rem;

  transform: translateX(-50%);

  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
}

.LoginWrapper,
.QuestionareWrapper {
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
