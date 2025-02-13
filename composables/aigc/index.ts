import { TextAggregator, getAIGCCompletionStream } from '../api/base/v1/aigc/completion'

import * as TTS from '../tts/core'
import { getTextToSpeechStream } from '../tts/network'
import { getMockResponse } from './mock'
import { $model, type ModelManager } from '~/components/chore/model/model-manager'

async function startAudioStream(sentence: string) {
  console.log('startAudioStream', sentence)

  const stream = await getTextToSpeechStream({
    text: sentence,
  })

  TTS.audioStreamPlayer.appendReadableAudio(stream)
}

export class AIGCConversationManager {
  private model: ModelManager
  private lastSignal?: AbortController

  constructor(
    model: ModelManager,
  ) {
    this.model = model
  }

  /** 模拟对话数据 会模拟ai */
  public async mockConversation(useVoice = false) {
    const aggregator = new TextAggregator((wholeSentence: string) => {
      if (useVoice)
        startAudioStream(wholeSentence)
    })

    getMockResponse((chunk) => {
      console.log('mockConversation', chunk)
      aggregator.appendText(chunk)
    })
  }

  public async startConversation(sentence: string, useVoice = false) {
    this.model.stopRecord()
    this.lastSignal?.abort?.()

    const aggregator = new TextAggregator((wholeSentence: string) => {
      if (useVoice)
        startAudioStream(wholeSentence)
    })

    this.lastSignal = await getAIGCCompletionStream(
      sentence,
      (message: any) => {
        const { event, data } = message
        if (event !== 'conversation.message.delta')
          return

        const { content, type } = data
        if (type !== 'answer')
          return

        aggregator.appendText(content)
      },
      (error: any) => {
        console.warn('Conversation error:', error)
      },
      () => {
        if (useVoice)
          this.model.startRecord()
      },
    )
  }

  public stopConversation() {
    this.lastSignal?.abort?.()

    this.model.startRecord()
  }
}

export const $aigc = new AIGCConversationManager($model)
