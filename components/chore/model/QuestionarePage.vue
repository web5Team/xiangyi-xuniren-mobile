<script setup lang="ts">
import { $model } from './model-manager'
import MainPage from './MainPage.vue'
import { useLoginState } from '~/components/chore/login/index'
import type { Viewer } from '~/composables/model/vrmViewer/viewer'
import { $endApi } from '~/composables/api/base'
import type { IQuestion } from '~/composables/api/base/v1/initial.type'

// loginState.data.dialogVisible = true
const canvasDom: Ref<HTMLElement> = inject('canvasDom') as unknown as any
const viewer: Viewer = inject('viewer') as unknown as any
const recordGranted: Function = inject('recordGranted') as unknown as any
const changeModelPage: Function = inject('changeModelPage') as unknown as any
const options: any = inject('options') as unknown as any
const loginState = useLoginState()

const questions = ref<IQuestion[]>([])

async function fetchData() {
  const res = await $endApi.v1.initial.getQuestions()

  if (responseMessage(res, { success: '', triggerOnDataNull: false }))
    questions.value = res.data!
}

onMounted(() => {
  options.actionEnable = false

  Object.assign(canvasDom.value!.style, {
    transformOrigin: 'center bottom',
    transform: 'scale(0.75) translateY(12vmin)',
  })

  viewer.model?.loadFBX('thinking')

  fetchData()
})

async function handleLogin() {
  await sleep(200)

  loginState.data.dialogVisible = true

  if (!userStore.value.completeQuestion)
    changeModelPage(MainPage, true)

  recordGranted()

  await sleep(200)

  Object.assign(canvasDom.value!.style, {
    transformOrigin: '',
    transform: '',
  })

  changeModelPage(MainPage, true)

  viewer.model?.loadFBX('idel_happy_02')
  viewer.model?.emote('happy')
}
</script>

<template>
  <div class="ModelQuestionarePage">
    <div class="ModelQuestionarePage-Main">
      {{ questions }}123
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ModelQuestionarePage {
  &-Main {
    background-color: red;
  }

  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}
</style>
