<script name="ThInput" setup lang="ts">
import { encode } from 'gpt-tokenizer'
import { useFloating } from '@floating-ui/vue'
import type { ITip, ITipItem } from '../chat/input-tips'
import { cur, tipsVisible } from '../chat/input-tips'
import ThInputPlus from './ThInputPlus.vue'
import type { InputPlusProperty } from './input'
import InputHeaderFiles from './addon/InputHeaderFiles.vue'
import { type IChatInnerItemMeta, IChatItemStatus, type IInnerItemMeta } from '~/composables/api/base/v1/aigc/completion-types'
import { $endApi } from '~/composables/api/base'
import { globalOptions } from '~/constants'

const props = defineProps<{
  status: IChatItemStatus
  hide: boolean
  center: boolean
  templateEnable: boolean
  tip: ITip | null
}>()
const emits = defineEmits<{
  (event: 'selectTemplate', data: any): void
  (event: 'send', data: IInnerItemMeta[], meta: IChatInnerItemMeta): void
}>()

const template = ref<any>()
const inputProperty = ref<IChatInnerItemMeta>({
  internet: true,
  temperature: 50,
})

const input = ref<{
  text: string
  files: IInnerItemMeta[]
}>({
  text: '',
  files: [],
})
// const textInput = computed(() => input.value.filter((item: IInnerItemMeta) => item.type === 'text').map(item => item.value).join(''))
const nonPlusMode = computed(() => props.templateEnable && !template.value?.title && (input.value.text.startsWith('/') || input.value.text.startsWith('@')))
const fileUploaded = computed(() => input.value.files.filter(item => !item.extra?.sync).length === 0)
const inputHistories = useLocalStorage<string[]>('inputHistories', [])
const inputHistoryIndex = ref(inputHistories.value.length - 1)
const showSend = computed(() => input.value.text?.length || input.value.files?.length)
const canSend = computed(() => fileUploaded.value && showSend.value && (props.status === IChatItemStatus.AVAILABLE || props.status === IChatItemStatus.CANCELLED || props.status === IChatItemStatus.ERROR))

function handleSend(event: Event) {
  if (!canSend.value)
    return

  if (input.value.text.startsWith('@'))
    return

  event.preventDefault()

  const el = document.getElementById('main-input')!

  el!.style.height = ''

  inputHistories.value.push(input.value.text)
  inputHistories.value = inputHistories.value.slice(-15)

  inputHistoryIndex.value = inputHistories.value.length - 1

  // 将文件列表转换 （去除多余的内容）
  const files: IInnerItemMeta[] = input.value.files.map(item => ({
    ...item,
    extra: undefined,
  }))

  const textMeta: IInnerItemMeta = {
    type: 'text',
    value: input.value.text,
  }

  const inputMeta: IInnerItemMeta[] = [
    textMeta,
    ...files,
  ].filter(item => item.value)

  emits('selectTemplate', template.value?.id ? template.value : null)

  emits('send', inputMeta, {
    ...inputProperty.value,
    temperature: (inputProperty.value.temperature || 0) / 100,
  })

  input.value = {
    text: '',
    files: [],
  }
  template.value = {}
}

