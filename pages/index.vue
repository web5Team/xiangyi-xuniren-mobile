<script setup lang="ts">
import { modelManager } from '~/composables/model'

const dom = ref<HTMLElement>()

const { x, y } = useMouse()

onMounted(() => {
  modelManager.load(dom.value)

  setInterval(() => {
    modelManager.onAnimate((vrm) => {
      modelManager.updateEye(x.value, y.value, vrm)
    })
  }, 100)

  useEventListener('resize', () => modelManager.resize(dom.value))

  // modelManager.onAnimate(() => {
  //   const vrm = modelManager.gltf.userData.vrm

  //   const leftEyeBone = vrm.humanoid.getBoneNode(THREE.VRMHumanBoneName.LeftEye)
  //   const rightEyeBone = vrm.humanoid.getBoneNode(THREE.VRMHumanBoneName.RightEye)

  //   // 假设目标是鼠标位置
  //   const target = new THREE.Vector3(x, y, 0) // 鼠标位置作为目标，或者其他目标坐标

  //   // 获取眼睛到目标的方向
  //   const direction = new THREE.Vector3().subVectors(target, vrm.scene.position).normalize()

  //   leftEyeBone.lookAt(target)
  //   rightEyeBone.lookAt(target)
  // })
})
</script>

<template>
  <div class="ModelPage">
    <div ref="dom" class="ModelPage-Container" />
  </div>
</template>

<style lang="scss">
.ModelPage {
  &-Container {
    width: 100%;
    height: 100%;
  }
  width: 100%;
  height: 100%;

  background-color: var(--el-bg-color);
}
</style>
