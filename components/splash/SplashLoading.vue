<script lang="ts" setup>
import FingerPrint from "~/components/icon/svg/FingerPrint.vue";

const props = defineProps({
  percentage: {
    type: Number,
    default: 0,
  },
  error: {
    type: Boolean,
    default: false,
  },
  tasks: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const emits = defineEmits(["retry"]);
const text = computed(() => {
  if (props.tasks.length === 0) return "加载中...";

  const taskText = props.tasks.map((task) => task.split("/").pop()).join(", ");

  return `正在下载 ${taskText}`;
});
</script>

<template>
  <div
    :class="{ error }"
    class="SplashLoading absolute-layout flex items-center justify-center"
  >
    <div
      class="SplashLoading-Content transition-cubic flex flex-col items-center justify-center"
    >
      <el-progress
        color="#8E6FF7"
        :stroke-width="10"
        type="circle"
        :percentage="percentage ?? 0"
        :format="() => `${percentage.toFixed(1)}%`"
      >
        <template v-if="error">
          <div font-b5ld flex items-center justify-center font-size-10 text-red-500>
            <div i-carbon-close />
          </div>
        </template>
      </el-progress>
      <div
        class="transition-cubic"
        :class="{ 'op-0': error || percentage >= 100 }"
        mt-8
        flex
        items-center
        justify-center
        font-size-4
        op-60
      >
        {{ text }}
      </div>
    </div>
    <div
      class="SplashLoading-Error transition-cubic flex flex-col items-center justify-center gap-4"
    >
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
