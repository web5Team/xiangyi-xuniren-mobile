<script setup lang="ts">
import { useLoginState } from '..'
import SmsLoginValidate from './SmsLoginValidate.vue'
import { $endApi } from '~/composables/api/base'

const loginState = useLoginState()
const nextComp: any = inject('nextComp')

const options = reactive({
  loading: false,
  phone: loginState.data.identifier || '',
  step: 1,
})

const valid = computed(() => {
  const regex = /^1[3456789]\d{9}$/

  return regex.test(options.phone)
})

async function handleSmsLogin() {
  if (!valid.value)
    return

  loginState.data.identifier = options.phone

  options.loading = true

  // SEND CODE
  const res = await $endApi.v1.auth.sendSMSCode(options.phone)

  options.loading = false

  if (res.code !== 1) {
    return ElMessage.error({
      message: `发送请求失败(${res.message})!`,
      grouping: true,
    })
  }

  nextComp(SmsLoginValidate, {
    title: '验证手机 2/3',
    canBack: true,
  })
}
</script>

<template>
  <div class="SmsLogin">
    <div class="SmsLogin-Header">
      <div v-for="step in 3" :key="step" :class="{ active: step <= options.step }" class="SmsLogin-Header-Step" />
    </div>

    <div class="SmsLogin-Main">
      <p text-start>
        手机号
      </p>
      <input v-model.number="options.phone" class="major-input" size="large" placeholder="请输入手机号">
      <el-button v-loading="options.loading" v-wave :class="{ valid }" class="major-button" size="large" @click="handleSmsLogin">
        创建账户
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.SmsLogin-Header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  padding: 0px;

  gap: 10px;

  width: 100%;
  height: 24px;

  .SmsLogin-Header-Step {
    width: 20px;
    height: 4px;
    border-radius: 2px;

    background: #edecef;

    &.active {
      background: #cfb0f0;
    }
  }
}

.SmsLogin {
  &-Main {
    margin: 2rem 0;

    .major-input {
      margin: 5px 0 10px;

      width: 100%;
      height: 48px;
      opacity: 1;

      /* 自动布局 */
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 4px 12px;
      gap: 10px;
      flex-grow: 1;
      align-self: stretch;

      border-radius: 12px;

      z-index: 1;

      outline: none !important;
      border: 1px solid #9ea1a8;

      &:active {
        border: 1px solid #9ea1a8;
      }
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
      background: #b88ae8;
      border: none !important;
      box-shadow: 0px 12px 12px -8px rgba(100, 0, 205, 0.16);

      &.valid {
        background-color: #6400cd;
      }
    }
  }

  color: #27252e;

  text-align: center;
}
</style>
