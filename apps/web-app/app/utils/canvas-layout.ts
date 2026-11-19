export interface CanvasBlock { id: string, x: number, y: number, w: number, h: number }
export interface CanvasBounds { columns: number, rows: number }
const copy = (blocks: readonly CanvasBlock[]) => blocks.map((block) => ({ ...block }))
const overlaps = (a: CanvasBlock, b: CanvasBlock) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

export function placeCanvasBlock(blocks: readonly CanvasBlock[], bounds: CanvasBounds, id: string, x: number, y: number): CanvasBlock[] | null {
  const inside = (b: CanvasBlock) => [b.x, b.y, b.w, b.h].every(Number.isInteger) && b.w > 0 && b.h > 0 && b.x >= 0 && b.y >= 0 && b.x + b.w <= bounds.columns && b.y + b.h <= bounds.rows
  const next = copy(blocks)
  const moving = next.find((block) => block.id === id)
  if (!moving || !Number.isFinite(x) || !Number.isFinite(y)) {
    return null
  }
  moving.x = Math.max(0, Math.min(bounds.columns - moving.w, Math.round(x)))
  moving.y = Math.max(0, Math.min(bounds.rows - moving.h, Math.round(y)))
  const displaced = next.filter((block) => block.id !== id && overlaps(block, moving))
  const fixed = next.filter((block) => !displaced.includes(block))
  function place(pending: CanvasBlock[], placed: CanvasBlock[]) {
    // The board is small. Bound the search so even a nearly full visitor
    // arrangement cannot monopolize the UI thread.
    let attempts = 0
    const candidates = pending.map((block) => Array.from({ length: bounds.columns * bounds.rows }, (_, index) => ({ ...block, x: index % bounds.columns, y: Math.floor(index / bounds.columns) }))
      .filter(inside)
      .sort((a, b) => (Math.abs(a.x - block.x) + Math.abs(a.y - block.y)) - (Math.abs(b.x - block.x) + Math.abs(b.y - block.y))))
    function search(index: number): CanvasBlock[] | null {
      if (index === pending.length) {
        return blocks.map((block) => placed.find((candidate) => candidate.id === block.id)!)
      }
      if (++attempts > 5000) {
        return null
      }
      for (const candidate of candidates[index]!) {
        if (placed.some((other) => overlaps(candidate, other))) {
          continue
        }
        placed.push(candidate)
        const result = search(index + 1)
        if (result) {
          return result
        }
        placed.pop()
      }
      return null
    }
    return search(0)
  }
  // Preserve unaffected blocks first. If a push needs more space, repack larger
  // neighbours first, each as close as possible to its previous position.
  return place(displaced, copy(fixed)) ?? place(
    next.filter((block) => block.id !== id).sort((a, b) => b.w * b.h - a.w * a.h),
    [{ ...moving }],
  )
}
