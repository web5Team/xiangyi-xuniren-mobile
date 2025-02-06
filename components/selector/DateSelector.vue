<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const visible = useVModel(props, 'modelValue', emit)
</script>

<template>
  <div :class="{ visible }" class="absolute-layout DateSelector">
    <div class="DateSelector-Content">
      <div class="DateSelector-Content-Date">
        <p>开始日期</p>
        <p>结束日期</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.DateSelector {
  z-index: 10;

  opacity: 0;
  pointer-events: none;

  &-Content {
    position: absolute;

    top: calc(7rem + 48px);

    width: 100%;
    height: 300px;

    background-color: #fff;

  }

  &.visible {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
