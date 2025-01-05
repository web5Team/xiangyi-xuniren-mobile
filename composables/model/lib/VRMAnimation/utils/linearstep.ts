import { saturate } from './saturate'

export function linearstep(a: number, b: number, t: number) {
  return saturate((t - a) / (b - a))
}
