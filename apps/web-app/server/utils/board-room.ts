import type { BoardData } from '@kosarev/database'
import type { BoardEvent, HeldItem } from '../../shared/board'
import { commitMove, normalizeMove } from '../../shared/board'

type Listener = (event: BoardEvent) => void

/** Socket order includes async saves: a reconnect always observes the previous drop. */
export class BoardRoom {
  private listeners = new Map<string, Listener>()
  private held = new Map<string, HeldItem>()
  private lastPreview = new Map<string, number>()
  private state?: BoardData
  private pending = Promise.resolve()

  constructor(private load: () => Promise<BoardData>, private update: (change: (current: BoardData) => BoardData) => Promise<BoardData>) {}

  private ordered(work: () => Promise<void> | void) {
    const result = this.pending.then(work)
    this.pending = result.catch(() => {})
    return result
  }

  private snapshot(landed?: string): BoardEvent {
    return { type: 'board-state', state: this.state!, held: [...this.held.values()], landed }
  }

  private broadcast(event: BoardEvent) {
    for (const send of this.listeners.values()) {
      send(event)
    }
  }

  join(owner: string, send: Listener) {
    return this.ordered(async () => {
      this.state = await this.load()
      this.listeners.set(owner, send)
      send(this.snapshot())
    })
  }

  leave(owner: string) {
    return this.ordered(() => {
      this.listeners.delete(owner)
      this.lastPreview.delete(owner)
      for (const [id, item] of this.held) {
        if (item.owner === owner) {
          this.held.delete(id)
          this.broadcast(this.snapshot())
        }
      }
    })
  }

  act(owner: string, action: unknown, input: unknown) {
    return this.ordered(async () => {
      const send = this.listeners.get(owner)
      const item = this.state && normalizeMove(this.state, input)
      if (!send || !item) {
        return
      }
      const holder = this.held.get(item.id)
      if (action === 'begin') {
        const occupied = item.kind && this.state!.stickers.some((s) => s.kind === item.kind && s.id !== item.id)
        if (occupied || holder || [...this.held.values()].some((h) => h.owner === owner || (item.kind && h.kind === item.kind))) {
          send({ type: 'board-denied', id: item.id })
          send(this.snapshot())
          return
        }
        this.lastPreview.delete(owner)
      } else if (holder?.owner !== owner || holder.kind !== item.kind) {
        return
      }
      if (action === 'begin' || action === 'preview') {
        const now = Date.now()
        if (action === 'preview' && now - (this.lastPreview.get(owner) ?? 0) < 32) {
          return
        }
        if (action === 'preview') {
          this.lastPreview.set(owner, now)
        }
        const held = { ...item, owner }
        this.held.set(item.id, held)
        this.broadcast({ type: 'board-held', item: held })
      } else if (action === 'drop' || action === 'remove' || action === 'cancel') {
        this.held.delete(item.id)
        let landed: string | undefined
        try {
          if (action !== 'cancel') {
            this.state = await this.update((current) => commitMove(current, item, action === 'remove'))
            if (action === 'drop' && (!item.kind || this.state.stickers.some((s) => s.id === item.id))) {
              landed = item.id
            }
          }
        } finally {
          this.broadcast(this.snapshot(landed))
        }
      }
    })
  }
}
