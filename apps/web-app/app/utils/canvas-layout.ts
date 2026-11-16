export interface CanvasBlock { id: string, x: number, y: number, w: number, h: number }
export interface CanvasBounds { columns: number, rows: number }
export interface LayoutStorage { getItem: (key: string) => string | null, setItem: (key: string, value: string) => void }
export const canvasStorageKey = 'portfolio-layout-v3'
const copy = (blocks: readonly CanvasBlock[]) => blocks.map((block) => ({ ...block }))
const overlaps = (a: CanvasBlock, b: CanvasBlock) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

export function createCanvasLayout(defaults: readonly CanvasBlock[], bounds: CanvasBounds, storage?: LayoutStorage) {
  let blocks = copy(defaults)
  const history: CanvasBlock[][] = []
  const inside = (b: CanvasBlock) => [b.x, b.y, b.w, b.h].every(Number.isInteger) && b.w > 0 && b.h > 0 && b.x >= 0 && b.y >= 0 && b.x + b.w <= bounds.columns && b.y + b.h <= bounds.rows
  function persist() {
    try {
      storage?.setItem(canvasStorageKey, JSON.stringify({ version: 3, blocks }))
    } catch { /* Storage can be unavailable or full. The session remains usable. */ }
  }
  function commit(next: CanvasBlock[]) {
    if (JSON.stringify(next) === JSON.stringify(blocks)) {
      return false
    }
    history.push(copy(blocks))
    if (history.length > 30) {
      history.shift()
    }
    blocks = next
    persist()
    return true
  }
  function preview(id: string, x: number, y: number): CanvasBlock[] | null {
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
  return {
    get blocks() {
      return copy(blocks)
    },
    get canUndo() {
      return history.length > 0
    },
    restore() {
      try {
        const saved = JSON.parse(storage?.getItem(canvasStorageKey) ?? 'null')
        if (saved?.version !== 3 || !Array.isArray(saved.blocks) || saved.blocks.length !== defaults.length) {
          return
        }
        const next = defaults.map((original) => {
          const position = saved.blocks.find((b: CanvasBlock) => b.id === original.id)
          return { ...original, x: position?.x, y: position?.y, w: position?.w, h: position?.h } as CanvasBlock
        })
        if (next.every((block, index) => inside(block) && !next.slice(index + 1).some((other) => overlaps(block, other)))) {
          blocks = next
        }
      } catch { /* Malformed or inaccessible saved data falls back to the default layout. */ }
    },
    preview,
    move(id: string, x: number, y: number) {
      const next = preview(id, x, y)
      return next ? commit(next) : false
    },
    reset() {
      return commit(copy(defaults))
    },
    undo() {
      const previous = history.pop()
      if (!previous) {
        return false
      }
      blocks = previous
      persist()
      return true
    },
  }
}
