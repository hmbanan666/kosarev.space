import { describe, expect, it } from 'vitest'
import { activityLayout, homeCanvas } from '../app/utils/home-canvas'
import { commitMove, normalizeMove, seedBoard } from '../shared/board'

describe('shared board input', () => {
  const board = seedBoard(activityLayout({}, true))
  it('uses server dimensions, keeps fractional previews and clamps rotated sticker edges', () => {
    expect(normalizeMove(board, { id: 'hero', x: -2, y: 200, w: 1 })).toEqual({ id: 'hero', x: 0, y: 10 })
    expect(normalizeMove(board, { id: 'cv', x: 1.5, y: 2.2 })).toEqual({ id: 'cv', x: 1.5, y: 2.2 })
    const sticker = normalizeMove(board, { id: crypto.randomUUID(), kind: 'monkey-love-lab', x: 5, y: -4, rotation: 100 })!
    expect(sticker.rotation).toBe(8)
    expect((1 - sticker.x) * (28 * homeCanvas.cell - 16)).toBeGreaterThan(98)
    expect(sticker.y * (18 * homeCanvas.cell - 16)).toBeGreaterThan(98)
    expect(normalizeMove(board, { id: 'unknown', x: 0, y: 0 })).toBeNull()
    expect(normalizeMove(board, { id: 'hero', x: null, y: 0 })).toBeNull()
  })
})

it('streams a held item to peers, refuses a competing drop and releases it on disconnect', async () => {
  const { BoardRoom } = await import('../server/utils/board-room')
  let saved = seedBoard(activityLayout())
  const room = new BoardRoom(async () => saved, async (change) => (saved = change(saved)))
  const messages: unknown[] = []
  await room.join('a', () => {})
  await room.join('b', (msg) => messages.push(msg))
  const item = { id: 'cv', x: 2.2, y: 1 }
  await room.act('a', 'begin', item)
  await room.act('a', 'preview', { ...item, x: 3.5 })
  expect(messages.at(-1)).toMatchObject({ type: 'board-held', item: { owner: 'a', x: 3.5 } })
  await room.act('b', 'begin', item)
  await room.act('b', 'drop', item)
  expect(saved.blocks.find((b) => b.id === 'cv')?.x).toBe(0)
  await room.leave('a')
  await room.act('b', 'begin', item)
  await room.act('b', 'drop', item)
  expect(saved.blocks.find((b) => b.id === 'cv')?.x).toBe(2)
  await room.join('new', (msg) => messages.push(msg))
  expect(messages.at(-1)).toMatchObject({ type: 'board-state', state: saved, held: [] })
})

it('allows repeated designs and drops the oldest of 301 stickers even after it moved', () => {
  let board = seedBoard(activityLayout())
  const first = board.stickers[0]!
  for (let i = 0; i < 298; i++) {
    board = commitMove(board, { ...first, id: crypto.randomUUID() }, false)
  }
  board = commitMove(board, { ...first, x: 0.7 }, false)
  board = commitMove(board, { ...first, id: crypto.randomUUID() }, false)
  expect(board.stickers).toHaveLength(300)
  expect(board.stickers.some((s) => s.id === first.id)).toBe(false)
})
