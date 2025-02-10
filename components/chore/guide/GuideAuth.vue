<script setup>
import { useLoginState } from "~/components/chore/login/index";
import { $endApi } from "~/composables/api/base";

const nextGuide = inject("nextGuide");
const loginState = useLoginState();

function handleRegister() {
  loginState.data.mode = "register";

  nextGuide();
}

function handleLogin() {
  loginState.data.mode = "login";

  nextGuide();
}

async function handleTourist() {
  loginState.data.mode = "tourist";

  const res = await $endApi.v1.auth.loginByTourist();
  if (
    responseMessage(res, {
      success: "",
      triggerOnDataNull: false,
    })
  ) {
    loginState.data.stashedToken = res.data.token;
    userStore.value.token = {
      accessToken: res.data.token,
      refreshToken: "",
    };
    userStore.value.completeQuestion = !!res.data.complete_question;

    nextGuide();
  }

  // save name
  const result = await $endApi.v1.initial.saveModelName(loginState.data.name);
  if (
    responseMessage(result, {
      success: "",
      triggerOnDataNull: false,
    })
  )
    userStore.value.name = loginState.data.name;
}
</script>

<template>
  <div class="GuideAuth flex items-center gap-4">
    <button v-wave @click="handleRegister">注册</button>
    <button v-wave @click="handleLogin">登录</button>
    <p v-wave @click="handleTourist">游客进入</p>
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
