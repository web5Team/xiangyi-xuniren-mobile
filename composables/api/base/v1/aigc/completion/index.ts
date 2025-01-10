import { ENDS_URL, globalOptions } from '~/constants'

export async function getAIGCCompletionStream(
  question: string,
  onMessage: (message: string) => void,
  onError: (error: any) => void,
  onComplete: () => void,
) {
  const url = `${globalOptions.getEndsUrl()}/bot/chat`

  const controller = new AbortController()

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'server': 'true',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.value.token?.accessToken}`,
      },
      body: JSON.stringify({
        message: question,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const error = await response.json()
      onError(error)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      onError(new Error('No reader available'))
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        onComplete()
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const messages = buffer.split('\n\n')
      buffer = messages.pop() || ''

      messages.forEach((message) => {
        if (message.startsWith('data: ')) {
          const data = message.slice(6)
          if (data === '[DONE]') {
            onComplete()
          }
          else {
            try {
              const json = JSON.parse(data)
              if (json.choices && json.choices.length > 0) {
                const content = json.choices[0].delta?.content || ''
                onMessage(content)
              }
            }
            catch (parseError) {
              onError(parseError)
            }
          }
        }
      })
    }
  }
  catch (error) {
    onError(error)
  }

  return controller
}
