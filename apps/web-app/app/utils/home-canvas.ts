import type { CanvasBlock } from './canvas-layout'

export const homeCanvas = { columns: 28, rows: 18, cell: 96, gap: 16 }
// Ranked project slots leave full cells between clusters. IDs break equal scores
// deterministically; array order also defines the mobile reading order.
export function activityLayout(scores: Record<string, number> = {}, hasPublication = false): CanvasBlock[] {
  const projects = ['context', 'k39', 'woodlands', 'space'].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0) || a.localeCompare(b))
  const slots = [{ x: 8, y: 4, w: 7, h: 3 }, { x: 16, y: 1, w: 4, h: 3 }, { x: 16, y: 5, w: 4, h: 3 }, { x: 15, y: 9, w: 5, h: 3 }]
  return [
    { id: 'hero', x: 0, y: 2, w: 7, h: 8 },
    ...projects.map((id, index) => ({ id, ...slots[index]! })),
    { id: 'contributions', x: 7, y: 0, w: 8, h: 3 },
    { id: 'feed', x: 8, y: 8, w: 5, h: 4 },
    { id: 'skills', x: 0, y: 10, w: 6, h: 2 },
    { id: 'cv', x: 0, y: 0, w: 3, h: 2 },
    { id: 'writing', x: 13, y: 7, w: 3, h: 2 },
    { id: 'live', x: 4, y: 0, w: 3, h: 2 },
    { id: 'dostigus', x: 21, y: 3, w: 5, h: 3 },
    { id: 'meloteka', x: 22, y: 8, w: 5, h: 3 },
    { id: 'startodel', x: 17, y: 14, w: 5, h: 3 },
    { id: 'chatgame', x: 10, y: 13, w: 5, h: 3 },
    { id: 'nextorders', x: 2, y: 14, w: 5, h: 3 },
    ...(hasPublication ? [{ id: 'publication', x: 21, y: 11, w: 6, h: 3 }] : []),
    { id: 'contacts', x: 25, y: 15, w: 3, h: 2 },
  ]
}
export const homeBlocks = activityLayout()
