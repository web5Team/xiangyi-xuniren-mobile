<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  
})
</script>

<template>
  <div class="PermissionRequired">
    <h1>{{ title }}</h1>
  </div>
</template>

<style lang="scss" scoped>
.PermissionRequired {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>