<script setup lang="ts">
import GhostPage from "./GhostPage.vue";
import MainPage from "./MainPage.vue";
import { $model } from "./model-manager";
import WordCloudPage from "./WordCloudPage.vue";
import { getAIGCCompletionStream } from "~/composables/api/base/v1/aigc/completion";

import IconSvgGhostSvg from "~/components/icon/svg/GhostSvg.vue";
import IconSvgFingerPrint from "~/components/icon/svg/FingerPrint.vue";
import IconSvgShareSvg from "~/components/icon/svg/ShareSvg.vue";
import IconSvgPlanedSvg from "~/components/icon/svg/PlanedSvg.vue";
import IconSvgButterflyFilledSvg from "~/components/icon/svg/ButterflyFilledSvg.vue";

const shareDialog: any = inject("shareDialog");
const changeModelPage: any = inject("changeModelPage");
const options: any = (inject("options") as unknown) as any;
const canvasDom: Ref<HTMLElement> = (inject("canvasDom") as unknown) as any;

onMounted(() => {
  $model.stopRecord();
  options.voiceEnable = false;

  Object.assign(canvasDom.value!.style, {
    transformOrigin: "center bottom",
    transform: "scale(0.75)",
  });
});

async function handleLeave(page: Component, show: boolean) {
  if (!canvasDom.value) return;

  Object.assign(canvasDom.value.style, {
    transformOrigin: "",
    transform: "",
  });

  await sleep(200);

  $model.startRecord();
  options.voiceEnable = true;

  changeModelPage(page, show);
}

function handleGhost() {
  handleLeave(GhostPage, false);
}

function handleWordCloud() {
  handleLeave(WordCloudPage, true);
}

let lastSignal: any;
const display = reactive({
  input: "",
  result: "",
});

async function handleConversationStart(sentence: string) {
  if (!display.input) return;

  document.body.blur();

  display.result = "";

  lastSignal?.abort?.();

  lastSignal = getAIGCCompletionStream(
    sentence,
    (message: any) => {
      const { event, data } = message;
      if (event !== "conversation.message.delta") return;

      const { content, type } = data;
      if (type !== "answer") return;

      display.result += content;
    },
    (error: any) => {
      console.warn(error);
    },
    () => {
      console.warn("======= COMPLETED =======");
    }
  );
}
</script>

<template>
  <div class="ModelInputPage">
    <div class="ModelInputPage-Date">
      <p class="day">
        <span mr-2>{{ userStore.days || 0 }}</span
        >天
      </p>
      <p class="desc">今天是{{ userStore.name }}与你相随</p>
    </div>

    <div class="ModelInputPage-Display">
      <div
        :class="{ hide: !display.result }"
        class="ModelInputPage-Display-Show transition-cubic"
      >
        {{ display.result }}
      </div>
      <div
        class="ModelInputPage-Display-Input"
        @keydown.enter="handleConversationStart(display.input)"
      >
        <textarea
          v-model="display.input"
          placeholder="欢迎来到相一科技
在这里
聊你所想
..."
        />
      </div>
    </div>

    <div class="ModelInputPage-FingerPrint">
      <IconSvgFingerPrint @click="handleLeave(MainPage, true)" />
    </div>

    <div class="ModelInputPage-Nav">
      <IconSvgGhostSvg @click="handleGhost" />
      <IconSvgButterflyFilledSvg />
      <IconSvgPlanedSvg @click="handleWordCloud" />
      <IconSvgShareSvg @click="shareDialog = true" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ModelInputPage-Display {
  &-Show {
    &.hide {
      opacity: 0;
    }

    position: relative;
    padding: 0.25rem;

    // flex: 1;
    height: auto;
    max-height: calc(70% - 0.5rem);

    border-radius: 8px;
    background-color: #f6f6f6;

    font-family: Alibaba PuHuiTi 3;
    font-size: 12px;
    font-weight: 300;
    line-height: normal;
    text-align: center;
    letter-spacing: 0em;

    overflow-y: scroll;
    font-variation-settings: "opsz" auto;
    font-feature-settings: "kern" on;
    color: #151515;
  }

  &-Input {
    textarea {
      position: absolute;
      padding: 0.25rem;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      outline: none !important;
      background-color: #0000;

      font-family: Alibaba PuHuiTi 3;
      font-size: 12px;
      font-weight: 300;
      line-height: normal;
      text-align: center;
      letter-spacing: 0em;

      font-variation-settings: "opsz" auto;
      font-feature-settings: "kern" on;
      color: #151515;
    }

    position: relative;
    padding: 0.25rem;

    width: 100%;
    height: 30%;

    flex-shrink: 0;

    border-radius: 8px;
    background-color: #f6f6f6;
  }

  position: absolute;
  display: flex;

  top: 5%;
  left: 50%;

  width: 40%;
  height: 30%;

  gap: 0.5rem;
  flex-direction: column;
  justify-content: flex-end;

  overflow: hidden;
  transform: translate(-50%, 0);
}

.ModelInputPage {
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

.ModelInputPage-FingerPrint {
  position: absolute;

  top: 50%;
  left: 1rem;

  transform: translateY(-50%);
}

.ModelInputPage-Nav {
  position: absolute;
  display: flex;

  top: 50%;
  right: 1rem;

  gap: 45px;
  flex-direction: column;

  transform: translateY(-50%);
}
</style>
