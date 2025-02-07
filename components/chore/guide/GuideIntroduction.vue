<script setup>
import GuideNamer from "./GuideNamer.vue";
import IconSvgFingerPrint from "~/components/icon/svg/FingerPrint.vue";

const nextGuide = inject("nextGuide");

function handleClick() {
  nextGuide(GuideNamer, 100);
}
</script>

<template>
  <div class="GuideIntroduction">
    <IconSvgFingerPrint mx-auto @click="handleClick" />

    <p mt-4>理解你、记住你、帮助你</p>
    <p>也是你</p>

    <p class="desc">
      最开始有几个小问题，但就像风起于青萍之末，你在数字世界播下的一个种子，很快便会长成参天大树为你遮风避雨
    </p>
  </div>
</template>

<style lang="scss" scoped>
.GuideIntroduction {
  .desc {
    margin: 1rem auto;

    max-width: 80%;

    font-family: Alibaba PuHuiTi 3;
    font-size: 12px;
    font-weight: normal;
    line-height: 22px;
    text-align: center;
    letter-spacing: 0px;

    font-variation-settings: "opsz" auto;
    font-feature-settings: "kern" on;
    color: #696969;
  }

  font-family: Alibaba PuHuiTi 3;
  font-size: 16px;
  font-weight: bold;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0px;

  font-variation-settings: "opsz" auto;
  font-feature-settings: "kern" on;
  color: #696969;
}
</style>
