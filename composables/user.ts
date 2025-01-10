import './index'
import { getAccountDetail, getPermissionList, getUserSubscription } from './api/account'
import { endHttp } from './api/axios'
import { $endApi } from './api/base'
import { $event } from './events'
import type { QuotaModel } from './api/base/v1/aigc/completion-types'

export interface AccountDetail {
  id: number

  token: {
    accessToken: string
    refreshToken: string
  }

  completeQuestion: boolean

  // isAdmin: boolean
  isLogin: boolean
}

export const userStore = useLocalStorage<Partial<AccountDetail>>('user', {})

watch(() => userStore.value.token?.accessToken, (token) => {
  userStore.value.isLogin = !!token
}, { immediate: true })

// watch(() => userStore.value.isLogin, () => {
//   if (!userStore.value.isLogin)
//     return false

//   const isAdmin = userStore.value.roles?.find((item: any) => item.id === 1) || !!userStore.value.permissions?.find((item: any) => item === 'system:manage')

//   Object.assign(userStore.value, {
//     isAdmin,
//   })
// }, { immediate: true })

// $event.on('USER_LOGOUT_SUCCESS', async (type) => {
//   if (!userStore.value.isLogin)
//     console.warn(`User not login now.`)

//   userStore.value = { ...userStore.value, token: { accessToken: '', refreshToken: '' }, id: undefined, phone: undefined }
//   userConfig.value = JSON.parse(JSON.stringify(rawUserConfig))

//   const router = useRouter()

//   await router.push('/')

//   if (type === LogoutType.TOKEN_EXPIRED) {
//     ElMessage({
//       message: '登录超时，请重新登录！',
//       grouping: true,
//       type: 'error',
//       plain: true,
//     })
//   }
// })

export async function $handleUserLogin(token: { accessToken: string, refreshToken: string }) {
  userStore.value.token = token

  // $event.emit('USER_LOGIN_SUCCESS')
}