async function handleInputKeydown(event: KeyboardEvent) {
  if (!template.value?.title && input.value.text.startsWith('@'))
    return

  if (input.value.text.startsWith('/'))
    return

  if (event.key === 'Backspace') {
    if (template.value && !input.value.text)
      template.value = {}
    if (!input.value.text && input.value.files.length) {
      if (event.ctrlKey)
        input.value.files = []
      else input.value.files.pop()
    }

    setTimeout(() => {
      if (!input.value.text) {
        cur.value = -1

        tipsVisible.value = false
      }
    }, 300)
  }

  if (event.key === 'Enter') {
    event.preventDefault()

    if (event.shiftKey) {
      event.stopPropagation()

      if (input.value.text.endsWith('\n'))
        input.value.text += ' '
      else
        input.value.text += '\n'
    }
    else { handleSend(event) }

    return
  }

  if (inputHistories.value.length < 1)
    return

  const isLastOne = inputHistoryIndex.value === inputHistories.value.length - 1

  const { key, ctrlKey } = event
  if (ctrlKey && key === 'ArrowUp') {
    if (inputHistoryIndex.value !== 0 && isLastOne)
      input.value.text && inputHistories.value.push(input.value.text)

    if (!isLastOne)
      inputHistoryIndex.value -= 1
    if (inputHistoryIndex.value < 0)
      inputHistoryIndex.value = 0
  }
  else if (ctrlKey && key === 'ArrowDown') {
    if (isLastOne)
      return (input.value = { files: [], text: '' })

    inputHistoryIndex.value = inputHistoryIndex.value + 1

    if (inputHistoryIndex.value > inputHistories.value.length - 1)
      inputHistoryIndex.value = inputHistories.value.length - 1
  }
  else {
    return
  }

  input.value = { files: [], text: inputHistories.value[inputHistoryIndex.value] }
}

function triggerUpdateInput() {
  const el = document.getElementById('main-input')!

  el!.style.height = ''
  el!.style.height = `${el.scrollHeight}px`
}

const focus = ref(false)
const debouncedFocus = refDebounced(focus, 100)
const placeholder = computed(() => props.center ? '可以帮到你什么?' : 'Shift + Enter换行')

const len = ref(0)

watch(
  () => input.value.text,
  (_, oldVal) => {
    nextTick(() => {
      setTimeout(triggerUpdateInput)

      len.value = encode(input.value.text).length

      const limit = userStore.value.isLogin ? 8192 : 256
      if (len.value > limit)
        input.value.text = oldVal!

      if (props.tip) {
        if (!_.startsWith(props.tip.value))
          cur.value = -1
      }
    })
  },
  { immediate: true },
)

// watch(() => template.value, (val) => { emits('selectTemplate', val?.description ? val : null) })

function focusInput() {
  const el = document.getElementById('main-input')

  setTimeout(() => {
    el?.focus()
  })
}

onMounted(focusInput)

function handleTemplateSelect(data: any) {
  template.value = data

  input.value.text = ''
  input.value.files = []
}

function handleModelSelect(model: string) {
  globalConfigModel.value = model

  input.value.text = ''
}

const tokenLimit = computed(() => userStore.value.isLogin ? 8192 : 256)

function handleImageUpload(file: File) {
  const obj = reactive<any>({
    sync: false,
    width: 0,
    height: 0,
    syncing: false,
    error: '',
    url: '',
    img: null,
    file,
  })

  const meta = reactive({
    type: 'image',
    value: '',
    extra: obj,
  }) as any

  input.value.files.push(meta)

  const reader = new FileReader()

  reader.onload = function (e) {
    const dataUrl = e.target?.result as string

    const img = new Image()

    img.onload = function () {
      obj.width = img.width
      obj.height = img.height
    }

    obj.img = img
    obj.url = dataUrl

    // 多余10M的图片不允许传
    if (file.size > 10 * 1024 * 1024) {
      obj.error = '文件太大，无法上传'

      return
    }

    setTimeout(async () => {
      obj.syncing = true

      const res = await $endApi.v1.common.upload(file)

      obj.syncing = false

      if (res.code === 200) {
        let endsUrl = globalOptions.getEndsUrl()

        // 去除endsUrl的最后一个/
        if (endsUrl.endsWith('/'))
          endsUrl = endsUrl.slice(0, -1)

        const url = new URL(`${endsUrl}${res.data.filename}`)

        obj.url = meta.value = url.href
        obj.sync = true
      }
      else {
        obj.error = res.message
      }
    })
  }

  reader.readAsDataURL(file)
}

