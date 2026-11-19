import { test as base, expect } from '@playwright/test'
import { openTestDatabase } from './publication-fixture.mjs'

// Board writers run sequentially after the read-only suite against the guarded test DB.
export const test = base.extend({
  page: async ({ page }, use, info) => {
    if (info.tags.includes('@board-write')) {
      const db = await openTestDatabase()
      try {
        await db.query('DELETE FROM home_board')
      } finally {
        await db.end()
      }
    }
    await use(page)
  },
})
export { expect }
