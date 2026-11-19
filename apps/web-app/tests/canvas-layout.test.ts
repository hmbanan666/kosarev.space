import { expect, it } from 'vitest'
import { placeCanvasBlock } from '../app/utils/canvas-layout'
import { activityLayout, homeBlocks, homeCanvas } from '../app/utils/home-canvas'

const blocks = [
  { id: 'large', x: 0, y: 0, w: 2, h: 2 },
  { id: 'small', x: 2, y: 0, w: 1, h: 1 },
]
it.each([false, true])('keeps default cards within the grid without overlaps (publication: %s)', (hasPublication) => {
  const defaults = activityLayout({}, hasPublication)
  expect(homeBlocks.reduce((sum, b) => sum + b.w * b.h, 0)).toBeLessThanOrEqual(homeCanvas.columns * homeCanvas.rows * 0.8)
  for (let y = 0; y < homeCanvas.rows; y++) {
    for (let x = 0; x < homeCanvas.columns; x++) {
      const occupants = defaults.filter((block) => x >= block.x && x < block.x + block.w && y >= block.y && y < block.y + block.h)
      expect(occupants.length, `cell ${x},${y}`).toBeLessThanOrEqual(1)
    }
  }
})
it('snaps a move to a cell and clamps it inside the board', () => {
  expect(placeCanvasBlock(blocks, { columns: 5, rows: 4 }, 'large', 3.7, 9)?.[0]).toEqual({ id: 'large', x: 3, y: 2, w: 2, h: 2 })
})

it('pushes a neighbour into a free cell without changing either size', () => {
  expect(placeCanvasBlock(blocks, { columns: 5, rows: 4 }, 'large', 2, 0)).toEqual([
    { id: 'large', x: 2, y: 0, w: 2, h: 2 }, { id: 'small', x: 1, y: 0, w: 1, h: 1 },
  ])
})

it('pushes a chain of differently sized neighbours on the actual home board', () => {
  const first = placeCanvasBlock(homeBlocks, homeCanvas, 'context', 5, 2)!
  const current = placeCanvasBlock(first, homeCanvas, 'context', 5, 4)!
  expect(current.find((block) => block.id === 'context')).toMatchObject({ x: 5, y: 4 })
  for (const [index, a] of current.entries()) {
    expect(a.x).toBeGreaterThanOrEqual(0)
    expect(a.y).toBeGreaterThanOrEqual(0)
    expect(a.x + a.w).toBeLessThanOrEqual(homeCanvas.columns)
    expect(a.y + a.h).toBeLessThanOrEqual(homeCanvas.rows)
    for (const b of current.slice(index + 1)) {
      expect(a.x >= b.x + b.w || a.x + a.w <= b.x || a.y >= b.y + b.h || a.y + a.h <= b.y).toBe(true)
    }
  }
})

it('rejects an impossible move without moving any block', () => {
  const full = [{ id: 'a', x: 0, y: 0, w: 2, h: 2 }, { id: 'b', x: 2, y: 0, w: 2, h: 2 }]
  expect(placeCanvasBlock(full, { columns: 4, rows: 2 }, 'a', 1, 0)).toBeNull()
  expect(full[0]?.x).toBe(0)
})

it('places existing paused and archive projects beyond the main cluster', () => {
  for (const id of ['dostigus', 'meloteka', 'startodel', 'chatgame', 'nextorders']) {
    const block = homeBlocks.find((block) => block.id === id)
    expect(block, id).toBeDefined()
    expect(block!.x >= 20 || block!.y >= 12).toBe(true)
  }
  expect(homeCanvas.columns).toBeGreaterThan(20)
  expect(homeCanvas.rows).toBeGreaterThan(12)
})