function handlePaste(e: ClipboardEvent) {
  if (!e.clipboardData)
    return

  const { files } = e.clipboardData

  if (!files.length)
    return

  e.preventDefault()

  for (let i = 0; i < files.length; i++) {
    const item = files[i]

    /* if (item.type.startsWith('text')) {
      item.getAsString((data) => {
        input.value.text += data
      })
    }
    else */ if (item.type.startsWith('image')) {
      const file = item
      if (!file)
        continue

      handleImageUpload(file)
    }
    else {
      console.warn('unhandled clipboard data type:', item.type)

      ElMessage({
        message: '暂时不支持文件分析',
        type: 'warning',
        plain: true,
        grouping: true,
        duration: 2000,
        showClose: true,
      })
    }
    // else if (item.type.startsWith('image')) {
    //   const blob= item.getAsFile()
    // }
  }

  // e.preventDefault()
}

function handleDeleteFile(index: number) {
  input.value.files.splice(index, 1)
}

const { open, reset, onChange } = useFileDialog({
  accept: 'image/*',
  directory: false,
})

onChange((files) => {
  if (!files)
    return

  for (const file of files)
    handleImageUpload(file)
})

function handleImagePlus() {
  // 调用浏览器文件选择框
  reset()
  open()
}

watch(() => focus.value, (val) => {
  if (val) {
    if (props.tip)
      tipsVisible.value = true
  }

  else {
    setTimeout(() => {
      tipsVisible.value = false
    }, 100)
  }
})

watch(() => props.tip, (val) => {
  if (val) {
    focusInput()
    input.value.text = val.value
  }
})

// 关键词高亮
function highlightKeyword(text: string, keyword: string) {
  const regex = new RegExp(keyword, 'gi')

  return text.replace(regex, (match) => {
    return `<span class="keyword">${match}</span>`
  })
}

const tipList = computed(() => props.tip?.list.filter(item => item.content.includes(input.value.text)))

async function handleTipClick(event: MouseEvent, tip: ITipItem) {
  focusInput()

  input.value.text = tip.content
  cur.value = -1

  await sleep(200)

  handleSend(event)
}

const th_input = ref()
const tip_floating = ref()

const { floatingStyles } = useFloating(th_input, tip_floating)
onStartTyping(focusInput)
</script>

