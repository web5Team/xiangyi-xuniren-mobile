<script setup lang="ts">
const props = defineProps({
  error: Object,
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="NotFound fake-background">
    <div class="NotFound-Main">
      <h1 class="NotFound-Title">
        {{ error.statusCode || error }}
        <!-- <span v-for="item of error?.statusCode" :key="item">{{ item }}</span> -->
      </h1>

      <div class="NotFound-Box fake-background">
        <p>按住 Ctrl+Shift+R 刷新页面重试.</p>

        <ButtonShiningButton @click="handleError">
          返回主页
        </ButtonShiningButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.NotFound-Box {
  p {
    font-size: 1.5rem;
  }

  position: absolute;
  display: flex;
  padding: 1rem;

  left: 50%;
  top: 50%;

  width: 20rem;
  height: 200px;

  gap: 3rem;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  --fake-opacity: 0.95;
  overflow: hidden;
  border-radius: 8px;
  transform: translate(-50%, -50%);
  // border: 1px solid var(--el-text-color-primary);
  backdrop-filter: blur(18px) saturate(180%);
}

.NotFound-Title {
  position: absolute;

  top: 40%;
  left: 50%;

  // color: #00000001;
  font-size: 10rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 2rem;
  filter: drop-shadow(0 0 4px var(--el-text-color-primary));
  transform: translate(-50%, -50%) translateX(1rem);

  span {
    background: radial-gradient(
      circle,
      var(--el-text-color-primary) 0%,
      #0000 70%
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.NotFound {
  position: absolute;

  width: 100%;
  height: 100%;

  --fake-opacity: 0.85;
}

.NotFound-Main {
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  backdrop-filter: blur(18px) saturate(180%);
}
</style>
