<script setup>
import { useLoginState } from '~/components/chore/login/index'

const nextGuide = inject('nextGuide')
const loginState = useLoginState()

function handleRegister() {
  loginState.data.mode = 'register'

  nextGuide()
}

function handleLogin() {
  loginState.data.mode = 'login'

  nextGuide()
}
</script>

<template>
  <div class="GuideAuth flex items-center gap-4">
    <button v-wave @click="handleRegister">
      注册
    </button>
    <button v-wave @click="handleLogin">
      登录
    </button>
    <p v-wave>
      游客进入
    </p>
  </div>
</template>

<style lang="scss" scoped>
.GuideAuth {
  button {
    padding: 2px 40px;

    border-radius: 13px;

    font-weight: bold;
    background: #ffffff;
  }

  font-size: 18px;
  color: #8e6ff7;
}
</style>
