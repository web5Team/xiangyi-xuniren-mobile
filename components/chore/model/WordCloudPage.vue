<script setup lang="ts">
import GhostPage from './GhostPage.vue'
import MainPage from './MainPage.vue'
import { $model } from './model-manager'
import PropertyPage from './PropertyPage.vue'
import DateSelector from '~/components/selector/DateSelector.vue'

const shareDialog: any = inject('shareDialog')
const changeModelPage: any = inject('changeModelPage')
const canvasDom: Ref<HTMLElement> = inject('canvasDom') as unknown as any

const orienated = ref(false)

onMounted(() => {
  $model.stopRecord()

  Object.assign(canvasDom.value!.style, {
    transformOrigin: 'center bottom',
    transform: 'scale(0.75)',
  })
})

async function handleLeave(page: Component, show: boolean) {
  if (!canvasDom.value)
    return

  Object.assign(canvasDom.value.style, {
    transformOrigin: '',
    transform: '',
  })

  await sleep(200)

  $model.startRecord()

  changeModelPage(page, show)
}

const { alpha, beta, gamma } = useDeviceOrientation()
// 监听这三个参数 如果用户横屏
watchEffect(() => {
  if (+alpha.value > 0 || +beta.value > 0 || +gamma.value > 0)
    orienated.value = true
  else
    orienated.value = false
})

const visible = ref(false)
</script>

<template>
  <div class="WordCloudPage" :class="{ orienated }">
    <div class="WordCloudPage-Date">
      <p class="day">
        <span mr-2>{{ userStore.days || 0 }}</span>天
      </p>
      <p class="desc">
        今天是{{ userStore.name }}与你相随
      </p>
    </div>

    <div class="WordCloudPage-Title">
      <div class="WordCloudPage-FingerPrint" @click="handleLeave(MainPage, true)">
        <IconSvgFingerPrint />
      </div>
      <input @click="visible = true" @focus="visible = true"
        class="absolute right-0 w-[80%] border-r-[0px] border-[#755BCE] rounded-bl-[4px] rounded-tl-[4px] text-white !outline-none" border bg-transparent
        p-2 placeholder="请选择日期"
      >
    </div>


    <div class="WordCloudPage-Content">
      <div class="transition-cubic">
        <ClientOnly>
          <ChartWordCloud />
        </ClientOnly>
      </div>
    </div>

    <div class="WordCloudPage-Orienation" flex items-center gap-2>
      <IconSvgOrienationSvg />
      横屏体验更佳哦~
    </div>

    <div class="WordCloudPage-Nav">
      <IconSvgGhostSvg @click="handleLeave(GhostPage, false)" />
      <IconSvgShareSvg @click="shareDialog = true" />
      <IconSvgPlanedSvg @click="handleLeave(PropertyPage, true)" />
    </div>

     <DateSelector v-model="visible" />
  </div>
</template>

<style lang="scss" scoped>
.WordCloudPage-Orienation {
  z-index: 1;
  position: absolute;

  left: 10%;
  bottom: 10%;

  font-family: Alibaba PuHuiTi 3;
  font-size: 14px;
  font-weight: normal;
  line-height: normal;
  letter-spacing: 0em;

  font-variation-settings: 'opsz' auto;
  font-feature-settings: 'kern' on;
  color: #c5c5c5;
}

.orienated .WordCloudPage-Content {
  & > div {
    z-index: 2;
    position: absolute;

    bottom: 0%;
    height: 100vw;
    width: 100vh;

    transform: rotateZ(90deg);
  }
}

.WordCloudPage-Content {
  & > div {
    position: absolute;

    bottom: 0%;
    height: 80%;
    width: 100%;
  }

  position: absolute;

  width: 100%;
  height: 100%;

  background-color: #100c2a;
}

.WordCloudPage-Title {
  z-index: 1;
  position: absolute;
  padding: 0 1.5rem;
  display: flex;

  gap: 1rem;
  top: 7rem;
  left: 0;

  width: 100%;

  justify-content: space-between;
}

.WordCloudPage {
  &-Date {
    z-index: 1;
    position: absolute;

    top: 3rem;
    left: 2rem;

    .day {
      span {
        color: #8e6ff7;

        font-family: Source Han Sans;
        font-weight: 400;
        font-size: 36px;
        font-variation-settings: 'opsz' auto;
      }

      color: #aeb3be;

      font-family: Source Han Sans;
      font-weight: 400;
      font-size: 20px;
      font-variation-settings: 'opsz' auto;
    }

    .desc {
      font-family: Source Han Sans;
      font-size: 10px;
      font-weight: normal;
      line-height: 22px;
      text-align: center;
      letter-spacing: 0px;

      font-variation-settings: 'opsz' auto;
      font-feature-settings: 'kern' on;
      color: #9e9e9e;
    }

    font-family: Source Han Sans;
    font-size: 20px;
    font-weight: normal;
    line-height: 22px;
    text-align: center;
    letter-spacing: 0px;

    font-variation-settings: 'opsz' auto;
    font-feature-settings: 'kern' on;
  }
}

.WordCloudPage-FingerPrint {
  // position: absolute;

  // top: 50%;
  // left: 1rem;

  // transform: translateY(-50%);
  filter: brightness(500%);
}

.WordCloudPage-Nav {
  position: absolute;
  display: flex;

  top: 3rem;
  right: 2rem;

  gap: 4rem;
  align-items: center;

  filter: brightness(500%);
}
</style>
