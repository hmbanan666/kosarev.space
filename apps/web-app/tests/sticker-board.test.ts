import { describe, expect, it } from 'vitest'
import { StickerBoard } from '../app/utils/stickers/board'

const space = { left: 100, top: 50, width: 1000, height: 800, scale: 0.5 }
const layout = { ids: ['orbit', 'wave'] as const, defaults: [{ id: 'orbit' as const, x: 0.5, y: 0.5 }], width: 104, height: 78 }
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
    expect(board.draft).toEqual({ id: 'orbit', x: 0.6, y: 0.5 })
    expect(board.placed).toEqual(layout.defaults)
    expect(board.up({ ...press, x: 410 }, space)).toBe('stuck')
    expect(board.placed[0]?.x).toBeCloseTo(0.6)
  })

  it('restores a legacy layout, writes a version on commit and preserves an empty sheet', () => {
    let saved = JSON.stringify([{ id: 'wave', x: 0.1, y: 0.9 }])
    const store = { read: () => saved, write: (value: string) => {
      saved = value
    } }
    const board = new StickerBoard(layout, store)
    board.restore()
    expect(board.placed.map((item) => item.id)).toEqual(['wave'])
    board.pick('wave', press, space)
    board.finish('remove')
    expect(JSON.parse(saved)).toEqual({ version: 1, placed: [] })
    const reopened = new StickerBoard(layout, store)
    reopened.restore()
    expect(reopened.placed).toEqual([])
  })

  it('hands controls, empty paper and native touch pan to the host', () => {
    const board = new StickerBoard(layout)
    for (const input of [{ reserved: true }, { x: 100 }, { touch: true }]) {
      expect(board.down({ ...press, ...input }, space)).toBe('host')
      expect(board.pointerId).toBeUndefined()
    }
  })

  it('hits the uppermost sticker, holds the initiating pointer and cancels without saving', () => {
    const defaults = [...layout.defaults, { id: 'wave' as const, x: 0.5, y: 0.5 }]
    const writes: string[] = []
    const board = new StickerBoard({ ...layout, defaults }, { read: () => null, write: (s) => writes.push(s) })
    board.down(press, space)
    expect(board.move({ ...press, pointerId: 2, x: 420 }, space)).toBe(false)
    expect(board.up({ ...press, pointerId: 2 }, space)).toBe('host')
    board.move({ ...press, x: 420 }, space)
    expect(board.draft?.id).toBe('wave')
    board.finish('cancel')
    expect(board.pointerId).toBeUndefined()
    expect(board.up(press, space)).toBe('host')
    expect(board.artwork).toEqual(defaults)
    expect(writes).toEqual([])
  })

  it('clicks to lift in the sheet, follows a changed projection and clamps the paper at the edge', () => {
    const board = new StickerBoard(layout)
    const editing = { ...press, editing: true }
    expect(board.down(editing, space)).toBe('capture')
    expect(board.up(editing, space)).toBe('lifted')
    const zoomed = { ...space, left: -150, scale: 1 }
    board.move({ ...press, x: 100, y: 450 }, zoomed)
    expect(board.draft).toEqual({ id: 'orbit', x: 0.25, y: 0.5 })
    board.down(editing, zoomed)
    board.up({ ...press, x: -1000, y: 2000 }, zoomed)
    expect(board.placed).toEqual([{ id: 'orbit', x: 0.052, y: 0.95125 }])
  })

  it('picks at the viewport center and nudges in world units with storage unavailable', () => {
    const denied = () => {
      throw new Error('access denied')
    }
    const board = new StickerBoard(layout, { read: denied, write: denied })
    board.restore()
    board.pick('wave', { x: 350, y: 250 }, space)
    board.nudge(100, -80, space)
    board.finish('stick')
    expect(board.placed).toEqual([...layout.defaults, { id: 'wave', x: 0.6, y: 0.4 }])
  })

  it.each(['{', '{"version":2,"placed":[]}', '[null]', '[{"id":"wave","x":-1,"y":1}]', '[{"id":"unknown","x":0,"y":1}]', JSON.stringify([...layout.defaults, ...layout.defaults])])('retains defaults for unsupported or invalid storage: %s', (saved) => {
    const board = new StickerBoard(layout, { read: () => saved, write: () => {} })
    board.restore()
    expect(board.placed).toEqual(layout.defaults)
  })
})
