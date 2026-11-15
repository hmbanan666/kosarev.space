import type { CanvasBlock } from './canvas-layout'

export const homeCanvas = { columns: 17, rows: 9, cell: 96 }
export const homeBlocks: CanvasBlock[] = [
  { id: 'hero', x: 0, y: 0, w: 5, h: 5 },
  { id: 'context', x: 5, y: 0, w: 4, h: 3 },
  { id: 'k39', x: 9, y: 0, w: 5, h: 3 },
  { id: 'woodlands', x: 14, y: 0, w: 3, h: 3 },
  { id: 'dostigus', x: 9, y: 3, w: 3, h: 3 },
  { id: 'archive', x: 9, y: 6, w: 5, h: 2 },
  { id: 'writing', x: 5, y: 3, w: 4, h: 3 },
  { id: 'cv', x: 12, y: 3, w: 3, h: 2 },
  { id: 'contacts', x: 0, y: 5, w: 5, h: 2 },
  { id: 'live', x: 5, y: 6, w: 4, h: 2 },
  { id: 'now', x: 14, y: 6, w: 3, h: 2 },
]
