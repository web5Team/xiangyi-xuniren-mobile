<script setup lang="ts">
import { $model } from './model-manager'
import MainPage from './MainPage.vue'
import QuestionarePage from './QuestionarePage.vue'
import GhostPage from './GhostPage.vue'
import { useLoginState } from '~/components/chore/login/index'
import type { Viewer } from '~/composables/model/vrmViewer/viewer'

// loginState.data.dialogVisible = true
const canvasDom: Ref<HTMLElement> = inject('canvasDom') as unknown as any
const viewer: Viewer = inject('viewer') as unknown as any
const recordGranted: Function = inject('recordGranted') as unknown as any
const changeModelPage: Function = inject('changeModelPage') as unknown as any
const loginState = useLoginState()
const shareDialog: any = inject('shareDialog')

onMounted(() => {
  setTimeout(() => {
    Object.assign(canvasDom.value!.style, {
      transformOrigin: 'top center',
      transform: 'scale(0.85) translateY(5%)',
    })
  }, 500)

  viewer.model?.loadFBX('standing_greeting')
})

async function handleLeave(page: Component, show: boolean) {
  if (!canvasDom.value)
    return

  Object.assign(canvasDom.value.style, {
    transformOrigin: '',
    transform: '',
  })

  await sleep(200)

  changeModelPage(page, show)
}

function handleGhost() {
  handleLeave(GhostPage, false)
}
</script>

<template>
  <div class="ModelPropertyPage">
    <div class="ModelPropertyPage-Mask" />
    <div class="ModelPropertyPage-MaskStroke" />

    <div class="ModelPropertyPage-FingerPrint" @click="handleLeave(MainPage, true)">
      <IconSvgFingerPrint />
    </div>

    <div class="ModelPropertyPage-Nav">
      <IconSvgGhostSvg @click="handleGhost" />
      <IconSvgButterflySvg />
      <IconSvgPlanedSvg />
      <IconSvgShareSvg @click="shareDialog = true" />
    </div>

    <div class="ModelPropertyPage-Main">
      <div class="ModelPropertyPage-Main-Tooltip">
        <P>我希望这个数字人</P>
        <p>可以更加...</p>
      </div>

      <div class="ModelPropertyPage-Main-Inner">
        READY FOR DEV
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ModelPropertyPage-Mask {
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  opacity: 1;
  background-color: var(--el-bg-color);

  // mask 正中间镂空的圆形
  mask: radial-gradient(circle at 50% 25%, transparent 96px, #000000 96px);
}

.ModelPropertyPage-MaskStroke {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  opacity: 0.1;

  // mask 正中间镂空的圆形
  background-image: radial-gradient(
    circle at 50% 25%,
    #8e6ff7 96px,
    #0000 96px
  );
}

.ModelPropertyPage {
  &-Main {
    &-Tooltip {
      padding: 1rem;
      margin: 2rem 0;

      width: 192px;

      color: #fff;
      font-size: 16px;
      font-variation-settings: 'opsz' auto;

      border-radius: 28px;
      background: #8e6ff7;
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

    position: absolute;
    padding: 1rem 0;
    display: flex;

    bottom: 0;

    height: 60%;
    width: 100%;

    align-items: center;
    flex-direction: column;

    gap: 1rem;
    opacity: 1;
    // border-radius: 23px 23px 0 0;
    // background: #852b38;

    transform: translateY(120%);

    animation: popFadeIn 0.25s 0.125s cubic-bezier(0.215, 0.61, 0.355, 1)
      forwards;
  }

  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
}

@keyframes popFadeIn {
  from {
    transform: translateY(120%);
  }

  to {
    transform: translateY(0);
  }
}

.ModelPropertyPage-FingerPrint {
  z-index: 1;
  position: absolute;

  top: 50%;
  left: 1rem;

  transform: translateY(-50%);
}

.ModelPropertyPage-Nav {
  z-index: 1;
  position: absolute;
  display: flex;

  top: 50%;
  right: 1rem;

  gap: 25px;
  align-items: center;
  flex-direction: column;

  transform: translateY(-50%);
}
</style>
