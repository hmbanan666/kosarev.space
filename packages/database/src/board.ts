export interface BoardPoint { id: string, x: number, y: number }
export interface BoardData {
  blocks: (BoardPoint & { w: number, h: number })[]
  stickers: (BoardPoint & { kind: string, rotation: number })[]
}
