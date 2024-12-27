<script setup lang="ts">
const props = defineProps<{
  modelValue?: boolean
}>()
</script>

<template>
  <div class="LoginFlower">
    <div v-for="i in 4" :key="i" class="LoginFlower-Item" />
    <div class="LoginFlower-Icon">
      <div i-carbon-checkmark />
    </div>
  </div>
</template>

<style lang="scss">
.LoginFlower {
  &-Item {
    position: relative;

    top: 0;
    left: 0;

    width: calc(var(--size) / 2);
    height: calc(var(--size) / 2);

    border-radius: 50%;
    background-color: var(--theme-color-light);
  }
  &-Icon {
    position: absolute;
    top: 50%;
    left: 50%;

    transform: translate(-50%, -50%);

    width: calc(var(--size) / 2);
    height: calc(var(--size) / 2);

    border-radius: 50%;
    background-color: var(--theme-color-light);

    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 24px;
    font-weight: 600;
    color: #8333d7;
  }
  position: relative;
  margin: 2rem 2rem 3rem;
  display: grid;

  width: var(--size);
  height: var(--size);

  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);

  --size: 88px;
  background-color: var(--el-bg-color);
}
</style>
