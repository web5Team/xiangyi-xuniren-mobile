<script setup>
import GuideNamer from './GuideNamer.vue'

const nextGuide = inject('nextGuide')

function handleClick() {
  nextGuide()
}
</script>

<template>
  <div class="GuideAuth flex items-center gap-4" @click="handleClick">
    <button v-wave>
      注册
    </button>
    <button v-wave>
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
