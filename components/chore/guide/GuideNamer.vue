<script setup>
import GuideAuth from './GuideAuth.vue'

const name = ref('')

const nextGuide = inject('nextGuide')

function handleNext() {
  nextGuide(GuideAuth, 150)
}
</script>

<template>
  <div class="GuideNamer flex items-center">
    <div class="GuideNamer-Input" mt-4>
      <input v-model="name">
      <div
        :style="`${name?.length ? 'opacity: 0' : ''}`"
        class="GuideNamer-Input-Placeholder transition-cubic pointer-events-none"
      >
        给伙伴起个名字吧
        <span>|</span>
      </div>
    </div>
    <IconSvgFingerPrint mx-auto @click="handleNext" />
  </div>
</template>

<style lang="scss" scoped>
@keyframes blink {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.GuideNamer-Input-Placeholder span {
  animation: blink 1s infinite;
}

.GuideNamer {
  &-Input {
    input {
      position: absolute;

      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      background-color: transparent;
      outline: none !important;
    }

    &:focus-within {
      .GuideNamer-Input-Placeholder {
        opacity: 0;
      }
    }

    position: relative;

    margin: 0 1rem;

    height: 47px;
  }
  font-family: Alibaba PuHuiTi 3;
  font-size: 18px;
  font-weight: bold;
  line-height: 43px;
  text-align: center;
  letter-spacing: 0px;

  font-variation-settings: 'opsz' auto;
  font-feature-settings: 'kern' on;
  color: #696969;
}
</style>
