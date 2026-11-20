import { bank, clampLag, follow, paperMotion } from './motion'

export interface Point { x: number, y: number }
/** Normalized world coordinates, with the sticker anchored at its center. */
export interface PlacedSticker<Id> extends Point { id: string, kind: Id, rotation: number }
export interface StickerLayout<Id> {
  ids: readonly Id[]
  defaults: readonly Omit<PlacedSticker<Id>, 'rotation'>[]
  width: number
  height: number
}
/** Screen origin of the world, its unscaled size, and CSS pixels per world unit. */
export interface StickerSpace { left: number, top: number, width: number, height: number, scale: number }
type SheetBounds = Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'>
export type StickerAction = 'stick' | 'remove' | 'cancel'
type StickerFinish<Id> = (action: StickerAction, item: PlacedSticker<Id>) => void
interface Pointer extends Point { pointerId: number }
interface Press extends Pointer { editing: boolean, reserved: boolean, touch: boolean }

function fromScreen(point: Point, space: StickerSpace): Point {
  return { x: (point.x - space.left) / (space.width * space.scale), y: (point.y - space.top) / (space.height * space.scale) }
}

export function clampStickerCenter(point: Point, rotation: number, paper: { width: number, height: number }, world: { width: number, height: number }): Point {
  const radians = rotation * Math.PI / 180
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))
  const insetX = Math.min(0.5, (paper.width * cos + paper.height * sin) / (2 * world.width))
  const insetY = Math.min(0.5, (paper.width * sin + paper.height * cos) / (2 * world.height))
  return { x: Math.max(insetX, Math.min(1 - insetX, point.x)), y: Math.max(insetY, Math.min(1 - insetY, point.y)) }
}

export type Paper = Point & { id: string, vx: number, vy: number }

export function advancePaper<Id>(paper: Paper, target: PlacedSticker<Id>, space: StickerSpace, elapsedMs: number) {
  const x = follow(paper.x, paper.vx, target.x, space.width, elapsedMs / 1000)
  const y = follow(paper.y, paper.vy, target.y, space.height, elapsedMs / 1000)
  const moving = Math.hypot((x.position - target.x) * space.width, (y.position - target.y) * space.height) > 0.05
    || Math.hypot(x.velocity * space.width, y.velocity * space.height) > 1
  return moving ? { id: target.id, x: x.position, y: y.position, vx: x.velocity, vy: y.velocity } : null
}

export function paperPose<Id>(paper: Paper | null, item: PlacedSticker<Id>, space: StickerSpace) {
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

export class StickerBoard<Id extends string> {
  placed: readonly PlacedSticker<Id>[]
  draft: PlacedSticker<Id> | null = null
  landed: string | null = null
  paper: Paper | null = null
  overSheet = false
  corner = 1
  private gesture: { start: Press, item: PlacedSticker<Id>, offset: Point } | null = null

  constructor(readonly layout: StickerLayout<Id>, private readonly onFinish?: StickerFinish<Id>, private readonly random = Math.random) {
    this.placed = layout.defaults.map((item) => ({ ...item, rotation: 0 }))
  }

  private angle() {
    return Math.round((this.random() * 2 - 1) * paperMotion.rotationRange * 10) / 10
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
    const next = advancePaper(paper, target, space, elapsedMs)
    if (next) {
      this.paper = next
    } else {
      this.settlePaper()
    }
    return !!next
  }

  pose(item: PlacedSticker<Id>, space: StickerSpace) {
    return paperPose(this.paper, item, space)
  }

  get artwork() {
    const draft = this.draft
    return draft ? [...this.placed.filter((s) => s.kind !== draft.kind), draft] : this.placed
  }

  placedKind(kind: Id) {
    return this.placed.find((item) => item.kind === kind)
  }

  get draggingPlaced() {
    return !!this.gesture && !!this.draft && this.placedKind(this.draft.kind)?.id === this.draft.id
  }

  removeKind(kind: Id) {
    const item = this.placedKind(kind)
    if (item) {
      this.finish('remove', item)
    }
  }

  pick(id: string, kind: Id, screenCenter: Point, space: StickerSpace) {
    const existing = this.placedKind(kind)
    if (existing && existing.id !== id) {
      return
    }
    this.gesture = null
    this.draft = existing ?? { id, kind, ...fromScreen(screenCenter, space), rotation: this.angle() }
    this.position(this.draft, space)
    this.liftPaper(this.draft, 1)
    return this.draft
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
    return this.draft ? 'capture' : 'pending'
  }

  move(pointer: Pointer, space: StickerSpace, sheet?: SheetBounds) {
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
    this.overSheet = this.draggingPlaced && !!sheet
      && pointer.x >= sheet.left && pointer.x <= sheet.right
      && pointer.y >= sheet.top && pointer.y <= sheet.bottom
    const point = fromScreen(pointer, space)
    this.position({ x: point.x + (gesture?.offset.x ?? 0), y: point.y + (gesture?.offset.y ?? 0) }, space)
    return true
  }

  up(pointer: Pointer, space: StickerSpace, sheet?: SheetBounds) {
    const gesture = this.gesture
    if (gesture?.start.pointerId !== pointer.pointerId) {
      return 'host'
    }
    this.move(pointer, space, sheet)
    this.gesture = null
    if (this.draft) {
      const remove = this.overSheet
      this.finish(remove ? 'remove' : 'stick')
      return remove ? 'removed' : 'stuck'
    }
    this.paper = null
    this.onFinish?.('cancel', gesture.item)
    return 'host'
  }

  private position(point: Point, space: StickerSpace) {
    if (this.draft) {
      this.draft = { ...this.draft, ...clampStickerCenter(point, this.draft.rotation, this.layout, space) }
    }
  }

  finish(action: StickerAction, item = this.draft ?? this.gesture?.item) {
    this.overSheet = false
    this.gesture = null
    this.landed = action === 'stick' && this.draft ? this.draft.id : null
    if (!this.landed) {
      this.paper = null
    }
    if (item && this.onFinish) {
      this.onFinish(action, item)
    } else if (item && action !== 'cancel') {
      const others = this.placed.filter((s) => s.id !== item.id)
      this.placed = action === 'stick' ? [...others, item] : others
    }
    this.draft = null
  }
}
