<script setup lang="ts">
// import { appName, globalOptions } from '~/constants'
// import 'element-plus/theme-chalk/dark/css-vars.css'

useHead({
  title: "xiangyi-xnr",
})

onMounted(() => {
  document.body.classList.add('mobile')
})
</script>

<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style style="scss">
html,
body,
#__nuxt {
  position: absolute;

  height: 100%;
  width: 100%;
  
  margin: 0;
  padding: 0;

  overflow: hidden;

  --theme-color: #6400cd;
  --theme-color-light: #f0e6fa;
}

body.touchable {
  -webkit-overflow-scrolling: touch;

  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

body.mobile {
  touch-action: none;
  touch-action: pan-y;
}

html.dark {
  background: #222;
  color: white;
}

::view-transition-new(root),
::view-transition-old(root) {
  animation: none;
}

.dark::view-transition-old(root) {
  z-index: 1001;
}

.LoadingWrapper {
  z-index: 1000;
  position: absolute;
  display: flex;

  justify-content: center;
  align-items: center;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  filter: inset(5%);
  background-color: var(--el-fill-color);
}

.adapt-style {
  .dark & {
    filter: invert(1);
  }
}

.el-skeleton {
  filter: invert(2%);
}

.transition-cubic {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

div.el-dialog {
  --el-dialog-border-radius: 16px;
}

@keyframes CenterFrameLoad {
  from {
    opacity: 0;
    transform: translateY(200px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes CenterXFrameLoad {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(200px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

span.premium {
  &:before {
    content: 'PRO';
    position: relative;
    padding: 2px 4px;
    margin-right: 2px;

    color: var(--el-color-warning);
    border: 1px solid var(--el-color-warning);
    border-radius: 8px;
  }

  text-indent: 100%;
}

span.premium-normal {
  position: relative;
  display: flex;
  padding: 2px 4px;

  line-height: 20px;
  height: 20px;

  align-items: center;
  justify-content: center;

  color: var(--el-color-warning);
  font-size: 12px;
  border: 1px solid var(--el-color-warning);
  /* background: var(--el-color-warning); */
  transform: scale(var(--scale, 1));
  border-radius: 8px;
}

span.premium-end {
  &:after {
    content: 'PRO';
    position: relative;
    padding: 2px 4px;
    margin-left: 2px;

    color: #fff;
    font-size: 14px;
    background: var(--el-color-warning);
    border-radius: 8px;
  }
}

@media (min-width: 768px) {
  *.only-pe-display {
    display: none !important;
  }
}

@media (max-width: 768px) {
  *.only-pc-display {
    display: none !important;
  }
}

.el-message {
  z-index: 10000 !important;

  border-radius: 16px;
}

.el-menu {
  padding-left: 5% !important;
  padding-right: 10% !important;

  .el-menu-item {
    margin: 5px 0;
    height: 42px;
    border-radius: 8px !important;

    &:hover {
      color: #000;
      background-color: #ffffff;
    }

    &:after {
      content: '';
      position: absolute;

      right: -20%;
      top: 0;

      height: 100%;
      width: 5%;

      background-color: #fff;
      border-radius: 3px 0 0 3px;
      transform: scaleY(0);
      transition: all 0.25s;
    }

    i::before {
      position: relative;
      top: -3px;
    }

    transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .el-menu-item.is-active {
    span {
      color: #000;
      font-weight: 600;
    }

    &:after {
      right: -13%;
      transform: scaleY(1);
    }

    background-color: #ffffff;
    border-radius: 8px !important;
  }
}

.el-sub-menu {
  --el-menu-active-color: #fff !important;

  .el-sub-menu__title {
    i::before {
      position: relative;
      top: -3px !important;
    }
  }

  li {
    margin: 4px 0;
    height: 40px;

    i::before {
      position: relative;
      top: 0 !important;
    }

    &:after {
      right: -30% !important;
    }
  }

  li.is-active {
    &:after {
      right: -26% !important;
      width: 8% !important;
    }
  }
}

.upload-item {
  border-radius: 8px !important;
  background-color: var(--el-border-color-light) !important;
}

.el-input {
  .el-input__count-inner {
    background-color: transparent !important;
  }
}

.el-input,
.el-textarea {
  --el-input-border-radius: 8px !important;
  /* --el-input-bg-color: var(--el-border-color-lighter) !important; */
}

.el-cascader {
  width: 100%;
}

.el-cascader-panel {
  .el-cascader-menu {
    min-width: 270px;
  }

  border-radius: 8px !important;
  background-color: var(--el-border-color-light) !important;

  & + .el-popper__arrow {
    &:before {
      background-color: var(--el-border-color-light) !important;
    }
  }
}

.el-button.stretch-center {
  span {
    align-self: stretch;
  }
}

.el-button.rounder-btn {
  &.primary {
    &:hover {
      color: var(--el-color-primary);
    }

    /* //background-color: var(--el-fill-color-light); */
  }

  position: relative;

  min-width: 28px;
  height: 28px;

  border-radius: 4px;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    border: none !important;
  }

  &.icon-width {
    min-width: 24px;
  }
}

span.air-dot {
  &.loading {
    &:after {
      content: '';
      position: absolute;

      left: -18px;
      top: 50%;

      width: 8px;
      height: 8px;

      border-radius: 50%;
      background-color: var(--dot-color, var(--el-color-error));
      transform: translate(0, -50%);
      animation: waving 1.25s infinite;
    }
  }

  &:before {
    content: '';
    position: absolute;

    left: -18px;
    top: 50%;

    width: 8px;
    height: 8px;

    border-radius: 50%;
    transform: translateY(-50%);
    background-color: var(--dot-color, var(--el-color-error));
  }

  &.air-dot-right {
    &:before {
      left: calc(100% + 6px);
    }

    left: 16px !important;
  }

  position: relative;
  left: 16px;
  margin-right: 16px;

  width: 100%;
}

.el-tabs.flat-linear {
  .el-tabs__item {
    &:after {
      content: '';
      position: absolute;

      top: -1px;
      left: 0;

      width: 100%;
      height: 2px;

      background-color: var(--el-color-primary);
      transform: translateY(-5px) scale(0);
      transition: 0.25s;
    }

    &:hover {
      &:after {
        opacity: 0.5;

        transform: translateY(0) scale(1);
      }
    }

    &.is-active {
      &:after {
        opacity: 1 !important;
        transform: translateY(0) scale(1) !important;
      }
    }
  }
}

.el-tabs.flat {
  .el-tabs__header {
    margin: 0 0 0;
  }

  .el-tabs__item {
    padding: 5px 10px !important;

    line-height: var(--el-tabs-header-height);
    width: max-content;

    text-align: center;
  }

  .el-tabs__item.is-active {
    color: var(--el-color-primary) !important;
  }

  .el-tabs__nav {
    .el-tabs__active-bar {
      &:before {
        content: '';
        position: absolute;

        top: 20%;

        left: -10px;
        height: 80%;

        width: calc(100% + 20px);
        border-radius: 4px;
        background: var(--el-color-primary-light-8) !important;
      }

      z-index: -1;

      height: 100%;

      background: none;
    }
  }

  .el-tabs__nav-wrap {
    &:after {
      display: none;
    }
  }
}

span.tip {
  position: relative;

  font-size: 14px;
  opacity: 0.75;
}

font.immersive-translate-target-wrapper {
  display: none !important;
  visibility: hidden !important;
}

.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .error-row {
  --el-table-tr-bg-color: var(--el-color-error-light-9);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

.fake-background::after {
  z-index: -1;
  content: '';
  position: absolute;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  opacity: var(--fake-opacity, 0.25);
  border-radius: inherit;
  background-color: var(--fake-color, var(--el-bg-color-page));
}

.template-normal {
  .image {
    margin: auto 0;
    margin-right: 0.5rem;
    display: flex;

    width: 1.2em;
    height: 100%;

    grid-area: image;

    align-items: center;
    justify-content: center;
  }

  .title {
    grid-area: title;
    font-size: 14px;
    font-weight: 600;
  }

  .subtitle {
    grid-area: subtitle;
    font-size: 12px;

    color: var(--el-text-color-secondary);
  }

  display: grid;

  gap: 0.125rem;
  grid-template-columns: auto 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas: 'image title' 'image subtitle';

  align-items: center;
}

.display-price {
  span.tag {
    position: relative;

    font-size: 0.8em;
    top: -0.15em;
  }

  font-size: 1em;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
</style>
