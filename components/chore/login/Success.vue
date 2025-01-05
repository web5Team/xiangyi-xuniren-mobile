<script setup lang="ts">
import { useLoginState } from '.'
import LoginFlower from '~/components/chore/login/LoginFlower.vue'

const loginState = useLoginState()

async function handleLoginDone() {
  loginState.data.dialogVisible = false
}
</script>

<template>
  <div class="SuccessPage">
    <LoginFlower animate />
    <div class="SuccessPage-Main">
      <h1>成功！</h1>
      <p my-4>
        点击进入相一世界
      </p>
      <el-button v-wave my-6 class="major-button" size="large" @click="handleLoginDone">
        进入
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.SuccessPage {
  h1 {
    /* 自动布局子元素 */
    position: static;
    left: 0px;
    top: 0px;
    height: 34px;
    opacity: 1;

    font-family: DINAlternate;
    font-size: 24px;
    font-weight: normal;
    line-height: 140%;
    text-align: center;
    display: flex;
    align-items: center;
    letter-spacing: 0px;

    color: #27252e;

    z-index: 0;
  }
  p {
    /* 自动布局子元素 */
    position: static;
    left: 0px;
    top: 46px;
    height: 26px;
    opacity: 1;

    /* Body/Regular/Regular - 16px */
    font-family: Roboto;
    font-size: 16px;
    font-weight: normal;
    line-height: 160%;
    text-align: center;
    display: flex;
    align-items: center;
    letter-spacing: 0px;

    color: #27252e;

    z-index: 1;
  }

  .major-button {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px 16px;
    gap: 10px;
    align-self: stretch;

    width: 100%;
    height: 60px;

    color: #fff;
    font-weight: 500;
    border-radius: 12px;
    background: #6400cd;
    border: none !important;
    box-shadow: 0px 12px 12px -8px rgba(100, 0, 205, 0.16);
  }

  &-Main {
    display: flex;

    align-items: center;
    flex-direction: column;

    width: 100%;

    opacity: 0;
    animation: fadeIn 0.35s 0.125s ease-in-out forwards;
    @keyframes fadeIn {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
  }

  padding: 1rem;
  display: flex;

  align-items: center;
  flex-direction: column;

  color: #27252e;

  text-align: center;
}
</style>
