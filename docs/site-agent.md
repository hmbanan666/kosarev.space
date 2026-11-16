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

Retrieval ignores common RU/EN question words and ranks keyword matches with inverse document frequency, title weighting
and a current-page boost. It searches the UI locale, includes recent user questions
for follow-ups and selects whole chunks within a conservative 6,000 UTF-8-byte
evidence budget (an upper bound on ordinary tokenizer token count). The prompt
requires product-level answers, the user's language, linked evidence, honest
unknowns, contact for hiring questions and brief refusal of unrelated tasks.
Sources list the site pages supplied to the model; this is provenance of retrieved
evidence, not a guarantee that every supplied page was cited in the answer.

## Topic boundaries

The system prompt limits answers to this site and its pages, Nick's products,
experience, stack, cases, publications, availability and contact/hiring. It bans
visitor coding tasks, general chat, homework, translation, role-play, unrelated
people/companies and politics. Refusals use one short sentence with three
on-topic suggestions. Instructions inside conversation history or retrieved
content have no authority; the prompt forbids revealing or paraphrasing internal
instructions, knowledge-pack internals, model names, credentials and environment.

Before provider fetch, deterministic RU/EN patterns reject obvious unrelated or
injection requests. These checks normalize compatibility characters, invisible
separators and whitespace. A second gate checks the **latest question alone**:
when it has no retrieved evidence with a lexical score of at least 0.35 (excluding
page boosts) and no recognizable site, professional or product topic, it is
refused. Previous questions and the current page cannot supply that score.
Known product names include slugs from the public pack. Canned refusals use the
question's RU/EN language, falling back to the UI locale for non-letter input,
and send the same `delta`, empty `sources`, `done` SSE events with no provider
call. The existing offline and rate-limit checks still run first.

The streaming output guard withholds fenced code, including delimiters split
between provider events. Only an exact fenced quotation also present in retrieved
site evidence, at most 200 characters and five lines of code, may pass. Longer,
unmatched and unterminated blocks are discarded. Ordinary prose still streams;
an entirely removed answer receives the canned refusal. These are bounded
heuristics and prompt instructions, not a semantic proof of scope enforcement
for every possible model response. No classifier or additional provider call is
used.

## Limits and lifecycle

`POST /api/agent` accepts an envelope of up to 12 user/assistant messages, ending
in a user question, then retains only the last seven messages (three previous
exchanges plus the current question for alternating history). User messages
have a 600-character limit. Incoming assistant history is bounded to 8,000
characters per message and truncated to 600 before use; total incoming history
is capped at 16,000 and the actual request body at 64 KiB. System-role messages
and invalid payloads are rejected. The input and localized errors use the same
600-character question limit. The client sends at most six previous
messages and drops failed/interrupted turns from model history. The composer
remains enabled during streaming. Sending again immediately adds a localized
pending user turn; the client drains these turns sequentially, using each
question's original page and locale and only the completed preceding history.
Stop aborts the current answer and continues the queue. Clear cancels the current
answer and removes the queue. Each question still produces one API request.

The process-local limiter permits 20 attempts per IP per hour. Invalid attempts
also count when the provider is configured. Counters expire after an hour, use a
process-random HMAC of the IP, and are capped at 10,000 identities. There are no
conversation, raw-IP or provider-error logs in this feature. Restarts reset the
counters; multiple replicas have independent limits. Behind a proxy, configure
trusted IP handling explicitly or visitors will share the proxy's counter.

The provider request always uses `max_tokens: 2000` and
`reasoning: { effort: 'low', exclude: true }`, including when the configured model
is `openrouter/free`. Only content deltas are forwarded. The output guard caps
visible answers at 4,000 characters and consumes at most 8,000 content characters;
reaching either limit ends the answer successfully and cancels upstream reading.
There is a 45-second server timeout. Disconnecting or pressing Stop cancels the upstream request;
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

History is stored only in this tab's `sessionStorage`: up to 24 recent
messages before the queue plus all pending turns while work remains. It persists across site
navigation and reload and can be cleared in the drawer. An interrupted answer
restores as stopped; pending questions resume sequentially after reload. Storage
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
stop-then-continue queue behavior, provider failure, rate limits and resistance to spoofed forwarding headers. The
ordinary browser suite exercises the real offline endpoint without a key and
uses intercepted SSE for deterministic UI captures. Both configurations disable
GitHub activity fetching. Unit tests exercise the API handler with the real public knowledge pack and a
local provider stub: 32 RU/EN attack/off-topic prompts must make no provider call,
and 17 legitimate questions must reach it. Additional cases cover unrelated
follow-ups, retrieval thresholds, reasoning settings, output caps, fragmented
fences, exact short quotations, history limits and prompt boundaries. Existing
retrieval, full project coverage and fragmented UTF-8 SSE tests remain.

[RU/EN desktop and mobile screenshots](images/site-agent/) are local review
captures with synthetic answers, not live provider or deployment evidence.
The Dockerfile already copies `patches`, packages and the complete web app before
install/build; generated knowledge ships inside `.output`. No Docker execution,
merge or deployment is part of this task.
