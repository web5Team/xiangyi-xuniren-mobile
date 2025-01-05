export const {
  ensurePermissions,
  permissionGranted,
  audioInputs: microphones,
} = useDevicesList()

export const {
  isSupported,
  isListening,
  isFinal,
  result,
  start,
  stop,
} = useSpeechRecognition({
  interimResults: false,
  lang: 'zh-Hans',
  continuous: true,
})

// export const audioContext = new AudioContext()
// export const analyser = audioContext.createAnalyser()

// analyser.fftSize = 256
// const bufferLength = analyser.frequencyBinCount
// const dataArray = new Uint8Array(bufferLength)

// 判断流 如果音频流没有在说话了 就返回

export class ModelManager {
  stream: Ref<MediaStream | undefined>
  media: ReturnType<typeof useUserMedia>

  saidEvent = useEventBus('ON_PHRASE_END')
  // microphone: MediaStreamAudioSourceNode

  constructor() {
    const currentMicrophone = computed(() => microphones.value[0]?.deviceId)

    const result = useUserMedia({
      constraints: reactive({
        video: false,
        audio: { deviceId: currentMicrophone },
      }),
    })

    this.stream = result.stream
    this.media = result

    // watch(result.stream, () => {
    //   if (this.stream.value) {
    //     this.microphone = audioContext.createMediaStreamSource(this.stream.value)
    //     this.microphone.connect(analyser)
    //   }
    // })
  }

  startRecord() {
    this.media.start()
    start()

    // this.media.enabled.value = true
    // this.update()
  }

  stopRecord() {
    this.media.stop()
    stop()

    // this.media.enabled.value = false
  }

  // update() {
  //   // analyser.getByteFrequencyData(dataArray)

  //   // let total = 0
  //   // for (let i = 0; i < bufferLength; i++)
  //   //   total += dataArray[i]

  //   // const average = total / bufferLength

  //   // // 判断是否静音
  //   // if (average < 10) { // 10 是一个阈值，可以根据实际情况调整
  //   //   console.log('用户没有说话')
  //   // }
  //   // else {
  //   //   console.log('用户正在说话')
  //   // }

  //   if (this.media.enabled)
  //     requestAnimationFrame(this.update)
  // }
}

export const $model = new ModelManager()

function _callbackPhrase() {
  const phrase = result.value

  stop()

  setTimeout(() => {
    if (!isListening.value)
      start()

    $model.saidEvent.emit(phrase)
  }, 300)
}

const callbackPhrase = useDebounceFn(_callbackPhrase, 500)

watch(result, (phrase: string) => {
  if (phrase) {
    // 一次性最多50个字 直接发送
    if (phrase.length >= 50)
      _callbackPhrase()
    else
      callbackPhrase()
  }
})

// whenever(() => isFinal.value === true, callbackPhrase)
