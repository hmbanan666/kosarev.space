export interface Point { x: number, y: number }
/** Normalized world coordinates, with the sticker anchored at its center. */
export interface PlacedSticker<Id> extends Point { id: Id }
export interface StickerLayout<Id> {
  ids: readonly Id[]
  legacyIds?: ReadonlyMap<string, Id>
  defaults: readonly PlacedSticker<Id>[]
  width: number
  height: number
}
/** Screen origin of the world, its unscaled size, and CSS pixels per world unit. */
export interface StickerSpace { left: number, top: number, width: number, height: number, scale: number }
export interface StickerStore { read: () => string | null, write: (value: string) => void }
interface Pointer extends Point { pointerId: number }
interface Press extends Pointer { editing: boolean, reserved: boolean, touch: boolean }

function fromScreen(point: Point, space: StickerSpace): Point {
  return { x: (point.x - space.left) / (space.width * space.scale), y: (point.y - space.top) / (space.height * space.scale) }
}

export class StickerBoard<Id extends string> {
  placed: readonly PlacedSticker<Id>[]
  draft: PlacedSticker<Id> | null = null
  private gesture: { start: Press, item: PlacedSticker<Id>, offset: Point } | null = null

  constructor(readonly layout: StickerLayout<Id>, private readonly store?: StickerStore) {
    this.placed = layout.defaults
  }

  restore() {
    try {
      const data = JSON.parse(this.store?.read() ?? 'null')
      // The original sheet stored its array directly under the same key.
      const legacy = Array.isArray(data) || data?.version === 1
      const saved = Array.isArray(data) ? data : data?.placed
      if (!Array.isArray(saved) || (!legacy && data?.version !== 2)) {
        return
      }
      const aliases = this.layout.legacyIds
      const items = legacy && aliases
        ? saved.map((s) => ({ ...s, id: aliases.get(s?.id) ?? s?.id }))
        : saved
      const fraction = (n: number) => Number.isFinite(n) && n >= 0 && n <= 1
      if (items.every((s) => s && this.layout.ids.includes(s.id) && fraction(s.x) && fraction(s.y))
        && new Set(items.map((s) => s.id)).size === items.length) {
        this.placed = items
      }
    } catch { /* Storage is optional, including browsers that deny access. */ }
  }

  get pointerId() {
    return this.gesture?.start.pointerId
  }

  get artwork() {
    const draft = this.draft
    return draft ? [...this.placed.filter((s) => s.id !== draft.id), draft] : this.placed
  }

  pick(id: Id, screenCenter: Point, space: StickerSpace) {
    this.gesture = null
    const existing = this.placed.find((s) => s.id === id)
    this.draft = existing ?? { id, ...fromScreen(screenCenter, space) }
    this.position(this.draft, space)
  }

  nudge(dx: number, dy: number, space: StickerSpace) {
    if (this.draft) {
      this.position({ x: this.draft.x + dx / space.width, y: this.draft.y + dy / space.height }, space)
    }
  }

  down(start: Press, space: StickerSpace) {
    if (this.gesture || (!start.editing && (start.reserved || start.touch))) {
      return 'host'
    }
    const point = fromScreen(start, space)
    const item = this.draft ?? this.placed.findLast((item) =>
      Math.abs(item.x - point.x) * space.width <= this.layout.width / 2
      && Math.abs(item.y - point.y) * space.height <= this.layout.height / 2)
    if (!item) {
      return 'host'
    }
    const offset = this.draft ? { x: 0, y: 0 } : { x: item.x - point.x, y: item.y - point.y }
    this.gesture = { start, item, offset }
    return start.editing ? 'capture' : 'pending'
  }

  move(pointer: Pointer, space: StickerSpace) {
    const gesture = this.gesture
    if (gesture) {
      if (gesture.start.pointerId !== pointer.pointerId) {
        return false
      }
      if (!this.draft && Math.hypot(pointer.x - gesture.start.x, pointer.y - gesture.start.y) < 6) {
        return false
      }
      this.draft ??= gesture.item
    }
    if (!this.draft) {
      return false
    }
    const point = fromScreen(pointer, space)
    this.position({ x: point.x + (gesture?.offset.x ?? 0), y: point.y + (gesture?.offset.y ?? 0) }, space)
    return true
  }

  up(pointer: Pointer, space: StickerSpace) {
    const gesture = this.gesture
    if (gesture?.start.pointerId !== pointer.pointerId) {
      return 'host'
    }
    this.move(pointer, space)
    this.gesture = null
    if (this.draft) {
      this.finish('stick')
      return 'stuck'
    }
    if (gesture.start.editing) {
      this.draft = gesture.item
      return 'lifted'
    }
    return 'host'
  }

  private position(point: Point, space: StickerSpace) {
    if (this.draft) {
      const clamp = (value: number, inset: number) => {
        const edge = Math.min(0.5, inset)
        return Math.max(edge, Math.min(1 - edge, value))
      }
      this.draft = { id: this.draft.id, x: clamp(point.x, this.layout.width / 2 / space.width), y: clamp(point.y, this.layout.height / 2 / space.height) }
    }
  }

  finish(action: 'stick' | 'remove' | 'cancel') {
    this.gesture = null
    if (this.draft && action !== 'cancel') {
      const others = this.placed.filter((item) => item.id !== this.draft!.id)
      this.placed = action === 'stick' ? [...others, this.draft] : others
      try {
        this.store?.write(JSON.stringify({ version: 2, placed: this.placed }))
      } catch { /* The layout remains usable in memory. */ }
    }
    this.draft = null
  }
}
