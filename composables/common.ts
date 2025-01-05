import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import type { IStandardResponse } from './api/base/index.type'
import { globalOptions } from '~/constants'

dayjs.extend(duration)

export function genFormatDate(date: Date) {
  // now date: YYYY/M/D HH:mm:ss
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`
}

export function genFormatNowDate() {
  return genFormatDate(new Date())
}

export async function sleep(time: number) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export async function useRequestAnimationFrame() {
  return new Promise(resolve => requestAnimationFrame(resolve))
}

export function getLastTextNode(node: HTMLElement): HTMLElement | null {
  if (node.nodeType === Node.TEXT_NODE)
    return node

  for (let i = node.childNodes.length - 1; i >= 0; i--) {
    const childNode = node.childNodes[i]
    const lastTextNode = getLastTextNode(childNode as HTMLElement)
    if (lastTextNode)
      return lastTextNode
  }

  return null
}

export function formatDate(date: any, format: string = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(date).format(format)
}

export function formatDuration(duration: number, format: string = 'HH:mm:ss') {
  return dayjs.duration(duration, 'milliseconds').format(format)
}

export function encodeText(str: string) {
  return btoa(encodeURIComponent(str))
}

export function decodeText(str: string) {
  return decodeURIComponent(atob(str))
}

export function encodeObject(obj: any) {
  return encodeText(JSON.stringify(obj))
}

export function decodeObject(str: string) {
  return JSON.parse(decodeText(str))
}

export function randomStr(len: number = 16) {
  return Array.from({ length: len }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join('')
}

export function responseMessage(res: IStandardResponse, options = {
  success: '操作成功',
  triggerOnDataNull: false,
}) {
  if (res.code === 200 && (!options.triggerOnDataNull || res.data)) {
    if (options.success) {
      ElMessage({
        message: options.success,
        grouping: true,
        type: 'success',
        plain: true,
      })
    }

    return true
  }
  else {
    ElMessage({
      message: `操作失败(${res.message})！`,
      grouping: true,
      type: 'error',
      plain: true,
    })

    return false
  }
}

// 1000 -> 1,000
export function formatNumber(num: string) {
  return `${num}`.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
}

function isCrossOriginUrl(url: string) {
  const origin = location.host

  return url.indexOf('data:') !== 0 && !url.includes(origin)
}
/**
 *
 * @param url url -> image
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()

    if (isCrossOriginUrl(url))
      img.crossOrigin = 'Anonymous'

    img.onload = () => {
      resolve(img)
    }

    img.onerror = function () {
      const msg = `Image load error: ${url}`

      reject(new Error(msg))
    }

    img.src = url
  })
}
/**
 * image元素 -> base64 Data
 * @param image image node
 */
export function imageToPng(image: HTMLImageElement) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = image.width
  canvas.height = image.height
  ctx.drawImage(image, 0, 0, image.width, image.height)
  return canvas.toDataURL('image/png')
}

/**
 *
 * @param xml svg 的xml内容
 */
export async function svgToPng(xml: string) {
  const base64 = window.btoa(unescape(encodeURIComponent(xml)))
  const image64 = `data:image/svg+xml;base64,${base64}`
  const image = await loadImage(image64)
  return imageToPng(image)
}

/**
 *
 * @param 读取文件内容
 */
export function readFile(file, dataType = 'DataURL') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const fnName = `readAs${dataType}`

    if (!reader[fnName])
      throw new Error('File read error, dataType not support')

    reader.onerror = () => {
      reject(new Error('File read error'))
    }

    reader.onload = () => {
      resolve(reader.result)
    }

    reader[fnName](file)
  })
}

export function svgFile2Png(file) {
  return readFile(file, 'Text').then(svgToPng)
}

export function withResolvers<T>(): {
  promise: Promise<T>
  resolve?: (value: T | PromiseLike<T>) => void
  reject?: (reason?: any) => void
} {
  let resolve: ((value: T | PromiseLike<T>) => void) | undefined
  let reject: ((reason?: any) => void) | undefined

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    promise,
    resolve,
    reject,
  }
}

export function formatEndsImage(url: string) {
  if (!url)
    return ''

  if (url.startsWith('http'))
    return url

  return globalOptions.getEndsUrl() + url
}

export function useTypedRef<T extends abstract new (...args: any) => any>(_comp: T) {
  return ref<InstanceType<T>>()
}

export function getProtocolUrl(key: string) {
  return `${location.origin}/guide/protocol?key=${key}`
}

// 从a-b区间映射到c-d分区间
export function mapperRange(rangeA: [number, number], rangeB: [number, number], value: number) {
  const [minA, maxA] = rangeA
  const [minB, maxB] = rangeB

  return minB + (value - minA) * (maxB - minB) / (maxA - minA)
}

export function useVibrate(type: 'light' | 'heavy' | 'medium' | 'bit') {
  switch (type) {
    case 'light':
      useAutoVibrate([5])
      break
    case 'heavy':
      useAutoVibrate([5, 30])
      break
    case 'medium':
      useAutoVibrate([10, 15])
      break
    case 'bit':
      useAutoVibrate([2, 1])
      break
  }
}

export function useAutoVibrate(duration: number[]) {
  if (typeof window !== 'undefined' && window.navigator.vibrate)
    window.navigator.vibrate(duration)
}
