import AuthApi from './v1/auth'
import CommonApi from './v1/common'
import AigcApi from './v1/aigc'
import InitialApi from './v1/initial'

export const $endApi = {
  v1: {
    auth: AuthApi,
    common: CommonApi,
    aigc: AigcApi,
    initial: InitialApi,
  },
}
