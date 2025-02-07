<script lang="ts" setup>
import { useDownloadModel, useDownloadModels } from ".";
import Copyright from "~/components/chore/Copyright.vue";

const actionList = Object.keys(import.meta.glob("~/composables/model/daily/*.fbx"));
const modelList = ["/xyfemale.vrm", "/xymale.vrm"];
const totalList = [...actionList, ...modelList];

const globalProgress = ref(0);

const globalError = ref(false);
const loading = ref(false);
const visible = ref(false);

const { progress, isDownloading, error, download, abort, activeTask } = useDownloadModels(
  totalList,
  1
);

async function handleDownloadModel() {
  if (activeTask.value.length > 0) return;

  loading.value = true;

  globalProgress.value = 0;
  globalError.value = false;

  const scope = effectScope();

  scope.run(() => {
    watch(progress, (val) => {
      globalProgress.value = val;
    });

    watch(isDownloading, (val) => {
      if (val) loading.value = val;

      if (val === false) {
        if (globalProgress.value >= 100 && !globalError.value) {
          nextTick(async () => {
            scope.stop();

            await sleep(3000);

            loading.value = false;

            await sleep(200);

            visible.value = true;
          });
        }
      }
    });

    watch(error, (val) => {
      if (val) {
        globalError.value = true;

        activeTask.value = [];

        abort?.();
      }
    });
  });

  download();
}

onMounted(handleDownloadModel);
</script>

<template>
  <div :class="{ visible, loading }" class="SplashModule absolute-layout z-10">
    <div class="SplashModule-Content transition-cubic absolute-layout">
      <slot />
    </div>
    <div class="SplashModule-Loading transition-cubic absolute-layout z-10">
      <SplashLoading
        :error="globalError"
        :percentage="Math.min(globalProgress, 100)"
        :tasks="activeTask"
        @retry="handleDownloadModel"
      />
    </div>
    <div
      class="SplashModule-Copyright transition-cubic pointer-events-none absolute-layout z-10"
    >
      <Copyright />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.SplashModule {
  background-color: var(--el-bg-color);

  &-Content {
    width: 100%;
    height: 100%;
  }

  &-Loading {
    width: 100%;
    height: 100%;
  }

  &.visible {
    .SplashModule-Loading {
      opacity: 0;
      pointer-events: none;
      transform: scale(0.95);
    }

    .SplashModule-Content {
      opacity: 1;
      transform: scale(1);

      pointer-events: auto;
    }
  }

  .SplashModule-Content {
    opacity: 0;
    transform: scale(1.05);

    pointer-events: none;
  }

  &.loading {
    .SplashModule-Copyright {
      transform: translateY(0%);
    }
  }

  .SplashModule-Copyright {
    transform: translateY(100%);
  }
}
</style>
