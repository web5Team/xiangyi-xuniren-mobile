<script setup lang="ts">
import type { INextCompOptions } from '.'
import QuickRegister from '~/components/chore/login/QuickRegister.vue'
import CreateAccount from '~/components/chore/login/CreateAccount.vue'

import Step1Model from '~/composables/model/daily/guide/1.vrm?url'

interface IDispComp {
  comp: Component
}

const options = reactive<{
  current: IDispComp
}>({
  current: {
    comp: CreateAccount,
  },
})

const viewer: Viewer = inject('viewer')!
const mainDom = ref<HTMLElement>()

function newDispComp(option: IDispComp) {
  Object.assign(options, {
    current: option,
  })
}

async function nextComp(component: Component, options: INextCompOptions) {
  const dom = mainDom.value
  if (!dom)
    return

  Object.assign(dom.style, {
    transform: 'translate(-120%, 0)',
  })

  await sleep(300)

  dom.style.transition = '0s all'

  dom.style.opacity = '0'

  await sleep(10)

  Object.assign(dom.style, {
    transform: 'translate(120%, 0)',
  })

  await sleep(100)

  dom.style.transition = ''
  dom.style.opacity = '1'

  newDispComp({
    comp: component,
  })

  Object.assign(dom.style, {
    transform: 'translate(0, 0)',
  })
}

provide('nextComp', nextComp)
</script>

<template>
  <div class="QuestionarePage">
    <div ref="mainDom" class="QuestionarePage-Content transition-cubic">
      <div class="QuestionarePage-Content-Main">
        1
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.QuestionarePage {
  &-Content {
    width: 100%;
    color: #27252e;
  }

  position: relative;
  padding: 2rem;
  display: flex;

  width: 100%;
  height: 100%;

  align-items: center;
  flex-direction: column;
}
</style>
