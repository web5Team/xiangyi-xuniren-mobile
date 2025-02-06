<script setup lang="ts">
import InputPage from "./InputPage.vue";
import MainPage from "./MainPage.vue";
import { $model } from "./model-manager";
import WordCloudPage from "./WordCloudPage.vue";

import IconSvgGhostFilledSvg from "~/components/icon/svg/GhostFilledSvg.vue";
import IconSvgButterflySvg from "~/components/icon/svg/ButterflySvg.vue";
import IconSvgFingerPrint from "~/components/icon/svg/FingerPrint.vue";
import IconSvgShareSvg from "~/components/icon/svg/ShareSvg.vue";
import IconSvgPlanedSvg from "~/components/icon/svg/PlanedSvg.vue";

const shareDialog: any = inject("shareDialog");
const changeModelPage: any = inject("changeModelPage");

const stream = computed(() => $model.stream.value);
</script>

<template>
  <div class="ModelGhostPage">
    <div class="ModelGhostPage-Date">
      <p class="day">
        <span mr-2>{{ userStore.days || 0 }}</span
        >天
      </p>
      <p class="desc">今天是{{ userStore.name }}与你相随</p>
    </div>

    <div class="ModelGhostPage-Content">
      <ClientOnly>
        <ChoreWavingRecorder v-if="stream" :audio-stream="stream" />
      </ClientOnly>
    </div>

    <div class="ModelGhostPage-FingerPrint" @click="changeModelPage(MainPage, true)">
      <IconSvgFingerPrint />
    </div>

    <div class="ModelGhostPage-Nav">
      <IconSvgGhostFilledSvg />
      <IconSvgButterflySvg @click="changeModelPage(InputPage, true)" />
      <IconSvgPlanedSvg @click="changeModelPage(WordCloudPage, true)" />
      <IconSvgShareSvg @click="shareDialog = true" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ModelGhostPage-Content {
  position: absolute;
  padding: 0 10%;

  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);
}

.ModelGhostPage {
  &-Date {
    position: absolute;

    top: 3rem;
    left: 2rem;
    .day {
      span {
        color: #8e6ff7;

        font-family: Source Han Sans;
        font-weight: 400;
        font-size: 36px;
        font-variation-settings: "opsz" auto;
      }

      color: #aeb3be;

      font-family: Source Han Sans;
      font-weight: 400;
      font-size: 20px;
      font-variation-settings: "opsz" auto;
    }

    .desc {
      font-family: Source Han Sans;
      font-size: 10px;
      font-weight: normal;
      line-height: 22px;
      text-align: center;
      letter-spacing: 0px;

      font-variation-settings: "opsz" auto;
      font-feature-settings: "kern" on;
      color: #9e9e9e;
    }

    font-family: Source Han Sans;
    font-size: 20px;
    font-weight: normal;
    line-height: 22px;
    text-align: center;
    letter-spacing: 0px;

    font-variation-settings: "opsz" auto;
    font-feature-settings: "kern" on;
  }
}

.ModelGhostPage-FingerPrint {
  position: absolute;

  top: 50%;
  left: 1rem;

  transform: translateY(-50%);
}

.ModelGhostPage-Nav {
  position: absolute;
  display: flex;

  top: 50%;
  right: 1rem;

  gap: 45px;
  align-items: center;
  flex-direction: column;

  transform: translateY(-50%);
}
</style>
