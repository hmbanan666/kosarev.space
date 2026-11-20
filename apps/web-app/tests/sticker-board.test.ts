import { describe, expect, it } from 'vitest'
import { StickerBoard } from '../app/utils/stickers/board'

const space = { left: 100, top: 50, width: 1000, height: 800, scale: 0.5 }
const layout = { ids: ['orbit', 'wave'] as const, defaults: [{ id: 'orbit', kind: 'orbit' as const, x: 0.5, y: 0.5 }], width: 104, height: 78 }
const press = { pointerId: 1, x: 360, y: 250, editing: false, reserved: false, touch: false }

describe('sticker board', () => {
  it('leaves a click on a placed sticker to the canvas and preserves its grab offset after a drag', () => {
    const board = new StickerBoard(layout)
    expect(board.down(press, space)).toBe('pending')
    board.move({ ...press, x: 362 }, space)
    expect(board.up(press, space)).toBe('host')
    expect(board.draft).toBeNull()
    board.down(press, space)
    board.move({ ...press, x: 410 }, space)
    expect(board.draft).toMatchObject({ id: 'orbit', x: 0.6, y: 0.5 })
    expect(board.placed).toMatchObject(layout.defaults)
    expect(board.up({ ...press, x: 410 }, space)).toBe('stuck')
    expect(board.placed[0]?.x).toBeCloseTo(0.6)
  })

  it('hands the final pose to the shared store and waits for authoritative placement', () => {
    const events: unknown[] = []
    const board = new StickerBoard(layout, (action, item) => events.push({ action, item }), () => 0.25)
    board.pick('wave', 'wave', { x: 350, y: 250 }, space)
    board.nudge(100, -80, space)
    board.finish('stick')
    expect(events).toEqual([{ action: 'stick', item: { id: 'wave', kind: 'wave', x: 0.6, y: 0.4, rotation: -4 } }])
    expect(board.placed).toMatchObject(layout.defaults)
  })

  it('lifts on press, trails a moving target, banks on reversal and lands at the release point', () => {
    const board = new StickerBoard(layout)
    board.down(press, space)
    expect(board.lifted).toBe('orbit')
    expect(board.draft).toBeNull()
    board.move({ ...press, x: 374 }, space)
    board.frame(16, space)
    const moving = board.pose(board.draft!, space)!
    expect(moving.x).toBeGreaterThan(-28)
    expect(moving.x).toBeLessThan(0)
    expect(moving.roll).toBeGreaterThan(0)
    board.move({ ...press, x: 348 }, space)
    board.frame(32, space)
    expect(board.pose(board.draft!, space)!.roll).toBeLessThan(0)
    board.up({ ...press, x: 345 }, space)
    expect(board.landed).toBe('orbit')
    expect(board.placed[0]!.x).toBeCloseTo(0.47)
    for (let i = 0; i < 80; i++) {
      board.frame(16, space)
    }
    expect(board.pose(board.placed[0]!, space)).toBeUndefined()
  })

  it('hands controls, empty paper and native touch pan to the host', () => {
    const board = new StickerBoard(layout)
    for (const input of [{ reserved: true }, { x: 100 }, { touch: true }]) {
      expect(board.down({ ...press, ...input }, space)).toBe('host')
      expect(board.pointerId).toBeUndefined()
    }
  })

  it('hits the uppermost sticker, holds the initiating pointer and cancels without saving', () => {
    const defaults = [...layout.defaults, { id: 'wave', kind: 'wave' as const, x: 0.5, y: 0.5 }]
    const writes: string[] = []
    const board = new StickerBoard({ ...layout, defaults }, (action) => writes.push(action))
    board.down(press, space)
    expect(board.move({ ...press, pointerId: 2, x: 420 }, space)).toBe(false)
    expect(board.up({ ...press, pointerId: 2 }, space)).toBe('host')
    board.move({ ...press, x: 420 }, space)
    expect(board.draft?.id).toBe('wave')
    board.finish('cancel')
    expect(board.pointerId).toBeUndefined()
    expect(board.up(press, space)).toBe('host')
    expect(board.artwork).toMatchObject(defaults)
    expect(writes).toEqual(['cancel'])
  })

  it('passes clicks through the open sheet, lifts from the keyboard, follows a changed projection and clamps the paper at the edge', () => {
    const board = new StickerBoard(layout)
    const editing = { ...press, editing: true }
    expect(board.down(editing, space)).toBe('pending')
    expect(board.up(editing, space)).toBe('host')
    board.pick('orbit', 'orbit', press, space)
    const zoomed = { ...space, left: -150, scale: 1 }
    board.move({ ...press, x: 100, y: 450 }, zoomed)
    expect(board.draft).toMatchObject({ id: 'orbit', x: 0.25, y: 0.5 })
    board.down(editing, zoomed)
    board.up({ ...press, x: -1000, y: 2000 }, zoomed)
    expect(board.placed).toMatchObject([{ id: 'orbit', x: 0.052, y: 0.95125 }])
  })
})

it('only picks available designs and returns a placed design to the sheet', () => {
  const board = new StickerBoard(layout)
  expect(board.placedKind('orbit')?.id).toBe('orbit')
  board.pick('copy', 'orbit', press, space)
  expect(board.draft).toBeNull()
  board.removeKind('orbit')
  expect(board.placedKind('orbit')).toBeUndefined()
  board.pick('new', 'orbit', press, space)
  board.finish('stick')
  expect(board.placedKind('orbit')?.id).toBe('new')
})

it('highlights the sheet during a board drag and uses the release point for removal', () => {
  const board = new StickerBoard(layout)
  const sheet = { left: 100, right: 300, top: 400, bottom: 500 }
  const inside = { ...press, x: 120, y: 420 }
  board.down(press, space)
  board.move(inside, space, sheet)
  expect(board.overSheet).toBe(true)
  board.move({ ...press, x: 370 }, space, sheet)
  expect(board.overSheet).toBe(false)
  board.up(inside, space, sheet)
  expect(board.placed).toHaveLength(0)
  expect(board.overSheet).toBe(false)
})
