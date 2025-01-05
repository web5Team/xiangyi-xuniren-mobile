<script setup lang="ts">
import SmsLogin from './sms/SmsLogin.vue'

const nextComp: any = inject('nextComp')!

const loginAvenues = reactive([
  {
    icon: 'i-carbon-apple',
    text: '苹果账号登录',
  },
  {
    icon: 'i-carbon-email',
    text: '邮箱登录',
  },
])

function handleSmsLogin() {
  nextComp(SmsLogin, {
    title: '添加手机 1/3',
    canBack: true,
  })
}
</script>

<template>
  <div class="CreateAccount">
    <p>
      开始创建新账户，这也是通往数字世界的钥匙
    </p>

    <div class="CreateAccount-Main">
      <el-button v-wave class="major-button" size="large" @click="handleSmsLogin">
        <div i-carbon-phone mx-2 />手机验证码登录
      </el-button>

      <div class="CreateAccount-Main-Divider">
        <el-divider />
        <p>或者</p>
      </div>

      <div class="CreateAccount-Main-Avenue">
        <el-button
          v-for="avenue in loginAvenues" :key="avenue.text" v-wave plain class="vice-button" size="large"
          @click="avenue?.click"
        >
          <div mx-2 :class="avenue.icon" />
          <span>{{ avenue.text }}</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.CreateAccount-Main-Avenue {
  .vice-button {
    &:active,
    &:hover {
      background-color: var(--theme-color-light);
    }
    height: 60px;
    border-radius: 4px;
    opacity: 1;

    /* 自动布局 */
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 4px 16px;
    gap: 4px;
    align-self: stretch;

    box-sizing: border-box;
    border: 1px solid #ffffff;
  }
  display: flex;

  gap: 0.5rem;
  flex-direction: column;
}

.CreateAccount-Main-Divider {
  p {
    position: absolute;
    padding: 0 0.5rem;

    top: 0;
    left: 50%;

    transform: translate(-50%, -50%);
    background-color: var(--el-bg-color);
  }

  position: relative;
  margin-top: 2rem;
}

.CreateAccount {
  &-Main {
    margin: 2rem 0;

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
      border: none !important;
      background-color: #6400cd;
      box-shadow: 0px 12px 12px -8px rgba(100, 0, 205, 0.16);
    }
  }

  padding: 2rem 0;

  color: #27252e;

  text-align: center;
}
</style>
