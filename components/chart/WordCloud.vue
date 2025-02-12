<script setup>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GraphChart } from 'echarts/charts'
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'
import { provide, ref } from 'vue'
import struct from './struct.json'

use([CanvasRenderer, GraphChart, TitleComponent, TooltipComponent, LegendComponent])

provide(THEME_KEY, 'dark')

// const struct = JSON.parse(structText);

// graph.nodes.forEach((node) => {
//   node.label = {
//     show: node.symbolSize > 30,
//   };
// });

// const option = ref({
//   title: {
//     text: 'Les Miserables',
//     subtext: 'Default layout',
//     top: 'bottom',
//     left: 'right',
//   },
//   tooltip: {},
//   legend: [
//     {
//       // selectedMode: 'single',
//       data: graph.categories.map((a) => {
//         return a.name
//       }),
//     },
//   ],
//   animationDuration: 1500,
//   animationEasingUpdate: 'quinticInOut',
//   series: [
//     {
//       name: 'Les Miserables',
//       type: 'graph',
//       legendHoverLink: false,
//       layout: 'none',
//       data: graph.nodes,
//       links: graph.links,
//       categories: graph.categories,
//       roam: true,
//       label: {
//         position: 'right',
//         formatter: '{b}',
//       },
//       lineStyle: {
//         color: 'source',
//         curveness: 0.3,
//       },
//       emphasis: {
//         focus: 'adjacency',
//         lineStyle: {
//           width: 10,
//         },
//       },
//     },
//   ],
// })
const option = ref(struct)
</script>

<template>
  <VChart class="chart" :option="option" />
</template>

<style scoped>
.chart {
  height: 100%;
}
</style>
