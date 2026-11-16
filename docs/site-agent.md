# Site agent

The shared header opens a persistent RU/EN agent drawer. `/` and Cmd/Ctrl+K
open it (the slash shortcut ignores editable controls); Escape closes it and restores focus. The
native modal dialog contains keyboard focus. Desktop retains the visible canvas
behind a 460px drawer; mobile uses a full-height bottom sheet. Suggested questions
follow the current project page. Print output hides the control.

## Runtime configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `NUXT_OPENROUTER_API_KEY` | empty | Server-only provider credential; empty returns HTTP 503 with `code: offline` |
| `NUXT_AGENT_MODEL` | `google/gemini-2.5-flash-lite` | Model identifier sent to the provider |
| `NUXT_AGENT_TRUST_PROXY` | `false` | Use `X-Forwarded-For` for rate-limit identity only behind a trusted proxy that overwrites the header |

No key is required to build or browse the site. Configure credentials at runtime;
they are never exposed in public runtime config. The route uses fetch with the
[OpenRouter streaming chat-completions API](https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request).
Provider availability and billing were not tested with a live key.

## Public knowledge

[The build generator](../apps/web-app/build/agent-knowledge.ts) runs during Nuxt
preparation/development and before Nitro builds. It writes `.nuxt/agent-knowledge/pack.json`,
which Nitro bundles as a server asset. It reads an explicit allowlist, not a
repository crawl:

- RU/EN approved project copy, including every long-form product section,
  external product destinations and archive status;
- CV copy, role dates and stack data;
- tracked public engineering cases;
- public `pro.json`, introduction and contact details.

Long documents use 1,000-character chunks with 150-character overlap. No private
notes, environment files, Context service or MCP tools participate.

Publications are database-backed and intentionally change independently of a
site build. [Request-time evidence](../apps/web-app/server/agent/evidence.ts)
adds only the selected **published** revisions through the existing public
repository methods. It never reads drafts. It also reads the existing
`github-public-v1` Nitro cache used by `/api/activity`, without refreshing it or
making GitHub requests. Activity older than 24 hours is omitted; its public-sample
coverage and snapshot date accompany the evidence. A cold cache supplies no
activity claims. Consequently the packaged base is reproducible at build time,
while publications and activity remain current public supplements. Database
publication failure omits those documents and the prompt requires honest unknowns.

Retrieval ranks keyword matches with inverse document frequency, title weighting
and a current-page boost. It searches the UI locale, includes recent user questions
for follow-ups and selects whole chunks within a conservative 6,000 UTF-8-byte
evidence budget (an upper bound on ordinary tokenizer token count). The prompt
requires product-level answers, the user's language, linked evidence, honest
unknowns, contact for hiring questions and brief refusal of unrelated tasks.
Sources list the site pages supplied to the model; this is provenance of retrieved
evidence, not a guarantee that every supplied page was cited in the answer.

## Limits and lifecycle

`POST /api/agent` accepts up to 12 user/assistant messages, ending in a user
question. User messages have a 2,000-character limit, assistant history 8,000,
total history 16,000, and the actual request body 64 KiB. System-role messages
and invalid payloads are rejected. The client sends at most eight previous
messages and drops failed/interrupted turns from model history.

The process-local limiter permits 20 attempts per IP per hour. Invalid attempts
also count when the provider is configured. Counters expire after an hour, use a
process-random HMAC of the IP, and are capped at 10,000 identities. There are no
conversation, raw-IP or provider-error logs in this feature. Restarts reset the
counters; multiple replicas have independent limits. Behind a proxy, configure
trusted IP handling explicitly or visitors will share the proxy's counter.

The provider output is capped at 1,000 tokens and 8,000 characters, with a 45-second
server timeout. Disconnecting or pressing Stop cancels the upstream request;
closing the drawer keeps the ongoing answer. Responses stream SSE `delta`,
`sources`, `done` or sanitized `error` events. HTTP 429 includes `Retry-After`.
Partial or malformed streams display an error rather than a false success.
Markdown disables HTML and images and rejects unsafe link schemes. The drawer,
input, form and generated links use the existing analytics service's
[privacy exclusion classes](https://www.yandex.com/support/metrica/en/code/html-markup)
to exclude conversation text, field contents, form submission and generated
outbound-link tracking from session replay and form analytics. These integration
attributes are checked in the browser tests; live analytics delivery was not
inspected.

History is stored only in this tab's `sessionStorage` (up to 24 messages), persists
across site navigation and reload, and can be cleared in the drawer. Storage
failure leaves the current in-memory conversation usable. On Send, bounded
conversation history and selected public site excerpts are sent to the configured
provider; nothing is sent merely by opening the drawer.

## Verification

Run the repository's `pnpm run check:full` with the explicit local test database
variables described in the README. Additional provider-boundary integration:

```sh
pnpm exec playwright test --config playwright.agent.config.ts
AGENT_SCREENSHOTS=1 pnpm exec playwright test e2e/site-agent.test.ts
```

The dedicated configuration loads `e2e/fixtures/agent-provider.mjs` into the local
test server through `NODE_OPTIONS`. It intercepts provider fetches and supplies
synthetic delayed SSE; there is no production mock flag or configurable upstream
URL. It verifies actual endpoint streaming, packed evidence, Stop, validation,
provider failure, rate limits and resistance to spoofed forwarding headers. The
ordinary browser suite exercises the real offline endpoint without a key and
uses intercepted SSE for deterministic UI captures. Both configurations disable
GitHub activity fetching. Unit tests cover retrieval, prompt boundaries, full
project coverage, request limits and fragmented UTF-8 SSE.

[RU/EN desktop and mobile screenshots](images/site-agent/) are local review
captures with synthetic answers, not live provider or deployment evidence.
The Dockerfile already copies `patches`, packages and the complete web app before
install/build; generated knowledge ships inside `.output`. No Docker execution,
merge or deployment is part of this task.
