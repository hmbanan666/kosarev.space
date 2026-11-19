import type { BoardData } from '../board'
import { eq } from 'drizzle-orm'
import { useDatabase } from '../database'
import { homeBoard } from '../tables'

const singleton = eq(homeBoard.id, 1)
export const HomeBoardRepository = {
  async load(seed: () => Promise<BoardData>) {
    const db = useDatabase()
    const read = async () => (await db.select().from(homeBoard).where(singleton))[0]?.state
    const existing = await read()
    if (existing) {
      return existing
    }
    await db.insert(homeBoard).values({ id: 1, state: await seed() }).onConflictDoNothing()
    return (await read())!
  },
  async update(change: (current: BoardData) => BoardData) {
    return useDatabase().transaction(async (tx) => {
      const [row] = await tx.select().from(homeBoard).where(singleton).for('update')
      if (!row) {
        throw new Error('Shared board has not been seeded')
      }
      const state = change(row.state)
      await tx.update(homeBoard).set({ state }).where(singleton)
      return state
    })
  },
}