<template>
  <!-- error: status === Status.ERROR, -->
  <!-- @keydown.enter="handleSend" -->
  <div
    ref="th_input" :class="{
      center,
      hide,
      disabled: !canSend,
      collapse: nonPlusMode,
      showSend,
      generating: status === 1,

    }" class="ThInput" @paste="handlePaste"
  >
    <div :class="{ show: tokenLimit - len <= tokenLimit * 0.25 }" class="ThInput-Float">
      <div class="ThInput-Float-End">
        即将达到内容框极限 <span class="tag">{{ len }}/
          {{ tokenLimit }}
        </span>
      </div>
    </div>

    <InputAddonThInputAt
      v-if="templateEnable" :target="th_input" :input="input.text"
      :show="!template?.title && input.text.startsWith('@')" @select="handleTemplateSelect"
    />

    <InputAddonThInputModel
      :target="th_input" :input="input.text"
      :show="input.text.startsWith('/')" @select="handleModelSelect"
    />

    <ThInputPlus
      v-model="inputProperty" :hide="input.text.startsWith('@') || template?.title"
      @image="handleImagePlus"
    />

    <div flex class="ThInput-Input">
      <div v-if="template?.id || input.files?.length" class="ThInput-InputHeader">
        <el-scrollbar>
          <InputHeaderFiles :files="input.files" @delete="handleDeleteFile" />
          <div v-if="template" class="ThInput-InputHeader-Main">
            {{ template.description }}
          </div>
        </el-scrollbar>
      </div>

      <div flex items-center class="ThInput-InputMain">
        <template v-if="template?.title">
          <span flex class="template-tag">@{{ template.title }}</span>
        </template>
        <div class="ThInput-InputMain-Inner">
          <textarea
            id="main-input" v-model="input.text" autofocus autocomplete="off" @focus="focus = true"
            @blur="focus = false" @keydown="handleInputKeydown"
          />
          <div v-if="!input.text && !input.files?.length" class="ThInput-InputMain-Placeholder transition-cubic">
            <p>{{ placeholder }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="ThInput-Send" @click="handleSend">
      <!-- <div i-carbon:arrow-up /> -->
      <IconAnimateIcon>
        <IconSvgArrowUpSvg />
      </IconAnimateIcon>
      <span v-if="status === 1" mr-4 text-lg text-black font-bold op-75>等待响应中</span>
    </div>

    <div class="ThInput-StatusBar" />

    <ClientOnly>
      <teleport to=".PageContainer-Main">
        <div
          v-if="center" ref="tip_floating" :style="floatingStyles" :class="{ display: tip && debouncedFocus }"
          class="ThInput-Tips"
        >
          <div v-if="tip" class="TipFloating fake-background">
            <div
              v-for="(item, ind) in tipList" :key="ind" v-wave :style="`--d: ${ind * 0.05}s`" class="ThInput-TipItem"
              @click="handleTipClick($event, item)" v-html="highlightKeyword(item.content, input.text)"
            />
          </div>
        </div>
      </teleport>
    </ClientOnly>
  </div>
</template>

<style lang="scss">
.ThInput-TipItem {
  &:hover {
    border-radius: 12px;
    --fake-opacity: 0.95;

    background-color: var(--el-mask-color-extra-light);
  }

  .keyword {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  color: var(--el-text-color-primary);
  margin: 0.5rem 0;
  padding: 0.5rem 0.5rem;

  height: 48px;
  line-height: 32px;

  cursor: pointer;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid var(--el-text-color-secondary);
  // background-color: var(--el-bg-color);

  opacity: 0;

  transform: translateY(10px);

  animation: enter 0.25s var(--d) forwards;
}

@keyframes enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.TipFloating {
  position: absolute;
  padding: 1rem calc(0.5rem + 36px);

  width: calc(min(50%, 780px) - 4px);

  left: 50%;

  overflow: hidden;
  border-radius: 16px;

  backdrop-filter: blur(18px) saturate(180%);
  transform: translate(calc(-50% + 2px), 0.5rem);
}

.ThInput-Tips {
  & :last-child {
    border-bottom: none;
  }

  &.display {
    opacity: 1;
    pointer-events: unset;
  }

  z-index: 10000;
  position: absolute;
  // padding: 1rem calc(36px + 0.5rem);

  width: 100%;
  height: max-content;

  opacity: 0;
  pointer-events: none;

  // background-color: var(--el-bg-color);
  // backdrop-filter: blur(18px) saturate(180%);
}
</style>

<style lang="scss" scoped>
.template-tag {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;

  width: max-content;

  opacity: 0.75;
  flex-shrink: 0;
  font-size: 14px;
  border-radius: 8px;
  align-self: flex-end;
  background-color: var(--theme-color);
}

.ThInput-Float {
  span.tag {
    // z-index: -1;
    // position: relative;
    // padding: 0.25rem 0.5rem;

    // top: 0;
    // left: 0;

    // font-size: 14px;

    // border-radius: 8px;
    // box-shadow: var(--el-box-shadow);
    // background: var(--el-bg-color);
    margin: 0 4px;

    opacity: 0.75;
    font-weight: 600;
    color: var(--el-color-danger);
  }

  &::before {
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0.25;
    filter: blur(10px) brightness(120%);
    background: var(--el-bg-color-page);
  }

  & > div {
    display: flex;

    gap: 0.25rem;

    transform: scale(0.85);
  }

  z-index: -1;
  position: absolute;
  // padding: 0 1rem;
  display: flex;

  // gap: 0.5rem;
  align-items: center;
  justify-content: space-between;

  top: -2.5rem;
  left: 50%;

  height: 40px;

  border-radius: 14px;
  transition: 0.25s;

  opacity: 0;
  filter: blur(10px) drop-shadow(0 0 10px var(--el-bg-color-page));
  pointer-events: none;
  transform: translateX(-50%);
  text-shadow: 0 0 10px var(--el-bg-color);

  // box-shadow: var(--el-box-shadow);
  // backdrop-filter: blur(18px);
  // background: var(--el-bg-color-page);
  &.show {
    opacity: 1;
    filter: blur(0) drop-shadow(0 0 5px var(--el-bg-color-page));
  }
}

.ThInput-InputMain-Inner {
  position: relative;
  display: flex;

  width: 100%;
}

.ThInput {
  &.collapse,
  &.generating {
    .ThInput-Plus {
      display: none;
    }

    .ThInput-Float {
      opacity: 0;
    }
  }

  .screen &.center {
    position: relative;
    width: min(50%, 780px);

    bottom: 0;
    opacity: 0;
    filter: blur(10px);

    box-shadow: var(--el-box-shadow-light);

    animation: inputJoin 0.25s ease-in-out forwards;

    transition: none;
  }

  &.hide {
    .ThInput-Float,
    .ThInput-Input,
    .ThInput-Send,
    .ThInput-Plus {
      opacity: 0;
    }

    .ThInput-Float {
      transform: translateY(100%) scale(0);
    }

    width: 0 !important;

    opacity: 0;
    pointer-events: none;

    transition:
      opacity 0.125s 0.375s,
      width 0.5s;
  }

  &.error {
    padding: 0;
  }

  > span {
    position: absolute;

    top: 50%;
    left: 50%;

    width: max-content;

    transform: translate(-50%, -50%);
  }

  z-index: 3;
  position: absolute;
  padding: 0.5rem 0.75rem;
  display: flex;

  // gap: 0.5rem;
  align-items: flex-end;

  // left: 50%;
  bottom: 3rem;

  width: min(70%, 1080px);
  min-height: 50px;

  &.generating {
    width: 20%;
    height: 50px;

    transition: 0.5s cubic-bezier(0.785, 0.135, 0.15, 0.86);
  }

  box-sizing: border-box;
  border-radius: 16px;
  box-shadow: var(--el-box-shadow);
  // background-color: var(--el-bg-color);
  backdrop-filter: blur(18px) saturate(180%);
  background-color: var(--el-mask-color-extra-light);

  pointer-events: auto;
  transition: 0.75s cubic-bezier(0.785, 0.135, 0.15, 0.86);

  // transition:
  //   opacity 0.25s,
  //   width 0.75s;
  animation: cubic-bezier(0.075, 0.82, 0.165, 1) 1s inputBottomJoin;
}

@keyframes inputBottomJoin {
  from {
    transform: translateY(-50vh) translateY(50%);
  }

  to {
    transform: translateY(0) translateY(0);
  }
}

@keyframes inputJoin {
  to {
    opacity: 1;
    filter: blur(0);
  }
}

.ThInput-Input {
  .error &,
  .generating & {
    opacity: 0;

    pointer-events: none;
  }

  textarea {
    &:focus-visible {
      outline: none;
      border: none;
    }

    &::placeholder {
      color: var(--el-text-color-regular);
    }

    position: relative;

    top: 0;

    width: calc(100% - 20px - 1.5rem);
    max-height: 330px;
    height: 32px;
    line-height: 32px;
    min-height: 32px;
    overflow: visible;

    // caret-color: var(--theme-color);

    resize: none;
    box-sizing: border-box;
    // transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
    background-color: transparent;
  }

  .ThInput-InputHeader {
    :deep(.el-scrollbar__bar.is-vertical) {
      width: 3px;
    }

    .ThInput-InputHeader-Main {
      &::before {
        z-index: -1;
        content: '';
        position: absolute;

        top: 0;
        left: 0;

        width: 100%;
        height: 100%;

        opacity: 0.35;
        border-radius: 12px 12px 8px 8px;
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color);
      }

      position: relative;
      padding: 0.25rem;

      max-height: 100px;
    }

    position: relative;
    padding: 0.25rem 0;

    width: 100%;

    // overflow: hidden;
    // border-radius: 12px 12px 0 0;
  }

  .ThInput-InputMain {
    &-Placeholder {
      &.template {
        left: 0;
      }
      z-index: 3;
      position: absolute;
      display: flex;

      top: 50%;
      left: 0%;

      width: max-content;
      height: 100%;

      align-items: center;

      pointer-events: none;
      transform: translate(0%, -50%);
    }
    position: relative;

    width: 100%;
  }

  &:focus-within {
    .ThInput-InputMain-Placeholder {
      opacity: 0;
      filter: blur(5px);
    }
  }

  position: relative;
  z-index: 10;
  flex: 1;
  flex-direction: column;

  align-items: flex-start;

  overflow: hidden;
}

.ThInput-Send {
  .error & {
    div {
      opacity: 0;
    }

    transform: scale(1);

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
    border-radius: 16px;
    background: var(--el-color-danger);
    // box-shadow: none;
    box-shadow: 0 0 8px 2px var(--el-color-danger);
  }

  &::before {
    z-index: -1;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0;
    border-radius: 16px;
    animation: animate 1.5s linear infinite;
    transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
    background: linear-gradient(135deg, #14ffe9, #ffeb3b, #ff00e0);
  }

  &::after {
    z-index: -2;
    content: '';
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    opacity: 0;
    border-radius: 16px;
    transform: scale(1.025);
    animation: animate 1.5s linear infinite;
    transition: 0.25s cubic-bezier(0.785, 0.135, 0.15, 0.86);
    background: linear-gradient(135deg, #14ffe9, #ffeb3b, #ff00e0);
  }

  .disabled & {
    &:hover {
      opacity: 0.75;
      cursor: not-allowed;
      background-color: var(--el-text-color-disabled);
      box-shadow: 0 0 0 0 var(--el-color-primary-light-7);
    }

    background-color: var(--el-text-color-disabled);
    box-shadow: 0 0 0 0 var(--el-color-primary-light-7);
  }

  .showSend &,
  .center & {
    transform: scale(1);
  }

  .generating & {
    &::before {
      opacity: 0.75;
    }

    &::after {
      opacity: 0.5;
    }

    div,
    :deep(.PopoverComp) {
      opacity: 0;
    }

    transform: scale(1);

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
    border-radius: 16px;
    background: transparent;
  }

  &:hover {
    background-color: var(--el-color-primary);
    box-shadow: 0 0 2px 4px var(--el-color-primary-light-5);
  }

  &:active {
    transform: scale(0.95);
  }

  z-index: 12;
  position: absolute;
  display: flex;

  color: #fff;
  font-weight: 600;
  font-size: 1.25rem;
  align-items: center;
  justify-content: center;

  bottom: 8px;
  right: 0.75rem;

  width: 32px;
  height: 32px;

  font-size: 16px;

  cursor: pointer;
  transition:
    background-color 0.25s,
    box-shadow 0.5s,
    transform 0.5s,
    border-radius 0.25s,
    left 0.25s,
    width 0.25s;
  transform: scale(0);
  border-radius: 16px;
  background-color: var(--el-color-primary-light-3);
  box-shadow: 0 0 2px 4px var(--el-color-primary-light-7);
}

@keyframes animate {
  0% {
    filter: blur(10px) hue-rotate(0deg);
  }

  50% {
    filter: blur(20px) hue-rotate(180deg);
  }

  100% {
    filter: blur(10px) hue-rotate(360deg);
  }
}

.mobile .ThInput {
  bottom: 3.5rem;

  width: 90%;
}

@media (max-width: 1080px) {
  .ThInput {
    width: 90%;
  }
}
</style>
