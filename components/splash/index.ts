// 从远程下载模型并返回进度 传入要下载的地址
export function useDownloadModel(url: string, abort: AbortSignal) {
  const progress = ref(0)
  const isDownloading = ref(false)
  const error = ref<string | null>(null)

  const download = async () => {
    console.log('start to load', url)

    try {
      isDownloading.value = true
      error.value = null

      const response = await fetch(`${url}?v=1`, { signal: abort })

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`)

      const reader = response.body?.getReader()
      const contentLength = +(response.headers.get('Content-Length') ?? 0)

      if (!reader)
        throw new Error('无法获取响应数据')

      let receivedLength = 0
      const chunks: Uint8Array[] = []

      while (true) {
        const { done, value } = await reader.read()

        if (done)
          break

        chunks.push(value)
        receivedLength += value.length

        // 计算下载进度
        progress.value = Math.min((receivedLength / contentLength) * 100, 100)
      }

      // 合并数据块
      const chunksAll = new Uint8Array(receivedLength)
      let position = 0
      for (const chunk of chunks) {
        chunksAll.set(chunk, position)
        position += chunk.length
      }

      return chunksAll
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '下载失败'
      throw e
    }
    finally {
      isDownloading.value = false
    }
  }

  return {
    progress,
    isDownloading,
    error,
    download,
  }
}

// 下载一系列模型 请提供最大并发数量 返回一个总体的加载进度
export function useDownloadModels(urls: string[], maxConcurrency: number) {
  const progress = ref(0)
  const isDownloading = ref(false)
  const error = ref<string | null>(null)
  const abortController = new AbortController()
  const activeTask = ref<string[]>([])

  const download = async () => {
    if (urls.length === 0)
      return []

    if (isDownloading.value)
      throw new Error('Model downloading has already started')

    try {
      isDownloading.value = true
      error.value = null
      const results: Uint8Array[] = []

      // 创建下载任务队列
      const queue = urls.map((url, index) => ({
        url,
        index,
      }))

      // 创建进度追踪数组
      const progressArray: number[] = [...Array(urls.length)].fill(0)

      // 并发下载函数
      const downloadNext = async () => {
        while (queue.length > 0) {
          const { url, index } = queue.shift()!
          const downloader = useDownloadModel(url, abortController.signal)

          // 监听单个下载进度并更新总进度
          const unwatch = watch(downloader.progress, (newProgress) => {
            progressArray[index] = newProgress
            progress.value = progressArray.reduce((a: number, b: number) => a + b, 0) / urls.length

            if (progress.value >= 100)
              unwatch()
          })

          activeTask.value.push(url)

          try {
            const result = await downloader.download()
            results[index] = result
          }
          catch (e) {
            error.value = e instanceof Error ? e.message : '下载失败'
            abortController.abort()
            throw e
          }
          finally {
            activeTask.value = activeTask.value.filter(item => item !== url)
          }
        }
      }

      // 启动并发下载
      const downloadPromises = Array(Math.min(maxConcurrency, urls.length))
        .fill(null)
        .map(() => downloadNext())

      await Promise.all(downloadPromises)
      return results
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '下载失败'
      throw e
    }
    finally {
      isDownloading.value = false
    }
  }

  return {
    error,
    progress,
    activeTask,
    isDownloading,
    download,
    abort: () => abortController.abort(),
  }
}
