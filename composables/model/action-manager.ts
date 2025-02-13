import type { Viewer } from './vrmViewer/viewer'

export const INNER_ACTIONS = [
  'idle_01',
  'idle_02',
  'idle_03',
  'idle_01',
  'idle_02',
  'idle_03',
  'sitting',
  'standing_greeting',
  'idel_happy_01',
]
export const INNER_EMOTIONS = [
  'happy',
  'neutral',
  'blinkLeft',
  'blinkRight',
  // 'blink',
  // 'neutral',
  'relaxed',
  'sad',
  'surprised',
]

export class ActionManager {
  private _viewer: Viewer
  private _timer: NodeJS.Timeout | null
  private _enabled: boolean = true

  constructor(viewer: Viewer) {
    this._timer = null
    this._viewer = viewer
  }

  public startToggle() {
    this._timer = setInterval(() => {
      this.randomActionWithEmotion()
    }, 15000)
  }

  public endToggle() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  }

  public enableToggle() {
    this._enabled = true
  }

  public disableToggle() {
    this._enabled = false
  }

  private randomActionWithEmotion() {
    if (!this._enabled)
      return

    if (!this._viewer?.isReady)
      return

    const action = INNER_ACTIONS[Math.floor(Math.random() * INNER_ACTIONS.length)]
    const emotion = INNER_EMOTIONS[Math.floor(Math.random() * INNER_EMOTIONS.length)]

    console.log('[ACTION] action', action, emotion)

    try {
      this._viewer.model?.loadFBX(action)
      this._viewer.model?.emote(emotion as any)
    }
    catch (_ignored) {

    }
  }
}
