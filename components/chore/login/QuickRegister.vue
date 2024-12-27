<script setup lang="ts">
const props = defineProps<{
  modelValue?: boolean
}>()
</script>

<template>
  <div>
    <el-input w-full placeholder="请输入账号">
      <template #suffix>
        <div i-carbon-view text-bold text-black />
      </template>
    </el-input>
  </div>
</template>
