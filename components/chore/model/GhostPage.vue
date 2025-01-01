<script setup lang="ts">
const {
  ensurePermissions,
  permissionGranted,
  audioInputs: microphones,
} = useDevicesList()
const currentMicrophone = computed(() => microphones.value[0]?.deviceId)

const { stream, start, stop } = useUserMedia({
  constraints: reactive({
    video: false,
    audio: { deviceId: currentMicrophone },
  }),
})

onMounted(async () => {
  await ensurePermissions()

  if (permissionGranted.value) {
    await start()

    console.log(stream)
  }
})
</script>

<template>
  <div class="ModelGhostPage">
    <div class="ModelGhostPage-Date">
      <p class="day">
        <span mr-2>11</span>天1
      </p>
      <p class="desc">
        今天是烟烟与你相随
      </p>
    </div>

    <div class="ModelGhostPage-Content">
      <ClientOnly>
        <ChoreWavingRecorder v-if="stream" :audio-stream="stream" />
      </ClientOnly>
    </div>

    <div class="ModelGhostPage-FingerPrint">
      <IconSvgFingerPrint />
    </div>

    <div class="ModelGhostPage-Nav">
      <IconSvgGhostFilledSvg />
      <IconSvgButterflySvg />
      <IconSvgPlanedSvg />
      <IconSvgShareSvg />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ModelGhostPage-Content {
  position: absolute;
  padding: 0 10%;

  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);
}

.ModelGhostPage {
  &-Date {
    position: absolute;

    top: 3rem;
    left: 2rem;
    .day {
      span {
        color: #8e6ff7;

        font-family: Source Han Sans;
        font-weight: 400;
        font-size: 36px;
        font-variation-settings: 'opsz' auto;
      }

      color: #aeb3be;

      font-family: Source Han Sans;
      font-weight: 400;
      font-size: 20px;
      font-variation-settings: 'opsz' auto;
    }

    .desc {
      font-family: Source Han Sans;
      font-size: 10px;
      font-weight: normal;
      line-height: 22px;
      text-align: center;
      letter-spacing: 0px;

      font-variation-settings: 'opsz' auto;
      font-feature-settings: 'kern' on;
      color: #9e9e9e;
    }

    font-family: Source Han Sans;
    font-size: 20px;
    font-weight: normal;
    line-height: 22px;
    text-align: center;
    letter-spacing: 0px;

    font-variation-settings: 'opsz' auto;
    font-feature-settings: 'kern' on;
  }
}

.ModelGhostPage-FingerPrint {
  position: absolute;

  top: 50%;
  left: 1rem;

  transform: translateY(-50%);
}

.ModelGhostPage-Nav {
  position: absolute;
  display: flex;

  top: 50%;
  right: 1rem;

  gap: 25px;
  align-items: center;
  flex-direction: column;

  transform: translateY(-50%);
}
</style>
