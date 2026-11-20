import type { StickerLayout } from './board'

export const ids = [
  'monkey-bright-idea', 'monkey-pink-mug', 'monkey-love-lab',
  'monkey-skull-laptop', 'monkey-heart-eyes', 'monkey-grumpy-reader',
  'monkey-money-hat', 'monkey-thumbs-up-trophy', 'monkey-laptop-panic',
] as const
export type StickerId = typeof ids[number]

const kinds = new Set<string>(ids)
export function isStickerKind(value: unknown): value is StickerId {
  return typeof value === 'string' && kinds.has(value)
}

export const homeSheet: StickerLayout<StickerId> = {
  ids,
  defaults: [{ id: 'monkey-bright-idea', kind: 'monkey-bright-idea', x: 0.39, y: 0.192 }, { id: 'monkey-pink-mug', kind: 'monkey-pink-mug', x: 0.263, y: 0.49 }],
  width: 174,
  height: 174,
}
