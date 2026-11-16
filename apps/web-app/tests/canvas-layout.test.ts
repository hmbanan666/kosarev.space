import { describe, expect, it } from 'vitest'
import { canvasStorageKey, createCanvasLayout } from '../app/utils/canvas-layout'
import { homeBlocks, homeCanvas } from '../app/utils/home-canvas'

const blocks = [
  { id: 'large', x: 0, y: 0, w: 2, h: 2 },
  { id: 'small', x: 2, y: 0, w: 1, h: 1 },
]
it('keeps default cards within the grid without overlaps and leaves intentional gaps', () => {
  const layout = createCanvasLayout(homeBlocks, homeCanvas)
  expect(homeBlocks.reduce((sum, b) => sum + b.w * b.h, 0)).toBeLessThanOrEqual(homeCanvas.columns * homeCanvas.rows * 0.8)
  for (let y = 0; y < homeCanvas.rows; y++) {
    for (let x = 0; x < homeCanvas.columns; x++) {
      const occupants = layout.blocks.filter((block) => x >= block.x && x < block.x + block.w && y >= block.y && y < block.y + block.h)
      expect(occupants.length, `cell ${x},${y}`).toBeLessThanOrEqual(1)
    }
  }
})
describe('visitor canvas layout', () => {
  it('snaps a move to a cell and clamps it inside the board', () => {
    const layout = createCanvasLayout(blocks, { columns: 5, rows: 4 })
    layout.move('large', 3.7, 9)
    expect(layout.blocks[0]).toEqual({ id: 'large', x: 3, y: 2, w: 2, h: 2 })
  })
})

it('pushes a neighbour into a free cell without changing either size', () => {
  const layout = createCanvasLayout(blocks, { columns: 5, rows: 4 })
  layout.move('large', 2, 0)
  expect(layout.blocks).toEqual([
    { id: 'large', x: 2, y: 0, w: 2, h: 2 },
    { id: 'small', x: 1, y: 0, w: 1, h: 1 },
  ])
})
it('persists a valid layout, restores it, and supports reset and undo', () => {
  const data = new Map<string, string>()
  const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => {
    data.set(key, value)
  } }
  const layout = createCanvasLayout(blocks, { columns: 5, rows: 4 }, storage)
  layout.move('large', 3, 2)
  const restored = createCanvasLayout(blocks, { columns: 5, rows: 4 }, storage)
  restored.restore()
  expect(restored.blocks[0]?.x).toBe(3)
  restored.reset()
  expect(restored.blocks).toEqual(blocks)
  restored.undo()
  expect(restored.blocks[0]?.x).toBe(3)
  data.set(canvasStorageKey, '{broken')
  const invalid = createCanvasLayout(blocks, { columns: 5, rows: 4 }, storage)
  invalid.restore()
  expect(invalid.blocks).toEqual(blocks)
})
it('rejects overlapping, out of bounds, duplicate and stale saved positions', () => {
  for (const saved of [
    { version: 3, blocks: blocks.map((b) => ({ ...b, x: 0, y: 0 })) },
    { version: 3, blocks: blocks.map((b) => ({ ...b, x: -1 })) },
    { version: 3, blocks: [blocks[0], blocks[0]] },
    { version: 0, blocks },
  ]) {
    const layout = createCanvasLayout(blocks, { columns: 5, rows: 4 }, { getItem: () => JSON.stringify(saved), setItem: () => {} })
    layout.restore()
    expect(layout.blocks).toEqual(blocks)
  }
})
it('keeps a full board valid and tolerates blocked storage', () => {
  const full = [{ id: 'a', x: 0, y: 0, w: 2, h: 2 }, { id: 'b', x: 2, y: 0, w: 1, h: 2 }]
  const layout = createCanvasLayout(full, { columns: 3, rows: 2 }, { getItem: () => {
    throw new Error('blocked')
  }, setItem: () => {
    throw new Error('full')
  } })
  layout.restore()
  layout.move('a', 1, 0)
  expect(layout.blocks).toEqual([{ ...full[0], x: 1 }, { ...full[1], x: 0 }])
  layout.undo()
  expect(layout.blocks).toEqual(full)
})

it('pushes a chain of differently sized neighbours on the actual home board', () => {
  const layout = createCanvasLayout(homeBlocks, homeCanvas)
  expect(layout.move('context', 5, 2)).toBe(true)
  expect(layout.move('context', 5, 4)).toBe(true)
  const current = layout.blocks
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

it('rejects an impossible move atomically, including the undo history', () => {
  const full = [{ id: 'a', x: 0, y: 0, w: 2, h: 2 }, { id: 'b', x: 2, y: 0, w: 2, h: 2 }]
  const layout = createCanvasLayout(full, { columns: 4, rows: 2 })
  expect(layout.preview('a', 1, 0)).toBeNull()
  expect(layout.move('a', 1, 0)).toBe(false)
  expect(layout.blocks).toEqual(full)
  expect(layout.canUndo).toBe(false)
})

it('preserves a visitor arrangement and sizes when activity changes the default ranking', () => {
  const data = new Map<string, string>()
  const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => {
    data.set(key, value)
  } }
  const layout = createCanvasLayout(homeBlocks, homeCanvas, storage)
  layout.move('context', 5, 4)
  const changedDefaults = homeBlocks.map((block) => block.id === 'context' ? { ...block, w: 4 } : block)
  const restored = createCanvasLayout(changedDefaults, homeCanvas, storage)
  restored.restore()
  expect(restored.blocks).toEqual(layout.blocks)
})
