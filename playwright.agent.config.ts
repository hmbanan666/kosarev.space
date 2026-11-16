import { fileURLToPath } from 'node:url'
import { defineConfig } from '@playwright/test'
import base from './playwright.config'

const preload = fileURLToPath(new URL('./e2e/fixtures/agent-provider.mjs', import.meta.url))
export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: 'agent-provider.test.ts',
  workers: 1,
  use: { baseURL: 'http://localhost:3334' },
  webServer: {
    command: 'pnpm --filter @kosarev/web-app dev',
    env: { PORT: '3334', NUXT_GITHUB_ACTIVITY_DISABLED: 'true', NUXT_OPENROUTER_API_KEY: 'test-fixture', NUXT_AGENT_MODEL: 'fixture-primary', NUXT_AGENT_FALLBACK_MODEL: 'fixture-fallback:free', NODE_OPTIONS: `--max-old-space-size=4096 --import=${preload}` },
    url: 'http://localhost:3334',
    reuseExistingServer: false,
    timeout: 120000,
  },
})
