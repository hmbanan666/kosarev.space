import type { BoardData, BoardPoint } from '@kosarev/database'
import type { CanvasBlock } from '../app/utils/canvas-layout'
import { placeCanvasBlock } from '../app/utils/canvas-layout'
import { homeCanvas } from '../app/utils/home-canvas'
import { clampStickerCenter } from '../app/utils/stickers/board'
import { homeSheet, isStickerKind } from '../app/utils/stickers/home-sheet'
import { paperMotion } from '../app/utils/stickers/motion'

export type BoardMove = BoardPoint & { kind?: string, rotation?: number }
export interface HeldItem extends BoardMove { owner: string }
export interface BoardSnapshot { state: BoardData, held: HeldItem[] }
export type BoardAction = 'begin' | 'preview' | 'drop' | 'cancel' | 'remove'
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

export function seedBoard(blocks: CanvasBlock[]): BoardData {
  return { blocks, stickers: homeSheet.defaults.map((s) => ({ ...s, rotation: Math.round((Math.random() * 2 - 1) * paperMotion.rotationRange * 10) / 10 })) }
}

export function normalizeMove(board: BoardData, input: unknown): BoardMove | null {
  if (!input || typeof input !== 'object' || !('id' in input) || !('x' in input) || !('y' in input)) {
    return null
  }
  const { id, x, y } = input
  if (typeof id !== 'string' || typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) {
    return null
  }
  const block = board.blocks.find((b) => b.id === id)
  if (block) {
    return { id, x: clamp(x, 0, homeCanvas.columns - block.w), y: clamp(y, 0, homeCanvas.rows - block.h) }
  }
  const saved = board.stickers.find((s) => s.id === id)
  const kind = saved?.kind ?? ('kind' in input ? input.kind : undefined)
  if ((!saved && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) || !isStickerKind(kind) || !('rotation' in input) || typeof input.rotation !== 'number' || !Number.isFinite(input.rotation)) {
    return null
  }
  const rotation = clamp(input.rotation, -paperMotion.rotationRange, paperMotion.rotationRange)
  const world = { width: homeCanvas.columns * homeCanvas.cell - homeCanvas.gap, height: homeCanvas.rows * homeCanvas.cell - homeCanvas.gap }
  return { id, kind, ...clampStickerCenter({ x, y }, rotation, homeSheet, world), rotation }
}

// Array order is creation order. Keep the first valid sticker of each design.
export function normalizeStickers(board: BoardData): BoardData {
  const seen = new Set<string>()
  const saved = Array.isArray(board.stickers) ? board.stickers : []
  const stickers = saved.filter((s) => {
    if (!isStickerKind(s?.kind) || seen.has(s.kind) || typeof s.id !== 'string'
      || !Number.isFinite(s.x) || !Number.isFinite(s.y) || !Number.isFinite(s.rotation)) {
      return false
    }
    seen.add(s.kind)
    return true
  })
  return saved === board.stickers && stickers.length === saved.length ? board : { ...board, stickers }
}

export function commitMove(current: BoardData, item: BoardMove, remove: boolean): BoardData {
  const board = normalizeStickers(current)
  if (item.rotation !== undefined && item.kind) {
    const sticker = { id: item.id, kind: item.kind, x: item.x, y: item.y, rotation: item.rotation }
    if (remove) {
      return { ...board, stickers: board.stickers.filter((s) => s.id !== item.id) }
    }
    if (!isStickerKind(item.kind) || board.stickers.some((s) => s.kind === item.kind && s.id !== item.id)) {
      return board
    }
    const index = board.stickers.findIndex((s) => s.id === item.id)
    const stickers = [...board.stickers]
    if (index === -1) {
      stickers.push(sticker)
    } else {
      stickers[index] = sticker
    }
    return { ...board, stickers }
  }
  const blocks = placeCanvasBlock(board.blocks, homeCanvas, item.id, item.x, item.y)
  return blocks && !remove ? { ...board, blocks } : board
}

export type BoardEvent
  = | ({ type: 'board-state', landed?: string } & BoardSnapshot)
    | { type: 'board-held', item: HeldItem }
    | { type: 'board-denied', id: string }
