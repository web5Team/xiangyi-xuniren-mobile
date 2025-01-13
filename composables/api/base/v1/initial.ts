import { endHttp } from '../../axios'
import type { IDataResponse } from '../index.type'
import type { IQuestion } from './initial.type'

export default {
  getQuestions() {
    return endHttp.post('index/question') as Promise<IDataResponse<IQuestion[]>>
  },
  answerQuestion(id: string, title: string, options: string[]) {
    return endHttp.post('user/question', {
      id,
      title,
      options,
    })
  },
  modelInfo() {
    return endHttp.get('user/info') as Promise<IDataResponse<any>>
  },
  saveModelStats() {
    return endHttp.post('user/stats') as Promise<IDataResponse<any>>
  },
}
