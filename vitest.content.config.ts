import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['packages/database/tests/**/*.test.mjs'],
  },
})
