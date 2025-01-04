import { endHttp } from '../../axios'
import type { IDataResponse } from '../index.type'
import type { ILoginToken } from './auth.type'

export default {
  sendSMSCode(phone: string) {
    return endHttp.get('user/code', { phone })
  },
  loginOrRegister(phone: string, code: string) {
    return endHttp.get('user/login', {
      phone,
      code,
    })
  },
  renewToken() {
    return endHttp.get('auth/renew_token') as Promise<IDataResponse<ILoginToken>>
  },
}
