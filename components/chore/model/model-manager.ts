import { SpeechNls } from '~/composables/nls'

export const {
  ensurePermissions,
  permissionGranted,
  audioInputs: microphones,
} = useDevicesList()

export const speechNls = new SpeechNls()

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
        audio: {
          echoCancellation: true,
          noiseCancellation: true,
          autoGainControl: true,
          deviceId: currentMicrophone,
        },
      }),
    })

    this.stream = result.stream
    this.media = result
  }

  startRecord() {
    this.media.start()

    whenever(() => this.stream.value, () => {
      speechNls.startRecording(this.stream.value!)
    }, { immediate: true, once: true })
  }

  stopRecord() {
    this.media.stop()

    speechNls.stopRecording()
  }
}

export const $model = new ModelManager()
