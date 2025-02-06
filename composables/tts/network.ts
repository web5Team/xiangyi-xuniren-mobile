/** 注意这只是一个测试接口，可以换为任何能直接返回音频数据的接口 */
const TTS_CONFIG = {
  endpoint: 'https://leave-tts.talexdreamsoul.workers.dev/v1/audio/speech',
  defaultVoice: 'zh-CN-XiaoxiaoNeural',
  model: 'tts-1',
} as const

/** TTS 请求参数类型 */
interface TTSRequestParams {
  text: string
  voice?: string
  model?: string
}

/** TTS 错误类型 */
class TTSError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TTSError'
  }
}

/**
 * 获取单个文本的语音数据流
 * @param params TTS请求参数
 * @returns 音频数据流
 */
export async function getTextToSpeechStream(params: TTSRequestParams): Promise<ReadableStream> {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer DEo1g79CuJVrunSmUhUmPhMHnRr5iZWd',
  })

  const requestBody = JSON.stringify({
    model: params.model ?? TTS_CONFIG.model,
    input: params.text,
    voice: params.voice ?? TTS_CONFIG.defaultVoice,
  })

  const requestOptions: RequestInit = {
    method: 'POST',
    headers,
    body: requestBody,
    redirect: 'follow' as RequestRedirect,
  }

  try {
    const response = await fetch(TTS_CONFIG.endpoint, requestOptions)

    if (!response.ok)
      throw new TTSError(`TTS请求失败: ${response.statusText}`)

    if (!response.body)
      throw new TTSError('未收到音频流数据')

    return response.body
  }
  catch (error) {
    throw new TTSError(`TTS处理异常: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 批量处理文本转语音
 * @param texts 文本数组
 * @param callback 每个音频流的回调函数
 * @param voice 可选的声音配置
 */
export async function batchTextToSpeech(
  texts: string[],
  callback: (stream: ReadableStream, index: number) => Promise<void>,
  voice?: string,
): Promise<void> {
  for (let i = 0; i < texts.length; i++) {
    try {
      const stream = await getTextToSpeechStream({
        text: texts[i],
        voice,
      })
      await callback(stream, i)
    }
    catch (error) {
      console.error(`处理第 ${i + 1} 条文本时出错:`, error)
    }
  }
}
