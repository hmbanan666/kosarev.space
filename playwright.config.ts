import { defineConfig } from '@playwright/test'

const port = 3333

export default defineConfig({
  testDir: './e2e',
  testIgnore: 'agent-provider.test.ts',
  globalSetup: './e2e/publication-fixture.mjs',
  timeout: 30000,
  workers: 2,
  projects: [
    { name: 'visitors', grepInvert: /@board-write/ },
    { name: 'board', grep: /@board-write/, workers: 1, dependencies: ['visitors'] },
  ],
  // Nuxt dev can take more than five seconds to hydrate on a constrained runner.
  expect: { timeout: 10000 },
  use: {
    baseURL: `http://localhost:${port}`,
  },
  webServer: {
    command: `NUXT_CONTEXT_URL='' NUXT_CONTEXT_TOKEN='' NUXT_GITHUB_ACTIVITY_DISABLED=true PORT=${port} pnpm --filter @kosarev/web-app dev`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 120000,
  },
})
