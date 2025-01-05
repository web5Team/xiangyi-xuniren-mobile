import AuthApi from './v1/auth'
import CommonApi from './v1/common'
import AigcApi from './v1/aigc'

export const $endApi = {
  v1: {
    auth: AuthApi,
    common: CommonApi,
    aigc: AigcApi,
  },
}
