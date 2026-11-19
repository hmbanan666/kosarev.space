import type { StickerLayout } from './board'

export const ids = [
  'monkey-bright-idea', 'monkey-pink-mug', 'monkey-love-lab',
  'monkey-skull-laptop', 'monkey-heart-eyes', 'monkey-grumpy-reader',
  'monkey-money-hat', 'monkey-thumbs-up-trophy', 'monkey-laptop-panic',
] as const
export type StickerId = typeof ids[number]

export const homeSheet: StickerLayout<StickerId> = {
  ids,
  defaults: [{ id: 'monkey-bright-idea', x: 0.39, y: 0.192 }, { id: 'monkey-pink-mug', x: 0.263, y: 0.49 }],
  width: 174,
  height: 174,
  legacyIds: new Map([
    ['orbit', 'monkey-bright-idea'],
    ['caliper', 'monkey-pink-mug'],
    ['contours', 'monkey-love-lab'],
    ['prism', 'monkey-skull-laptop'],
    ['wave', 'monkey-laptop-panic'],
    ['compass', 'monkey-heart-eyes'],
    ['spool', 'monkey-grumpy-reader'],
    ['section', 'monkey-money-hat'],
  ]),
}

// Keep the original key so returning visitors can migrate their placements.
export const storageKey = 'portfolio-stickers-v1'
