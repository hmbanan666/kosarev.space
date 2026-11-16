import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '~~': fileURLToPath(new URL('./apps/web-app', import.meta.url)) } },
  test: {
    include: ['apps/**/tests/**/*.test.ts'],
  },
})
