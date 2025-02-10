import { endHttp } from '../../axios'
import type { IDataResponse } from '../index.type'
import type { ILoginToken } from './auth.type'

export default {
  sendSMSCode(phone: string) {
    return endHttp.post('user/code', { phone })
  },
  loginOrRegister(phone: string, code: string) {
    return endHttp.post('user/login', {
      phone,
      code,
    })
  },
  loginByTourist() {
    return endHttp.post('user/loginByTourist')
  },
  setPassword(password: string) {
    return endHttp.post('user/setPassword', {
      password,
    })
  },

  renewToken() {
    return endHttp.get('auth/renew_token') as Promise<IDataResponse<ILoginToken>>
  },
}
