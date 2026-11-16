# Site agent review captures

Local Chromium screenshots at 1280 × 900 and 390 × 900, in Russian and English.
`empty-*` shows the home suggestions; `answered-*` shows Markdown links and the
expanded source list. Answers are synthetic test fixtures. Activity is disabled,
so the underlying home honestly shows unavailable public data. These images do
not demonstrate a live provider or production deployment.

Regenerate with the explicit local test database configured:

```sh
AGENT_SCREENSHOTS=1 pnpm exec playwright test e2e/site-agent.test.ts
```
