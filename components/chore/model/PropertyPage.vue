<script setup lang="ts">
import { $model } from "./model-manager";
import MainPage from "./MainPage.vue";
import QuestionarePage from "./QuestionarePage.vue";
import GhostPage from "./GhostPage.vue";
import WordCloudPage from "./WordCloudPage.vue";
import InputPage from "./InputPage.vue";
import type { Viewer } from "~/composables/model/vrmViewer/viewer";
import { $endApi } from "~/composables/api/base";

import IconSvgGhostSvg from "~/components/icon/svg/GhostSvg.vue";
import IconSvgButterflySvg from "~/components/icon/svg/ButterflySvg.vue";
import IconSvgFingerPrint from "~/components/icon/svg/FingerPrint.vue";
import IconSvgShareSvg from "~/components/icon/svg/ShareSvg.vue";
import IconSvgPlanedSvg from "~/components/icon/svg/PlanedSvg.vue";

const canvasDom: Ref<HTMLElement> = (inject("canvasDom") as unknown) as any;
const viewer: Viewer = (inject("viewer") as unknown) as any;

const changeModelPage: Function = (inject("changeModelPage") as unknown) as any;
const shareDialog: any = inject("shareDialog");

const property = reactive({
  profession: 1,
  impromptu: 2,
  memory: 3,
  consciousness: -1,
  humor: -2,
});

onMounted(async () => {
  $endApi.v1.initial.modelInfo().then((res) => {
    const { code, data } = res;
    if (code === 1) {
      const list = data.bot;

      list.forEach((item: any) => {
        property[item.key] = item.num;
      });
    }
  });

  setTimeout(() => {
    Object.assign(canvasDom.value!.style, {
      transformOrigin: "top center",
      transform: "scale(0.85) translateY(5%)",
    });
  }, 100);

  viewer.model?.loadFBX("standing_greeting");
});

async function handleLeave(page: Component, show: boolean) {
  if (!canvasDom.value) return;

  Object.assign(canvasDom.value.style, {
    transformOrigin: "",
    transform: "",
  });

  await sleep(200);

  changeModelPage(page, show);
}

function handleGhost() {
  handleLeave(GhostPage, false);
}

function handleWordCloud() {
  handleLeave(WordCloudPage, true);
}

onBeforeMount(() => {
  $endApi.v1.initial
    .saveModelStats({
      ...property,
    })
    .then((res) => {
      console.log(res);
    });
});
</script>

<template>
  <div class="ModelPropertyPage">
    <div class="ModelPropertyPage-Mask" />
    <div class="ModelPropertyPage-MaskStroke" />

    <div class="ModelPropertyPage-FingerPrint" @click="handleLeave(MainPage, true)">
      <IconSvgFingerPrint />
    </div>

    <div class="ModelPropertyPage-Nav z-10">
      <IconSvgGhostSvg @click="handleGhost" />
      <IconSvgButterflySvg @click="handleLeave(InputPage, true)" />
      <IconSvgPlanedSvg @click="handleWordCloud" />
      <IconSvgShareSvg @click="shareDialog = true" />
    </div>

    <div class="ModelPropertyPage-Main">
      <div class="ModelPropertyPage-Main-Tooltip">
        <P>我希望这个数字人</P>
        <p>可以更加...</p>
      </div>

      <div class="ModelPropertyPage-Main-Inner">
        <div class="ModelPropertyPage-Main-InnerItem">
          <el-slider
            v-model="property.humor"
            :class="{ hide: property.humor < -2 }"
            :min="-3"
            :max="3"
            :step="1"
            vertical
            height="200px"
          />
          <span>幽默感</span>
        </div>
        <div class="ModelPropertyPage-Main-InnerItem">
          <el-slider
            v-model="property.profession"
            :class="{ hide: property.profession < -2 }"
            :min="-3"
            :max="3"
            :step="1"
            vertical
            height="200px"
          />
          <span>专业化</span>
        </div>
        <div class="ModelPropertyPage-Main-InnerItem">
          <el-slider
            v-model="property.impromptu"
            :class="{ hide: property.impromptu < -2 }"
            :min="-3"
            :max="3"
            :step="1"
            vertical
            height="200px"
          />
          <span>即兴度</span>
        </div>
        <div class="ModelPropertyPage-Main-InnerItem">
          <el-slider
            v-model="property.memory"
            :class="{ hide: property.memory < -2 }"
            :min="-3"
            :max="3"
            :step="1"
            vertical
            height="200px"
          />
          <span>记忆度</span>
        </div>
        <div class="ModelPropertyPage-Main-InnerItem">
          <el-slider
            v-model="property.consciousness"
            :class="{ hide: property.consciousness < -2 }"
            :min="-3"
            :max="3"
            :step="1"
            vertical
            height="200px"
          />
          <span>自我意识</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ModelPropertyPage-Main-Inner {
  &Item {
    :deep(.el-slider) {
      .el-slider__runway {
        margin: 0;

        background-color: transparent;
      }

      .el-slider__bar {
        border-radius: 35px;
        background: #8e6ff7;
      }

      padding: 17px 1px 17px 1px;

      .el-slider__button-wrapper {
        .el-slider__button {
          width: 32px;
          height: 32px;

          background: #8e6ff7;

          border-radius: 50%;
          border: 3px solid #ffffff;

          transform: scale(1.1);
          box-shadow: 0px 7px 18px 5px #ffffff;
        }
      }

      &::after {
        content: "";
        position: absolute;

        bottom: 1px;
        left: 1px;

        width: calc(100% - 2px);
        height: 30px;

        background: #8e6ff7;

        border: 2px solid #8e6ff7;

        border-radius: 0 0 35px 35px;
      }

      &.hide {
        &::after {
          opacity: 0;
        }
      }

      background: #ffffff;

      border: 2px solid #8e6ff7;

      border-radius: 35px;
      box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);

      // --el-slider-border-radius: 35px;
      --el-slider-height: 30px;
      // --el-slider-button-size: 30px;
      --el-slider-button-wrapper-size: 30px;
      --el-slider-button-wrapper-offset: -1px;
    }

    span {
      margin: 2rem 0;

      font-family: Alibaba PuHuiTi 3;
      font-size: 12px;
      font-weight: bold;
      line-height: 22px;
      text-align: center;
      letter-spacing: 0px;

      font-variation-settings: "opsz" auto;
      font-feature-settings: "kern" on;
      color: #737373;
    }

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  display: flex;

  gap: 1rem;

  width: calc(100% - 90px);

  justify-content: space-between;
}

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
  background-image: radial-gradient(circle at 50% 25%, #8e6ff7 96px, #0000 96px);
}

.ModelPropertyPage {
  &-Main {
    &-Tooltip {
      padding: 1rem;
      margin: 2rem 0;

      width: 192px;

      color: #fff;
      font-size: 16px;
      font-variation-settings: "opsz" auto;

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

        font-variation-settings: "opsz" auto;
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

    font-variation-settings: "opsz" auto;

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

    animation: popFadeIn 0.25s 0.125s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
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

  gap: 45px;
  align-items: center;
  flex-direction: column;

  transform: translateY(-50%);
}
</style>
