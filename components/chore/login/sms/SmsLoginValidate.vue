<script setup lang="ts">
import { useLoginState } from '..'
import CreateAccount from '../CreateAccount.vue'
import Success from '../Success.vue'
import { $endApi } from '~/composables/api/base'

const router = useRouter()
const input = ref<HTMLElement>()
const loginState = useLoginState()
const nextComp: any = inject('nextComp')
const prevComp: any = inject('prevComp')

const options = reactive({
  loading: false,
  code: '',
  step: 2,
})

const valid = computed(() => `${options.code}`.length === 5)

async function handleSmsLogin() {
  if (!valid.value)
    return

  options.loading = true

  const res = await $endApi.v1.auth.loginOrRegister(loginState.data.identifier, options.code)

  options.loading = false

  if (responseMessage(res, {
    success: '登录成功',
    triggerOnDataNull: false,
  })) {
    userStore.value.token = { accessToken: res.data.token, refreshToken: '' }
    userStore.value.completeQuestion = !!res.data.complete_question

    await router.push('/')

    nextComp(Success, {
      title: '',
      canBack: false,
    })
  }
  else {
    options.code = ''
  }
}

onStartTyping(() => {
  input.value?.focus()
})
</script>

<template>
  <div class="SmsLoginValidate">
    <div class="SmsLoginValidate-Header">
      <div
        v-for="step in 3" :key="step" :class="{ active: step <= options.step }"
        class="SmsLoginValidate-Header-Step"
      />
    </div>

    <div class="SmsLoginValidate-Main">
      <div>
        <p>我们发送了5个数字到</p>
        <p>{{ loginState.data.identifier }}, 在下面输入:</p>
      </div>

      <p my-2 text-start>
        验证码
      </p>
      <div flex items-center class="SmsLoginValidate-Input">
        <div
          v-for="i in 5" :key="i" :class="{ active: i - 1 === `${options.code}`.length }"
          class="SmsLoginValidate-InputDisp" v-text="[...(`${options.code}`)]?.[i - 1]"
        />
      </div>
      <input ref="input" v-model.number="options.code" :maxlength="5" op-0 class="major-input" size="large">
      <el-button
        v-loading="options.loading" v-wave :class="{ valid }" class="major-button" size="large"
        @click="handleSmsLogin"
      >
        验证手机
      </el-button>

      <p mt-4>
        错误手机号？<span font-bold @click="prevComp">发送至另一个</span>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.SmsLoginValidate-InputDisp {
  &.active {
    border: 1px solid #6400cd;

    /* Focused shadow */
    box-shadow: 0px 0px 0px 4px rgba(100, 0, 205, 0.12);
  }

  display: flex;

  align-items: center;
  justify-content: center;

  top: 0;
  left: 0;

  width: 65.4px;
  height: 48px;
  border-radius: 12px;
  opacity: 1;

  /* 自动布局 */
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 12px;
  flex-grow: 1;

  background: #ffffff;

  box-sizing: border-box;
  border: 1px solid #9ea1a8;

  z-index: 0;
}

.SmsLoginValidate-Input {
  position: absolute;

  gap: 4px;
  display: flex;
  justify-content: center;

  width: 100%;
}

.SmsLoginValidate-Header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  padding: 0px;

  gap: 10px;

  width: 100%;
  height: 24px;

  .SmsLoginValidate-Header-Step {
    width: 20px;
    height: 4px;
    border-radius: 2px;

    background: #edecef;

    &.active {
      background: #cfb0f0;
    }
  }
}

.SmsLoginValidate {
  &-Main {
    margin: 1.5rem 0;

    .major-input {
      margin: 5px 0 10px;

      width: 100%;
      height: 48px;

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
