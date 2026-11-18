import type { StickerLayout } from './board'

export const ids = ['orbit', 'caliper', 'contours', 'prism', 'wave', 'compass', 'spool', 'section'] as const
export type StickerId = typeof ids[number]

export const homeSheet: StickerLayout<StickerId> = {
  ids,
  defaults: [{ id: 'orbit', x: 0.36, y: 0.192 }, { id: 'caliper', x: 0.263, y: 0.49 }],
  width: 104,
  height: 78,
}

export const storageKey = 'portfolio-stickers-v1'
