<script lang="ts">
export default {
  name: 'ArrowUpSvg',
}
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
    <g transform="rotate(-90 12 12) translate(24 0) scale(-1 1)">
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
        <path stroke-dasharray="14" stroke-dashoffset="14" d="M19 12H5.5">
          <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="14;0" />
        </path>
        <path stroke-dasharray="8" stroke-dashoffset="8" d="M5 12L10 17M5 12L10 7">
          <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.3s" dur="0.2s" values="8;0" />
        </path>
      </g>
    </g>
  </svg>
</template>
