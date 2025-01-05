<script setup lang="ts">
import type { INextCompOptions } from '.'
import QuickRegister from '~/components/chore/login/QuickRegister.vue'
import CreateAccount from '~/components/chore/login/CreateAccount.vue'

interface IDispComp {
  comp: Component
  options: INextCompOptions
}

const options = reactive<{
  current: IDispComp
  stack: IDispComp[]
}>({
  current: {
    options: {
      canBack: true,
      title: '创建账户',
    },
    comp: CreateAccount,
  },
  stack: [],
})

const mainDom = ref<HTMLElement>()

function newDispComp(option: IDispComp) {
  options.stack.push(options.current)

  Object.assign(options, {
    current: option,
  })
}

function backDispComp() {
  const stack = options.stack
  if (stack.length === 0)
    return

  const result = stack.pop()!

  Object.assign(options, {
    current: result,
  })

  return result
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
    options,
    comp: component,
  })

  Object.assign(dom.style, {
    transform: 'translate(0, 0)',
  })
}

async function prevComp() {
  const dom = mainDom.value
  if (!dom)
    return

  Object.assign(dom.style, {
    transform: 'translate(120%, 0)',
  })

  await sleep(300)

  dom.style.transition = '0s all'

  dom.style.opacity = '0'

  await sleep(10)

  Object.assign(dom.style, {
    transform: 'translate(-120%, 0)',
  })

  await sleep(100)

  dom.style.transition = ''
  dom.style.opacity = '1'

  backDispComp()

  Object.assign(dom.style, {
    transform: 'translate(0, 0)',
  })
}

provide('nextComp', nextComp)
provide('prevComp', prevComp)
</script>

<template>
  <div class="LoginPage">
    <div ref="mainDom" class="LoginPage-Content transition-cubic">
      <div relative w-full flex items-center justify-center class="LoginPage-Content-Header">
        <div v-if="options.stack.length > 0 && options.current.options.canBack" absolute left-0 active:op-50 class="arrow-icon" @click="prevComp">
          <div i-carbon-arrow-left />
        </div>
        <p>
          {{ options.current.options.title }}
        </p>
      </div>

      <div class="LoginPage-Content-Main">
        <component :is="options.current.comp" />
      </div>
    </div>

    <div class="LoginPage-Footer">
      使用相一服务，代表你同意<br><span font-bold>条款</span>和<span font-bold>隐私政策</span>
    </div>
  </div>
</template>

<style lang="scss">
.LoginPage {
  &-Content {
    &-Header {
      color: #000;
      font-size: 20px;
      line-height: 28px;
    }

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

.LoginPage-Footer {
  position: absolute;

  bottom: 10%;

  color: #605d67;
  font-size: 14px;
  text-align: center;
}
</style>
