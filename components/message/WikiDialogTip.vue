<script setup>
import Loading from './../icon/LoadingIcon.vue'

const props = defineProps({
  title: String,
  message: String,
  stay: Number,
  close: Function,
  btns: Array,
})

const btnArray = ref([])

const wholeDom = ref(null)

const forClose = ref(async () => {
  const style = wholeDom.value?.style

  // style.animation = 'enter .2s ease-in-out reverse'

  style.transform = 'translate(-50%, -50%) scale(1.15)'

  await sleep(150)

  style.transform = 'translate(-50%, -50%) scale(.35)'
  style.opacity = '0'

  await sleep(300)

  props.close()

  window.removeEventListener('scroll', listener)
})

watchEffect(() => {
  const array = [];

  ([...props.btns]).forEach((btn) => {
    const obj = ref({
      loading: false,
      ...btn,
    })

    if (btn.loading) {
      obj.value.loading = true

      btn.loading(() => {
        obj.value.loading = false
      })
    }

    array.push(obj)
  })

  btnArray.value = array
})

const clickBtn = ref(async (btn) => {
  btn.value.loading = true

  await sleep(400)

  if (await btn.value.onClick())

    forClose.value()

  btn.value.loading = false
})

// couldn't move
let listener = (e) => {
  window.scrollTo({
    top: 0,
  })
}

onMounted(() => {
  window.addEventListener('scroll', listener)
})
</script>

<script>
export default {
  name: 'DialogTip',
}
</script>

<template>
  <div class="DialogTip-Wrapper">
    <div
      ref="wholeDom" class="DialogTip-Container" :class="{
        'info-tip': type === TipType.INFO,
        'warn-tip': type === TipType.WARNING,
        'error-tip': type === TipType.ERROR,
        'success-tip': type === TipType.SUCCESS,
        'loading-tip': loading,
      }"
    >
      <div class="DialogTip-Main-Wrapper" />

      <h1>{{ title }}</h1>
      <span class="DialogTip-Content" v-html="message.replace('\n', '<br /><br />')" />
      <div class="DialogTip-Loading-Wrapper">
        <Loading v-if="loading" />
      </div>
      <div class="DialogTip-Btn">
        <span
          v-for="(btn, index) in btnArray" :key="index" :class="{
            'info-tip': btn.value?.type === TipType.INFO,
            'warn-tip': btn.value?.type === TipType.WARNING,
            'error-tip': btn.value?.type === TipType.ERROR,
            'success-tip': btn.value?.type === TipType.SUCCESS,
            'loading-tip': btn.value.loading,
          }" class="DialogTip-Btn-Item" @click="clickBtn(btn)"
        >
          <span class="DialogTip-Btn-Item-Loading">
            <Loading />
          </span>
          <span class="DialogTip-Container-Btn-Item-Text">{{ btn.value.content }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.DialogTip-Wrapper {
  z-index: 1000;
  position: absolute;

  width: 100%;
  height: 100%;

  top: 0;
  left: 0;

  &:before {
    z-index: 0;
    content: '';
    position: absolute;

    left: 0;
    top: 0;

    width: 100%;
    height: 100%;

    background-color: var(--el-overlay-color);
    opacity: 0.45;
  }
}

.DialogTip-Main-Wrapper {
  position: absolute;

  width: 100%;
  height: 100%;

  top: 50%;
  left: 50%;

  border-radius: 2px;
  background-image: radial-gradient(var(--el-bg-color) 5%, #0000 90%);
  // opacity: 0.75;
  backdrop-filter: contrast(150%) saturate(100%) blur(10px);
  transform: translate(-50%, -50%);
  overflow: hidden;

  &:before {
    content: 'Tip';
    position: absolute;

    bottom: 10px;
    left: -5px;

    width: 72px;
    height: 72px;
    line-height: 72px;

    opacity: 0.45;

    color: #fff;
    text-align: center;
    font-size: 35px;

    border-radius: 18px;
    background-color: var(--el-color-primary);
    transform: rotate(45deg);
  }
}

.DialogTip-Content {
  position: absolute;

  top: 50%;
  left: 10%;

  height: auto;
  width: 80%;
  max-height: 50%;

  text-align: center;
  transform: translate(0, -50%);
}

.DialogTip-Container {
  .DialogTip-Btn-Item-Loading {
    position: relative;
    display: inline-block;
    margin: -8px;

    top: -10px;
    left: 50%;

    width: 16px;
    height: 16px;

    transform: scale(0) translateX(-50%);
    opacity: 0;
    --bg-color: var(--theme-color);
    transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  h1 {
    position: absolute;
    margin: 0;

    left: 50%;
    top: 30px;

    width: max-content;
    height: 32px;
    line-height: 32px;

    color: var(--theme-color, var(--el-text-color-secondary));
    font-size: 18px;
    font-weight: bold;
    transform: translate(-50%, 0);
  }

  .DialogTip-Btn {
    &::before {
      content: '';
      position: absolute;

      left: 10%;
      width: 80%;
      height: 2px;

      top: -2px;

      opacity: 0.5;
      background-image: linear-gradient(
        transparent 10%,
        var(--el-border-color) 50%,
        transparent 90%
      );
    }

    position: absolute;
    display: flex;
    justify-content: space-around;
    padding: 8px 0;

    bottom: 0;
    left: 5%;

    width: 90%;
    //height: 28px;

    color: #284f90;

    // border-top: 1px solid #e1dfdf;
    font-weight: 400;
    text-align: center;
    cursor: pointer;
    user-select: none;

    .DialogTip-Btn-Item {
      padding: 0 24px;
    }
  }

  //&:after {
  //  z-index: 10;
  //  content: attr(message);
  //  position: absolute;
  //
  //  width: 70%;
  //  height: 120px;
  //
  //  top: 40%;
  //  left: 50%;
  //
  //  line-height: 24px;
  //  text-align: center;
  //
  //  transform: translate(-50%, 0) translateY(-10px);
  //
  //}

  position: absolute;

  left: 50%;
  top: 50%;

  min-width: 460px;
  min-height: 180px;
  line-height: 30px;

  color: var(--theme-color, var(--el-text-color-primary));
  // box-shadow: 0 0 16px 32px var(--el-box-shadow);

  transform: translate(-50%, -50%);
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: enter 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.loading-tip {
  .DialogTip-Btn-Item-Loading {
    opacity: 1;

    transform: scale(0.5) translateX(-50%);
  }

  .DialogTip-Container-Btn-Item-Text {
    opacity: 0.25;

    transform: scale(0.65);
  }

  pointer-events: none;
}

.DialogTip-Container-Btn-Item-Text {
  position: relative;

  left: 0;
  top: 0;

  width: 320px;
  height: 180px;

  text-align: center;

  color: var(--theme-color, var(--el-text-color-regular));
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@keyframes enter {
  0% {
    transform: translate(-50%, -50%) scale(0.35);
  }

  70% {
    transform: translate(-50%, -50%) scale(1.15);
  }

  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

.success-tip {
  --theme-color: #629168;
}

.info-tip {
  --theme-color: #284f90;
}

.warn-tip {
  --theme-color: #f0a732;
}

.error-tip {
  --theme-color: #d0493c;
}
</style>
