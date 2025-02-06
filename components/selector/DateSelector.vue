<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  size?: 'default' | 'small' | 'large'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', dates: [string, string]): void
}>()

const visible = useVModel(props, 'modelValue', emit)

// 添加开始和结束日期
const startDate = ref('')
const endDate = ref('')

// 格式化日期函数
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN').replace(/\//g, '/')
}

// 监听日期变化
watch([startDate, endDate], ([newStart, newEnd]) => {
  if (newStart && newEnd) {
    emit('change', [formatDate(newStart), formatDate(newEnd)])
    // 选择完成后关闭弹窗
    visible.value = false
  }
})
</script>

<template>
  <div :class="{ visible }" class="absolute-layout DateSelector">
    <div class="DateSelector-Content">
      <div class="DateSelector-Content-Date w-full">
        <el-date-picker
          v-model="startDate"
          type="date"
          placeholder="选择开始日期"
          :size="size"
          style="margin-right: 10px"
        />
        <el-date-picker
          v-model="endDate"
          type="date"
          placeholder="选择结束日期"
          :size="size"
        />
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
    left: 15%;
    width: 70%;
    display: flex;
    justify-content: center;
    align-items: center;

    &-Date {
      display: flex;
      align-items: center;
    }
  }

  &.visible {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
