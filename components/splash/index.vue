<script lang="ts" setup>
import { useDownloadModel, useDownloadModels } from ".";
import Copyright from "~/components/chore/Copyright.vue";

const actionList = Object.keys(import.meta.glob("~/composables/model/daily/**/*.fbx"));
const modelList = ["/xyfemale.vrm", "/xymale.vrm"];
const totalList = [...actionList, ...modelList];

const globalProgress = ref(0);

const globalError = ref(false);
const loading = ref(!false);
const visible = ref(false);

async function handleDownloadModel() {
  loading.value = true;

  globalProgress.value = 0;
  globalError.value = false;

  const { progress, isDownloading, error, download, abort } = useDownloadModels(
    totalList,
    1
  );

  const scope = effectScope();

  scope.run(() => {
    watch(progress, (val) => {
      globalProgress.value = val;
    });

    watch(isDownloading, (val) => {
      if (val) loading.value = val;

      if (val === false) {
        nextTick(async () => {
          if (globalProgress.value === 100 && !globalError.value) {
            scope.stop();

            await sleep(500);

            loading.value = false;

            await sleep(500);

            visible.value = true;
          }
        });
      }
    });

    watch(error, (val) => {
      if (val) {
        globalError.value = true;

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
    <div class="SplashModule-Content absolute-layout">
      <slot />
    </div>
    <div class="SplashModule-Loading absolute-layout z-10">
      <SplashLoading
        :error="globalError"
        :percentage="globalProgress"
        @retry="handleDownloadModel"
      />
    </div>
    <div
      class="SplashModule-Copyright transition-cubic absolute-layout pointer-events-none z-10"
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
