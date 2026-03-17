import process from 'node:process'
import { defineConfig } from '@playwright/test'

const port = 3333

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: `http://localhost:${port}`,
  },
  webServer: {
    command: `PORT=${port} pnpm --filter @kosarev/web-app dev`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
