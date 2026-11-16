import type { CanvasBlock } from './canvas-layout'

export const homeCanvas = { columns: 17, rows: 11, cell: 96, gap: 16 }
// Ranked project slots leave full cells between clusters. IDs break equal scores
// deterministically; array order also defines the mobile reading order.
export function activityLayout(scores: Record<string, number> = {}): CanvasBlock[] {
  const projects = ['context', 'k39', 'woodlands', 'space'].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0) || a.localeCompare(b))
  const slots = [{ x: 6, y: 3, w: 6, h: 3 }, { x: 13, y: 0, w: 4, h: 3 }, { x: 13, y: 4, w: 4, h: 3 }, { x: 13, y: 8, w: 4, h: 3 }]
  return [
    { id: 'hero', x: 0, y: 2, w: 5, h: 5 },
    ...projects.map((id, index) => ({ id, ...slots[index]! })),
    { id: 'contributions', x: 6, y: 0, w: 6, h: 2 },
    { id: 'feed', x: 6, y: 7, w: 6, h: 4 },
    { id: 'skills', x: 0, y: 7, w: 5, h: 2 },
    { id: 'cv', x: 0, y: 0, w: 3, h: 2 },
    { id: 'writing', x: 0, y: 9, w: 3, h: 2 },
    { id: 'live', x: 3, y: 0, w: 2, h: 2 },
    { id: 'contacts', x: 3, y: 9, w: 2, h: 2 },
  ]
}
export const homeBlocks = activityLayout()
