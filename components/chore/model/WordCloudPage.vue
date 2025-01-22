<script setup lang="ts">
import GhostPage from './GhostPage.vue'
import MainPage from './MainPage.vue'
import { $model } from './model-manager'
import PropertyPage from './PropertyPage.vue'

const shareDialog: any = inject('shareDialog')
const changeModelPage: any = inject('changeModelPage')
</script>

<template>
  <div class="WordCloudPage">
    <div class="WordCloudPage-Date">
      <p class="day">
        <span mr-2>{{ userStore.days || 0 }}</span>天
      </p>
      <p class="desc">
        今天是{{ userStore.name }}与你相随
      </p>
    </div>

    <div class="WordCloudPage-Content">
      <ClientOnly>
        <ChartWordCloud />
      </ClientOnly>
    </div>

    <div class="WordCloudPage-FingerPrint" @click="changeModelPage(MainPage, true)">
      <IconSvgFingerPrint />
    </div>

    <div class="WordCloudPage-Nav">
      <IconSvgGhostSvg @click="changeModelPage(GhostPage, false)" />
      <IconSvgShareSvg @click="shareDialog = true" />
      <IconSvgPlanedSvg @click="changeModelPage(PropertyPage, true)" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.WordCloudPage-Content {
  position: absolute;

  width: 100%;
  height: 100%;

  background-color: #100c2a;
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
  position: absolute;

  top: 50%;
  left: 1rem;

  transform: translateY(-50%);
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
