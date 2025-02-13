import type { SpeechNls } from '../nls'
import type AudioStreamPlayer from './impl'

/**
 * 本文件是作为语音模块适配器存在
 *
 * 主要支持打断，只要检测到发言就会强行停止语音模块
 */
export async function useTTSAdapter(nls: SpeechNls, tts: AudioStreamPlayer) {
  // let lastStatus = false

  function checker() {
    setTimeout(checker, 160)
    // const isSpeaking = nls.getIsSpeaking()

    if (nls.checkInterruption()) {
      if (!tts.getIsPlaying()) {
        // console.log(`%c用户正在发言，但是未处于合成状态，取消打断。`, 'color: #03C078;font-weight: bold')
      }
      else {
        tts.clear()

        console.log(`%c打断说话`, 'color: #F56C6C;font-weight: bold')
      }
    }

    // if (isSpeaking && !lastStatus) {
    //   const startTime = nls.getSpeakingStartTime()
    //   const diff = Date.now() - startTime

    //   console.log(isSpeaking, lastStatus, diff)

    //   if (diff > 2000) {
    //     tts.clear()

    //     console.log(`%c打断说话`, 'color: #F56C6C;font-weight: bold')
    //   }
    // }
  }

  checker()
}
