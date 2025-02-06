<script lang="ts" setup>
import FingerPrint from "~/components/icon/svg/FingerPrint.vue";

defineProps({
  percentage: {
    type: Number,
    default: 0,
  },
  error: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(["retry"]);
</script>

<template>
  <div
    :class="{ error }"
    class="SplashLoading absolute-layout flex items-center justify-center"
  >
    <div class="SplashLoading-Content transition-cubic">
      <el-progress
        color="#8E6FF7"
        :stroke-width="10"
        type="circle"
        :percentage="percentage"
        :format="() => `${Math.round(percentage)}%`"
      >
        <template v-if="error">
          <div font-b5ld flex items-center justify-center font-size-10 text-red-500>
            <div i-carbon-close />
          </div>
        </template>
      </el-progress>
    </div>
    <div
      class="SplashLoading-Error transition-cubic flex flex-col items-center justify-center gap-4"
    >
      <FingerPrint />
      <el-button text bg @click="emits('retry')"> 点击重试 </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.SplashLoading-Content {
  .el-progress {
    transform: scale(1.25);
  }

  .error.SplashLoading & {
    transform: translateY(-70px);
  }
}

.SplashLoading-Error {
  position: absolute;

  opacity: 0;

  .error.SplashLoading & {
    opacity: 1;
    transform: translateY(70px);
  }
}
</style>
