import type { VRMExpressionPresetName } from '@pixiv/three-vrm'
import { VRMExpression } from '@pixiv/three-vrm'
// import type { KoeiroParam } from '../constants/koeiroParam'

// ChatGPT API
export interface Message {
  role: 'assistant' | 'system' | 'user'
  content: string
  user_name: string
}

const talkStyles = [
  'talk',
  'happy',
  'sad',
  'angry',
  'fear',
  'surprised',
] as const
export type TalkStyle = (typeof talkStyles)[number]

export interface Talk {
  style: TalkStyle
  speakerX: number
  speakerY: number
  message: string
}

const emotions = ['neutral', 'happy', 'angry', 'sad', 'relaxed'] as const
export type EmotionType = (typeof emotions)[number] & VRMExpressionPresetName

/**
 * 発話文と音声の感情と、モデルの感情表現がセットになった物
 */
export interface Screenplay {
  expression: EmotionType
  talk: Talk
}

export function splitSentence(text: string): string[] {
  const splitMessages = text.split(/(?<=[。．！？\n])/g)
  return splitMessages.filter(msg => msg !== '')
}

export function textsToScreenplay(texts: string[], koeiroParam: any, emote: string): Screenplay[] {
  const screenplays: Screenplay[] = []
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]
    const message = text.replace(/\[(.*?)\]/g, '')
    const expression = emote
    screenplays.push({
      expression: expression as EmotionType,
      talk: {
        style: emotionToTalkStyle(expression as EmotionType),
        speakerX: koeiroParam.speakerX,
        speakerY: koeiroParam.speakerY,
        message,
      },
    })
  }

  return screenplays
}

function emotionToTalkStyle(emotion: EmotionType): TalkStyle {
  switch (emotion) {
    case 'angry':
      return 'angry'
    case 'happy':
      return 'happy'
    case 'sad':
      return 'sad'
    default:
      return 'talk'
  }
}
