<script setup lang="ts">
import MainPage from './MainPage.vue'
import { useLoginState } from '~/components/chore/login/index'
import type { Viewer } from '~/composables/model/vrmViewer/viewer'
import GuideIntroduction from '~/components/chore/guide/GuideIntroduction.vue'

// loginState.data.dialogVisible = true
const canvasDom: Ref<HTMLElement> = inject('canvasDom') as unknown as any
const viewer: Viewer = inject('viewer') as unknown as any
const recordGranted: Function = inject('recordGranted') as unknown as any
const changeModelPage: Function = inject('changeModelPage') as unknown as any
const loginState = useLoginState()
const options: any = inject('options') as unknown as any

onMounted(() => {
  options.actionEnable = false

  Object.assign(canvasDom.value!.style, {
    transformOrigin: 'center center',
    transform: 'scale(0.85)',
  })

  viewer.model?.loadFBX('standing_greeting')

  setTimeout(() => {
    nextGuide(GuideIntroduction, 217)
  })
})

async function handleLogin() {
  await sleep(200)

  loginState.data.dialogVisible = true

  await sleep(200)

  Object.assign(canvasDom.value!.style, {
    transformOrigin: '',
    transform: '',
  })

  options.actionEnable = true

  viewer.model?.loadFBX('idel_happy_02')
  viewer.model?.emote('happy')

  changeModelPage(MainPage, true)
}

const dom = ref<HTMLElement>()
const currentComponent = ref()

async function nextGuide(component: Component, height: number) {
  const el = dom.value
  if (!el)
    return

  const wrapper: HTMLElement = el.querySelector('.ModelIndexPage-MainWrapper')!

  Object.assign(wrapper.style, {
    transform: 'translateX(-150%)',
  })

  await sleep(300)

  if (!component) {
    Object.assign(el.style, {
      height: `0`,
      opacity: '0',
      transform: 'scaleY(0)',
    })

    await sleep(300)

    handleLogin()

    return
  }

  Object.assign(wrapper.style, {
    transition: 'none',
    transform: 'translateX(150%)',
  })

  currentComponent.value = component

  Object.assign(el.style, {
    height: `${height}px`,
  })

  await sleep(100)

  Object.assign(wrapper.style, {
    transition: '',
    transform: 'translateX(0)',
  })
}

provide('nextGuide', nextGuide)
</script>

<template>
  <div class="ModelIndexPage">
    <div ref="dom" class="ModelIndexPage-Main transition-cubic">
      <div class="ModelIndexPage-MainWrapper transition-cubic">
        <component :is="currentComponent" v-if="currentComponent" />
      </div>
    </div>

    <div class="ModelIndexPage-Copyright">
      <h1>悠伴与你同行</h1>
      <div class="ModelIndexPage-Copyright-Content">
        <p>
          Nexo Technology (Hong Kong) Limited
        </p>
        <p>2025</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ModelIndexPage-Copyright {
  h1 {
    font-family: Alibaba PuHuiTi 3;
    font-size: 18px;
    font-weight: bold;
    line-height: 20px;
    text-align: center;
    letter-spacing: 0px;

    font-variation-settings: 'opsz' auto;
    font-feature-settings: 'kern' on;
    color: #8e6ff7;
  }

  &-Content {
    font-family: Alibaba PuHuiTi 3;
    font-size: 10px;
    font-weight: normal;
    line-height: 16px;
    text-align: center;
    letter-spacing: 0px;

    font-variation-settings: 'opsz' auto;
    font-feature-settings: 'kern' on;
    color: #8e6ff7;
  }
  position: absolute;

  left: 50%;

  max-width: 90%;

  text-align: center;
  bottom: 1rem;

  transform: translateX(-50%);
}

.ModelIndexPage {
  &-Main {
    font-family: Source Han Sans;
    font-size: 18px;
    font-weight: normal;
    line-height: 43px;
    text-align: center;
    letter-spacing: 0px;

    font-variation-settings: 'opsz' auto;
    position: absolute;
    padding: 1rem 0;
    display: flex;

    top: 55%;
    left: 50%;

    // height: 25%;
    width: 100%;

    align-items: center;
    flex-direction: column;
    justify-content: center;

    gap: 1rem;
    opacity: 1;
    background: #f6f6f6e0;
    backdrop-filter: blur(18px) saturate(180%);

    transform: translate(-50%, -50%);
  }

  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  transform: scale(1.2);

  animation: popFadeIn 0.25s 0.125s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
}

@keyframes popFadeIn {
  from {
    transform: scale(1.2);
  }

  to {
    transform: scale(1);
  }
}
</style>
