<script setup lang="ts">
import Success from "./Success.vue";
import { useLoginState } from "./";
import { $endApi } from "~/composables/api/base";

const loginState = useLoginState();
const nextComp: any = inject("nextComp");

const router = useRouter();
const options = reactive({
  type: "password",
  loading: false,
  certificate: loginState.data.certificate || "",
  step: 1,
});

/**
 * 验证函数
 * 满足三个条件 一个条件计数加1 最后返回计数
 * 1.最少8位
 * 2.至少1个数字
 * 3.至少1个字母
 */
const valid = computed(() => {
  let amo = 0;
  if (options.certificate.length >= 8) amo++;

  if (/[0-9]/.test(options.certificate)) amo++;

  if (/[a-zA-Z]/.test(options.certificate)) amo++;

  return amo;
});

async function handleSmsCertificate() {
  if (valid.value < 3) return;

  loginState.data.certificate = options.certificate;

  options.loading = true;

  userStore.value.token = { accessToken: loginState.data.stashedToken, refreshToken: "" };
  const res = await $endApi.v1.auth.setPassword(options.certificate);

  // save name
  const result = await $endApi.v1.initial.saveModelName(loginState.data.name);
  if (
    responseMessage(result, {
      success: "",
      triggerOnDataNull: false,
    })
  )
    userStore.value.name = loginState.data.name;

  options.loading = false;

  if (
    responseMessage(res, {
      success: "设置成功",
      triggerOnDataNull: false,
    })
  ) {
    await router.push("/");

    nextComp(Success, {
      title: "",
      canBack: false,
    });
  } else {
    userStore.value.token = { accessToken: "", refreshToken: "" };
  }
}

const progress = computed(() => {
  return valid.value * 33.34;
});

const color = computed(() => {
  if (valid.value === 1) return "#D62C01";
  if (valid.value === 2) return "#FAAE16";
  if (valid.value === 3) return "#498200";
  return "#9d9aa4";
});
</script>

<template>
  <div class="SmsCertificate">
    <div class="SmsCertificate-Header">
      <div
        v-for="step in 3"
        :key="step"
        :class="{ active: step <= options.step }"
        class="SmsCertificate-Header-Step"
      />
    </div>

    <div class="SmsCertificate-Main">
      <p text-start>密码</p>
      <div class="major-input" flex items-center>
        <input
          v-model="options.certificate"
          autofocus
          flex-1
          size="large"
          :type="options.type"
          placeholder="输入密码"
        />
        <div block>
          <div
            v-if="options.type === 'password'"
            class="h-[16px] w-[16px]"
            i-carbon:view-off-filled
            @click="options.type = ''"
          />
          <div
            v-else
            class="h-[16px] w-[16px]"
            i-carbon:view-filled
            @click="options.type = 'password'"
          />
        </div>
      </div>
      <div class="major-info">
        <div class="major-progress">
          <div
            class="major-progress-inner transition-cubic"
            :style="`width: ${progress}%;background-color: ${color}`"
          />
        </div>

        <div class="major-list">
          <ul>
            <li :class="{ satisfied: options.certificate.length >= 8 }">
              <span class="major-check" />最少8位
            </li>
            <li :class="{ satisfied: /[0-9]/.test(options.certificate) }">
              <span class="major-check" />一个数字
            </li>
            <li :class="{ satisfied: /[a-zA-Z]/.test(options.certificate) }">
              <span class="major-check" />一个符号
            </li>
          </ul>
        </div>
      </div>
      <el-button
        v-loading="options.loading"
        v-wave
        :class="{ valid: valid >= 3 }"
        class="major-button"
        size="large"
        @click="handleSmsCertificate"
      >
        继续
      </el-button>
    </div>
  </div>
</template>

<style lang="scss">
.SmsCertificate-Header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  padding: 0px;

  gap: 10px;

  width: 100%;
  height: 24px;

  .SmsCertificate-Header-Step {
    width: 20px;
    height: 4px;
    border-radius: 2px;

    background: #edecef;

    &.active {
      background: #cfb0f0;
    }
  }
}

.SmsCertificate {
  .major-list {
    li {
      .major-check {
        width: 16px;
        height: 16px;
        border-radius: 8px;

        /* 自动布局 */
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 0px;
        gap: 8px;

        box-sizing: border-box;
        border: 1px solid #9d9aa4;
      }

      &.satisfied span {
        background-color: #498200;
      }
      position: relative;
      display: flex;

      width: 100%;

      gap: 0.5rem;
      align-items: center;
      justify-content: flex-start;
    }
    margin: 0.5rem 0;

    display: flex;

    width: 100%;
    justify-content: flex-start;
  }

  .major-info {
    margin: 0.5rem 0;
  }

  .major-progress {
    &-inner {
      position: absolute;

      top: 0;
      left: 0;

      min-width: 2%;
      width: 0;
      height: 100%;
      max-width: 100%;

      border-radius: 18px;
      // background-color: #605d67;
    }
    position: relative;

    height: 8px;

    overflow: hidden;
    border-radius: 4px;
    background-color: #edecef;
  }

  &-Main {
    margin: 2rem 0;

    .major-input {
      margin: 5px 0 10px;

      width: 100%;
      height: 48px;
      opacity: 1;

      /* 自动布局 */
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 4px 12px;
      gap: 10px;
      flex-grow: 1;
      align-self: stretch;

      border-radius: 12px;

      z-index: 1;

      input {
        outline: none !important;
      }

      border: 1px solid #9ea1a8;

      &:active {
        border: 1px solid #9ea1a8;
      }
    }

    .major-button {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 0px 16px;
      gap: 10px;
      align-self: stretch;

      width: 100%;
      height: 60px;

      color: #fff;
      font-weight: 500;
      border-radius: 12px;
      background: #b88ae8;
      border: none !important;
      box-shadow: 0px 12px 12px -8px rgba(100, 0, 205, 0.16);

      &.valid {
        background-color: #6400cd;
      }
    }
  }

  color: #27252e;

  text-align: center;
}
</style>
