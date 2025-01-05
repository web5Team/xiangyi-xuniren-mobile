<script setup lang="ts">
import { $model } from './model-manager'
import MainPage from './MainPage'
import { useLoginState } from '~/components/chore/login/index'
import type { Viewer } from '~/composables/model/vrmViewer/viewer'

// loginState.data.dialogVisible = true
const canvasDom: Ref<HTMLElement> = inject('canvasDom') as unknown as any
const viewer: Viewer = inject('viewer') as unknown as any
const recordGranted: Function = inject('recordGranted') as unknown as any
const changeModelPage: Function = inject('changeModelPage') as unknown as any
const loginState = useLoginState()

onMounted(() => {
  Object.assign(canvasDom.value!.style, {
    transformOrigin: 'left center',
    transform: 'scale(0.85) translateX(-10%)',
  })

  viewer.model?.loadFBX('standing_greeting')
})

async function handleLogin() {
  await sleep(200)

  loginState.data.dialogVisible = true

  recordGranted()

  await sleep(200)

  Object.assign(canvasDom.value!.style, {
    transformOrigin: '',
    transform: '',
  })

  changeModelPage(MainPage, true)

  viewer.model?.loadFBX('idel_happy_02')
}
</script>

<template>
  <div class="ModelIndexPage">
    <div class="ModelIndexPage-Aside">
      <div class="ModelIndexPage-Aside-Title">
        <P>悠伴</P>
        <p>与您同行</p>
      </div>

      <div class="ModelIndexPage-Aside-SubTitle">
        <P>为你的伙伴</P>
        <p>起个名字吧</p>
      </div>

      <div class="ModelIndexPage-Aside-Input">
        <input v-model="loginState.data.name">
      </div>

      <div class="ModelIndexPage-Aside-Button">
        <button v-wave @click="handleLogin">
          注册
        </button>
        <button v-wave>
          登录
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ModelIndexPage {
  &-Aside {
    &-Title {
      margin: 2rem 0;

      /* 悠伴与你同行 */
      font-family: Source Han Sans;
      font-weight: 900;
      font-size: 18px;
      font-variation-settings: 'opsz' auto;
    }

    &-SubTitle {
      /* 为你的伙伴起个名字吧 */
      font-family: Source Han Sans;
      font-weight: 400;
      font-size: 18px;
      font-variation-settings: 'opsz' auto;
    }

    &-Input {
      input {
        width: 100%;

        outline: none !important;
      }
      display: flex;
      padding: 1rem;
      margin: 2rem 0;

      width: 100%;
      height: 20%;

      align-items: center;
      justify-content: center;

      color: #852b38;
      background-color: #fff;
    }

    &-Button {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      width: 75%;

      button {
        width: 100%;
        height: 40px;

        font-family: Source Han Sans;
        font-size: 18px;
        font-weight: normal;
        line-height: 43px;
        text-align: center;
        letter-spacing: 0px;

        font-variation-settings: 'opsz' auto;
        color: #ffffff;

        border-radius: 13px;
        color: #852b38;
        background: #ffffff;
      }
    }

    font-family: Source Han Sans;
    font-size: 18px;
    font-weight: normal;
    line-height: 43px;
    text-align: center;
    letter-spacing: 0px;

    font-variation-settings: 'opsz' auto;
    color: #ffffff;

    position: absolute;
    padding: 1rem 0;
    display: flex;

    top: 10%;
    right: 1rem;

    height: 80%;
    width: 40%;

    align-items: center;
    flex-direction: column;

    gap: 1rem;
    opacity: 1;
    border-radius: 23px;
    background: #852b38;
  }
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  opacity: 0;
  transform: translateX(20%);

  animation: popFadeIn 0.25s 0.125s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
}

@keyframes popFadeIn {
  from {
    opacity: 0;
    transform: translateX(20%);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
