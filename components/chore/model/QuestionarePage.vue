<script setup lang="ts">
import { $model } from './model-manager'
import MainPage from './MainPage.vue'

import type { Viewer } from '~/composables/model/vrmViewer/viewer'
import { $endApi } from '~/composables/api/base'
import type { IQuestion } from '~/composables/api/base/v1/initial.type'

import Step1Model from '~/composables/model/daily/guide/1.vrm?url'
import Step2Model from '~/composables/model/daily/guide/2.vrm?url'
import Step3Model from '~/composables/model/daily/guide/34.vrm?url'

const canvasDom: Ref<HTMLElement> = inject('canvasDom') as unknown as any
const viewer: Viewer = inject('viewer') as unknown as any
const recordGranted: Function = inject('recordGranted') as unknown as any
const changeModelPage: Function = inject('changeModelPage') as unknown as any
const options: any = inject('options') as unknown as any

const container = ref<HTMLElement>()
const loading = ref(false)
const currentIndex = ref(0)
const questions = ref<IQuestion[]>([])
const progress = computed(() => currentIndex.value / questions.value.length * 100)
const currentQuestionGroup = computed(() => questions.value?.[currentIndex.value])

async function fetchData() {
  currentIndex.value = 0
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

  viewer.model?.loadVRM(Step1Model)
  viewer.model?.loadFBX('thsinking')
  viewer.model?.emote('blink' as any)

  fetchData()
})

async function handleDone() {
  await sleep(200)

  recordGranted()

  await sleep(200)

  Object.assign(canvasDom.value!.style, {
    transformOrigin: '',
    transform: '',
  })

  options.actionEnable = true

  changeModelPage(MainPage, true)

  viewer.model?.loadFBX('idel_happy_02')
  viewer.model?.emote('happy')
}

async function handleAnswerQuestion(option: string) {
  loading.value = true

  const { id, title } = currentQuestionGroup.value!

  const res = await $endApi.v1.initial.answerQuestion(`${id}`, title, [option])

  const dom = container.value ?? document.body

  if (responseMessage(res, { success: '', triggerOnDataNull: false })) {
    dom.style.opacity = '0'

    await sleep(300)

    currentIndex.value++

    if (currentIndex.value >= questions.value.length) {
      userStore.value.completeQuestion = true

      handleDone()
    }
    else {
      dom.style.opacity = '1'
    }
  }

  loading.value = false
}

const step = ref(0)
watch(progress, (p) => {
  if (p >= 75)
    step.value = 4
  else if (p >= 50)
    step.value = 3
  else if (p >= 25)
    step.value = 2
  else
    step.value = 1
})

watch(step, (s) => {
  if (s === 4)
    viewer.model?.emote('happy')
  else if (s === 3)
    viewer.model?.loadVRM(Step3Model)
  else if (s === 2)
    viewer.model?.loadVRM(Step2Model)
})
</script>

<template>
  <div class="ModelQuestionarePage">
    <div class="ModelQuestionarePage-Main">
      <div v-if="currentQuestionGroup" ref="container" :class="{ loading }" class="ModelQuestionarePage-Content">
        <p class="transition-cubic">
          {{ currentQuestionGroup.title }}
        </p>
        <ul class="transition-cubic">
          <li v-for="(item, ind) in currentQuestionGroup.options" :key="item" v-wave :style="`--d: ${ind * 0.1}s`" class="transition-cubic" @click="handleAnswerQuestion(item)">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ModelQuestionarePage-Content {
  p {
    font-family: Roboto;
    font-size: 18px;
    font-weight: 800;
    line-height: 140%;
    text-align: center;
    display: flex;
    align-items: center;
    letter-spacing: 0px;

    font-variation-settings: 'opsz' auto;
    font-feature-settings: 'kern' on;
    color: #8e6ff7;
  }
  ul {
    margin: 1rem 0;
    display: flex;

    gap: 1rem;
    align-items: center;
    flex-direction: column;
  }
  li {
    display: flex;
    padding: 0.5rem 0.75rem;

    width: 100%;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    font-family: Roboto;
    font-size: 16px;
    font-weight: 400;
    line-height: 140%;
    text-align: center;
    display: flex;
    justify-content: center;

    color: #fff;
    cursor: pointer;
    border-radius: 13px;
    background: #8e6ff7;
  }

  &.loading {
    p {
      opacity: 0.5;
    }
    ul {
      opacity: 0.5;
    }
    li {
      width: 48px;
      height: 32px;

      opacity: 0.25;
      color: #0000;
      border-radius: 8px;

      animation: quesShaving 0.75s var(--d) infinite linear;
    }

    filter: blur(1px);
  }
  margin: 0 auto;
  padding: 15% 0;
  display: flex;

  max-width: 85%;

  align-items: center;
  flex-direction: column;
}

@keyframes quesShaving {
  0% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(10px);
  }

  50% {
    transform: translateX(-10px);
  }

  75% {
    transform: translateX(0);
  }
}

.ModelQuestionarePage {
  &-Main {
    // background-color: red;
  }

  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}
</style>
