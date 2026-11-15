import type { CanvasBlock } from './canvas-layout'

export const homeCanvas = { columns: 17, rows: 9, cell: 96, gap: 16 }
export const homeBlocks: CanvasBlock[] = [
  { id: 'hero', x: 0, y: 0, w: 5, h: 5 },
  { id: 'context', x: 5, y: 0, w: 6, h: 3 },
  { id: 'k39', x: 11, y: 0, w: 6, h: 3 },
  { id: 'woodlands', x: 11, y: 3, w: 3, h: 6 },
  { id: 'dostigus', x: 8, y: 3, w: 3, h: 4 },
  { id: 'archive', x: 5, y: 7, w: 6, h: 2 },
  { id: 'writing', x: 5, y: 3, w: 3, h: 4 },
  { id: 'cv', x: 14, y: 3, w: 3, h: 3 },
  { id: 'contacts', x: 0, y: 5, w: 5, h: 2 },
  { id: 'live', x: 0, y: 7, w: 5, h: 2 },
  { id: 'now', x: 14, y: 6, w: 3, h: 3 },
]
