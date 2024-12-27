<script setup lang="ts">
import LoginFlower from '~/components/chore/login/LoginFlower.vue'
import QuickRegister from '~/components/chore/login/QuickRegister.vue'
import CreateAccount from '~/components/chore/login/CreateAccount.vue'

const options = reactive<{
  title: string
  comp: Component
}>({
  title: '创建账户',
  comp: CreateAccount,
})
</script>

<template>
  <div class="LoginPage">
    <div class="LoginPage-Content">
      <div relative w-full flex items-center justify-center class="LoginPage-Content-Header">
        <div absolute left-0 class="arrow-icon">
          <div i-carbon-arrow-left />
        </div>
        <p>
          {{ options.title }}
        </p>
      </div>

      <div class="LoginPage-Content-Main">
        <component :is="options.comp" />
      </div>
    </div>

    <div class="LoginPage-Footer">
      使用相一服务，代表你同意<br>条款和隐私政策
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
