import { bank, clampLag, follow, paperMotion } from './motion'

export interface Point { x: number, y: number }
/** Normalized world coordinates, with the sticker anchored at its center. */
export interface PlacedSticker<Id> extends Point { id: Id, rotation: number }
export interface StickerLayout<Id> {
  ids: readonly Id[]
  legacyIds?: ReadonlyMap<string, Id>
  defaults: readonly Omit<PlacedSticker<Id>, 'rotation'>[]
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
  landed: Id | null = null
  paper: (Point & { id: Id, vx: number, vy: number }) | null = null
  corner = 1
  private gesture: { start: Press, item: PlacedSticker<Id>, offset: Point } | null = null

  constructor(readonly layout: StickerLayout<Id>, private readonly store?: StickerStore, private readonly random = Math.random) {
    this.placed = layout.defaults.map((item) => ({ ...item, rotation: 0 }))
  }

  private angle() {
    return Math.round((this.random() * 2 - 1) * paperMotion.rotationRange * 10) / 10
  }

  private save() {
    try {
      this.store?.write(JSON.stringify({ version: 2, placed: this.placed }))
    } catch { /* The layout remains usable in memory. */ }
  }

  restore() {
    try {
      const data = JSON.parse(this.store?.read() ?? 'null')
      if (data === null) {
        this.placed = this.layout.defaults.map((item) => ({ ...item, rotation: this.angle() }))
        this.save()
        return
      }
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
        let assigned = false
        this.placed = items.map(({ id, x, y, rotation }) => {
          if (Number.isFinite(rotation) && Math.abs(rotation) <= paperMotion.rotationRange) {
            return { id, x, y, rotation }
          }
          assigned = true
          return { id, x, y, rotation: this.angle() }
        })
        if (assigned) {
          this.save()
        }
      }
    } catch { /* Storage is optional, including browsers that deny access. */ }
  }

  get pointerId() {
    return this.gesture?.start.pointerId
  }

  get lifted() {
    return this.draft?.id ?? this.gesture?.item.id
  }

  private liftPaper(item: PlacedSticker<Id>, corner: number) {
    this.landed = null
    this.corner = corner
    this.paper = { id: item.id, x: item.x, y: item.y, vx: 0, vy: 0 }
  }

  settlePaper() {
    const item = this.draft ?? this.gesture?.item
    this.paper = item ? { id: item.id, x: item.x, y: item.y, vx: 0, vy: 0 } : null
  }

  frame(elapsedMs: number, space: StickerSpace) {
    const paper = this.paper
    const target = this.draft ?? this.placed.find((item) => item.id === paper?.id)
    if (!paper || !target) {
      return false
    }
    const x = follow(paper.x, paper.vx, target.x, space.width, elapsedMs / 1000)
    const y = follow(paper.y, paper.vy, target.y, space.height, elapsedMs / 1000)
    const moving = Math.hypot((x.position - target.x) * space.width, (y.position - target.y) * space.height) > 0.05
      || Math.hypot(x.velocity * space.width, y.velocity * space.height) > 1
    if (moving) {
      this.paper = { id: target.id, x: x.position, y: y.position, vx: x.velocity, vy: y.velocity }
    } else {
      this.settlePaper()
    }
    return moving
  }

  pose(item: PlacedSticker<Id>, space: StickerSpace) {
    const paper = this.paper
    if (paper?.id !== item.id) {
      return
    }
    return {
      x: clampLag((paper.x - item.x) * space.width),
      y: clampLag((paper.y - item.y) * space.height),
      roll: bank(paper.vx * space.width),
      pitch: -bank(paper.vy * space.height),
    }
  }

  get artwork() {
    const draft = this.draft
    return draft ? [...this.placed.filter((s) => s.id !== draft.id), draft] : this.placed
  }

  pick(id: Id, screenCenter: Point, space: StickerSpace) {
    this.gesture = null
    const existing = this.placed.find((s) => s.id === id)
    this.draft = existing ?? { id, ...fromScreen(screenCenter, space), rotation: this.angle() }
    this.position(this.draft, space)
    this.liftPaper(this.draft, 1)
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
    if (!this.draft) {
      this.liftPaper(item, point.x < item.x ? -1 : 1)
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
    this.paper = null
    return 'host'
  }

  private position(point: Point, space: StickerSpace) {
    if (this.draft) {
      const clamp = (value: number, inset: number) => {
        const edge = Math.min(0.5, inset)
        return Math.max(edge, Math.min(1 - edge, value))
      }
      this.draft = { ...this.draft, x: clamp(point.x, this.layout.width / 2 / space.width), y: clamp(point.y, this.layout.height / 2 / space.height) }
    }
  }

  finish(action: 'stick' | 'remove' | 'cancel') {
    this.gesture = null
    this.landed = action === 'stick' && this.draft ? this.draft.id : null
    if (!this.landed) {
      this.paper = null
    }
    if (this.draft && action !== 'cancel') {
      const others = this.placed.filter((item) => item.id !== this.draft!.id)
      this.placed = action === 'stick' ? [...others, this.draft] : others
      this.save()
    }
    this.draft = null
  }
}
