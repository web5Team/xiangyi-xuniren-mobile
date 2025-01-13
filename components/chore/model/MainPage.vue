<script setup lang="ts">
import GhostPage from './GhostPage.vue'
import PropertyPage from './PropertyPage.vue'

const shareDialog: any = inject('shareDialog')
const changeModelPage: any = inject('changeModelPage')

function handleGhost() {
  changeModelPage(GhostPage, false)
}
</script>

<template>
  <div class="ModelMainPage">
    <div class="ModelMainPage-Date">
      <p class="day">
        <span mr-2>{{ userStore.days || 0 }}</span>天
      </p>
      <p class="desc">
        今天是{{ userStore.name }}与你相随
      </p>
    </div>

    <div class="ModelMainPage-FingerPrint">
      <IconSvgFingerPrint />
    </div>

    <div class="ModelMainPage-Nav">
      <IconSvgGhostSvg @click="handleGhost" />
      <IconSvgButterflySvg />
      <IconSvgPlanedSvg @click="changeModelPage(PropertyPage, true)" />
      <IconSvgShareSvg @click="shareDialog = true" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ModelMainPage {
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

.ModelMainPage-FingerPrint {
  position: absolute;

  top: 50%;
  left: 1rem;

  transform: translateY(-50%);
}

.ModelMainPage-Nav {
  position: absolute;
  display: flex;

  top: 50%;
  right: 1rem;

  gap: 25px;
  flex-direction: column;

  transform: translateY(-50%);
}
</style>
