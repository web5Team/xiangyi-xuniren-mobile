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
  saveModelName(name: string) {
    return endHttp.post('user/save', { name }) as Promise<IDataResponse<any>>
  },
  saveModelStats({
    humor,
    profession,
    impromptu,
    memory,
    consciousness,
  }: {
    humor: number
    profession: number
    impromptu: number
    memory: number
    consciousness: number
  }) {
    return endHttp.post('user/stats', {
      humor,
      profession,
      impromptu,
      memory,
      consciousness,
    }) as Promise<IDataResponse<any>>
  },
}
