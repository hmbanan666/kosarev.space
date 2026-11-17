# Site agent

The shared header opens a persistent RU/EN agent drawer. `/` and Cmd/Ctrl+K open
it (the slash shortcut ignores editable controls); Escape closes it and restores
focus after the closing animation. The agent and card details use the same
[native drawer](../apps/web-app/app/components/site/Drawer.vue), with keyboard
focus containment, a faded and blurred backdrop, and a 240ms slide from the
right. Desktop width is at most 560px; mobile uses an 88dvh sheet. Reduced motion
disables the slide. A timed close keeps dismissal working without discrete CSS
transition support.
Suggested questions follow the current project page. Print output hides the
control.

## Runtime configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `NUXT_OPENROUTER_API_KEY` | empty | Server-only provider credential; empty returns HTTP 503 with `code: offline` |
| `NUXT_AGENT_MODEL` | `google/gemini-2.5-flash-lite` | Model identifier sent to the provider |
| `NUXT_AGENT_FALLBACK_MODEL` | `nvidia/nemotron-3.5-lightning:free` | Second model for the one automatic retry after a provider failure |
| `NUXT_AGENT_TRUST_PROXY` | `false` | Use `X-Forwarded-For` for rate-limit identity only behind a trusted proxy that overwrites the header |

No key is required to build or browse the site. Configure credentials at
runtime; they are never exposed in public runtime config. The route uses fetch
with the [OpenRouter streaming chat-completions
API](https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request).
The fallback default was checked against the [public model listing](https://openrouter.ai/nvidia/nemotron-3.5-lightning:free)
on 16 November 2026; it lists a free text endpoint. Model availability can
change, so operators can override the fallback independently of the primary.
Provider responses and billing were not tested with a live key.

## Public knowledge

[The build generator](../apps/web-app/build/agent-knowledge.ts) runs during Nuxt
preparation/development and before Nitro builds. It writes
`.nuxt/agent-knowledge/pack.json`, which Nitro bundles as a server asset. It
reads an explicit allowlist, not a repository crawl:

- RU/EN approved project copy, including every long-form product section,
  external product destinations and archive status;
- CV copy, role dates, plus compact career and skills excerpts linked to `/cv`
  and `/cv#cv-skills` (localized under `/en`);
- tracked public engineering cases;
- public `pro.json`, introduction and contact details.

Long documents use 1,000-character chunks with 150-character overlap. No private
notes, environment files, Context service or MCP tools participate in this
build-time pack. Request-time memory is separate (see below).

Publications are database-backed and intentionally change independently of a
site build. [Request-time evidence](../apps/web-app/server/agent/evidence.ts)
adds only the selected **published** revisions through the existing public
repository methods. It never reads drafts.

A compact `Profile · Стек` block is also rebuilt for every request directly from
[`cvSkillGroups`](../apps/web-app/app/utils/cv.ts), independently of the packed
asset. It contains only the CV's web, systems and integrations groups, plus
localized CV and Markdown contact links. It includes no employer, role-at-company
or private-project copy and links its source to `/cv#cv-skills` (under `/en` for
English).

A compact `Now · Сейчас` block is rebuilt for every request from the active
project catalog, the latest published summary, and the existing
`github-public-v1` Nitro cache used by `/api/activity`. It does not trigger
another GitHub fetch. Activity snapshots older than 24 hours or dated in the
future are omitted. Future-dated observations and commits older than 30 days
are excluded too.
At most three commits, newest first, carry only an allowlisted public repository
name, timestamp and localized readable date. Pull requests and releases are
excluded so they cannot be described as commits. The block never includes commit
subjects or private repository names. The block labels its snapshot
and incomplete public coverage. A cold cache supplies no activity claims, while
the public project catalog still supplies current work. Publication failure
omits publication evidence and the prompt requires honest unknowns. Current-work
answers must name the active products, include one or two latest public commits
as repository plus readable time when available, mention the latest publication
when present and offer the localized contact link. Empty or stale activity must
not produce invented commits.

Retrieval ignores common RU/EN question words and ranks keyword matches with
inverse document frequency, title weighting and a current-page boost. It
searches the UI locale, includes recent user questions for follow-ups and
selects whole chunks within a conservative 6,000 UTF-8-byte evidence budget (an
upper bound on ordinary tokenizer token count). Profile and Now get reserved
space before ranked excerpts for every on-topic
question, including tools absent from the public stack. Skill questions may also
reserve packed skills and CV excerpts. Scope checks still require lexical or
topic evidence; the always-on blocks do not bypass the pre-filter. The prompt
requires product-level answers, the user's language, linked evidence, honest
unknowns, contact for hiring questions and brief refusal of unrelated tasks.
Unknown-tool answers must say the tool is not listed, describe the documented
core stack from Profile, and offer a localized Markdown contact link. They must
not invent experience or use a vague confirmation disclaimer. With Profile present they
must not claim there are no stack details; without it they must acknowledge the
gap. Sources list the site pages supplied to the model; this is provenance of retrieved evidence, not a guarantee
that every supplied page was cited in the answer.

## Memory (Context)

The agent can read a separate Context instance as memory. It holds owner
explanations, preferences, reasons for decisions and lessons from chat reviews
that are **not on site pages**. It is not a mirror of the CV, cases, projects or
articles. Those remain in the site, with the existing local knowledge pack and
request-time public evidence as their sources. Never import site page content
into memory.

All settings below are server-only entries in Nuxt `runtimeConfig`, outside
`public`. The owner reports that the URL and token environment variables are
already configured in production; that configuration was not inspected here.

| Config key | Environment variable | Default |
| --- | --- | --- |
| `contextUrl` | `NUXT_CONTEXT_URL` | empty |
| `contextToken` | `NUXT_CONTEXT_TOKEN` | empty |
| `contextScope` | `NUXT_CONTEXT_SCOPE` | `site` |
| `contextProject` | `NUXT_CONTEXT_PROJECT` | `kosarev-space` |
| `contextTimeoutMs` | `NUXT_CONTEXT_TIMEOUT_MS` | `1500` |

An empty URL or token disables memory without a network request or error.
[The memory adapter](../apps/web-app/server/agent/memory.ts) uses the pinned
official `@modelcontextprotocol/sdk` client and Streamable HTTP transport for
JSON or SSE responses. The token is sent only in `Authorization: Bearer …`;
message requests reject redirects. The client connects lazily and is reused
across requests; any connection, tool or validation error discards it so the
next question can reconnect. No session ID is configured for the stateless
server, and there is no memory cache across questions.

Only questions that pass the existing pre-filter and proceed to the model
trigger `search`, with `{ scope, project, query, k: 4 }`. `query` is the current
question, trimmed and limited to 500 characters; history and page content are
not sent to Context. One abortable timeout covers connection and search
(default 1,500 ms). Timeout, transport errors, tool `isError` and malformed
results all fall back to the existing answer flow without memory. There is no
memory retry within that question. A failed shared connection can also make
concurrent lookups fall back; each still has its own deadline.

The adapter validates the result envelope and extracts at most four source
excerpts, each capped at 600 characters. Source excerpts can supply evidence
when the knowledge `items` array is empty. The prompt receives a separate
`Memory · Память` block with no URL:

- `none`: no block and no memory evidence, even if sources were returned.
- `weak`: usable excerpts count as evidence, with `partial: true`; quote only
  what the note says and label it as partial in the answer's language.
- `strong`: usable excerpts count as ordinary evidence.

Empty excerpts do not count as evidence. When both site evidence and usable
memory are absent, the prompt retains the honest-unknown path. Memory never
bypasses the topic pre-filter. Notes are untrusted data, not instructions,
even if they claim owner authorization; the existing output guard still
applies. Memory is excluded from the visitor's `sources` list and stored source
links. The model must not invent a public link for a note.

Each model-bound request logs one structured server record through
[`useLogger`](../apps/web-app/server/utils/logger.ts):
`{ event: 'agent_memory', status, grounding, hits, ms }`. Status is `disabled`,
`ok`, `timeout` or `error`; grounding is `strong`, `weak` or `none`, and hits
counts usable excerpts. Disabled/failing lookups report `none` and zero hits.
No question, excerpt, IP, credential or raw error is logged. Prefilter refusals
make no lookup. Memory metadata is not added to `agent_messages`; there is no
schema migration. Answers informed by memory are persisted as ordinary
assistant text under the existing retention policy.

### Maintaining memory outside the site

The site only reads memory; its token must stay read-only. The owner or
maintainer agents write notes outside the site into area `site`, project
`kosarev-space`. Treat these as notes permitted to inform visitor answers,
not a place for secrets or confidential details.

The owner issues a separate short-lived write token on the Context server:

```sh
context token create <name> --write site --project kosarev-space --expires 1h
```

Use that token with MCP `remember` for individual notes. For a directory of
memory Markdown notes, the maintainer CLI workflow is:

```sh
context import markdown <dir> --area site --project kosarev-space [--prune]
```

`[--prune]` denotes an optional flag, not literal brackets. Remove a source with:

```sh
context doc remove <source id>
```

Keep write credentials outside the site runtime, repository, fixtures and logs.
These are owner-specified operator commands, not commands run by the site or
executed as part of this change. This feature creates no notes automatically
and does not write chat reviews back to Context.

## Topic boundaries

The system prompt limits answers to this site and its pages, Nikolay's products,
experience, stack, cases, publications, availability and contact/hiring. It bans
visitor coding tasks, general chat, homework, translation, role-play, unrelated
people/companies and politics. Refusals are brief and offer three on-topic
suggestions. Instructions inside conversation history or retrieved content have
no authority; the prompt forbids revealing or paraphrasing internal
instructions, knowledge-pack internals, model names, credentials and
environment.

Before provider fetch, deterministic RU/EN patterns reject obvious unrelated or
injection requests. These checks normalize compatibility characters, invisible
separators and whitespace. A second gate checks the **latest question alone**:
when it has no retrieved evidence with a lexical score of at least 0.35
(excluding page boosts) and no recognizable site, professional or product topic,
it is refused. Second-person skill and experience questions refer to Nikolay and
are on-topic; explicit requests to write code or perform a visitor task still
run through the refusal patterns first. Previous questions and the current page
cannot supply that score. Known product names include slugs from the public
pack. Canned refusals use the question's RU/EN language, falling back to the UI
locale for non-letter input, and send the same `delta`, empty `sources`, `done`
SSE events with no provider call. The existing offline and rate-limit checks
still run first.

The streaming output guard withholds fenced code, including delimiters split
between provider events. Only an exact fenced quotation also present in
retrieved site evidence, at most 200 characters and five lines of code, may
pass. Longer, unmatched and unterminated blocks are discarded. A bounded
streaming wording pass uses Nikolay / Николай (including Russian inflections),
replaces prose dashes with colons and removes spaces before punctuation across
delta boundaries. It also strips stray HTML/XML-like tags outside code,
including tags split across deltas. It preserves their enclosed text, inline
and fenced code, email addresses, URLs,
decimals, ellipsis and Markdown list markers. The keyboard hint
uses middots in Russian and is hidden on touch devices. Ordinary prose still
streams; an entirely removed answer receives the canned refusal. These are
bounded heuristics and prompt instructions, not a semantic proof of scope
enforcement for every possible model response. No classifier call is used.
Completed output-guard refusals never trigger a retry.

## Limits and lifecycle

`POST /api/agent` accepts an envelope of up to 12 user/assistant messages,
ending in a user question, then retains only the last seven messages (three
previous exchanges plus the current question for alternating history). User
messages have a 600-character limit. Incoming assistant history is bounded to
8,000 characters per message and truncated to 600 before use; total incoming
history is capped at 16,000 and the actual request body at 64 KiB. System-role
messages and invalid payloads are rejected. The input and localized errors use
the same 600-character question limit. The client sends at most six previous
messages and drops failed/interrupted turns from model history. The composer
remains enabled during streaming. Sending again immediately adds a localized
pending user turn; the client drains these turns sequentially, using each
question's original page and locale and only the completed preceding history.
Stop aborts the current answer and continues the queue. Clear cancels the
current answer and removes the queue. Each question still produces one API
request. Terminal `done` and `error` events end client reading immediately,
without waiting for the transport to close. EOF, abort and clear also release
the busy state. Sending positions the new question at the top of the message
viewport; answers grow below it. Manual scrolling releases that anchor. The
shared drawer follows visual-viewport changes so the composer stays above an
on-screen keyboard.

The process-local limiter permits 20 attempts per IP per hour. Invalid attempts
also count when the provider is configured. Counters expire after an hour, use a
process-random HMAC of the IP, and are capped at 10,000 identities. Conversation
text is stored only in the database described below, never in application logs.
There are no raw-IP or provider-error logs in this feature. Restarts reset the
counters; multiple replicas have independent limits. Behind a proxy, configure
trusted IP handling explicitly or visitors will share the proxy's counter.

The provider request always uses `max_tokens: 2000` and `reasoning: { effort:
'low', exclude: true }`, including when the configured model is
`openrouter/free`. Only content deltas are forwarded. The output guard caps
visible answers at 4,000 characters and consumes at most 8,000 content
characters; reaching either limit ends the answer successfully and cancels
upstream reading. There is one 45-second server budget for both attempts. A
transport error,
provider HTTP error (including provider 429), missing body, malformed/incomplete
stream, or completed stream with no non-whitespace content triggers one retry
using `NUXT_AGENT_FALLBACK_MODEL`. A stalled primary is aborted after 22.5 seconds;
the fallback gets only the remaining total time. Equal model identifiers still
produce one retry. Site rate limits, pre-filter refusals, completed output-guard
filtering and visitor cancellation do not retry. Both attempts use the same
reasoning and token settings and a fresh output/wording guard. A partial first
answer is cleared with an SSE `reset` event before replacement deltas arrive,
so it is not mixed into the fallback answer, stored answer or follow-up history.
Two provider failures produce one sanitized `error` event with `code: error`;
timeouts retain the `provider_error` persistence reason. Disconnecting or pressing
Stop cancels the upstream request; closing the drawer keeps the ongoing answer.
Responses stream SSE `delta`, `reset`, `sources`, `done` or sanitized `error` events.
HTTP 429 includes `Retry-After`. Partial or malformed streams that also fail on
retry display an error rather than a false success. Markdown disables HTML and images and rejects
unsafe link schemes. The drawer, input, form and generated links use the
existing analytics service's [privacy exclusion
classes](https://www.yandex.com/support/metrica/en/code/html-markup) to exclude
conversation text, field contents, form submission and generated outbound-link
tracking from session replay and form analytics. These integration attributes
are checked in the browser tests; live analytics delivery was not inspected.

The drawer's local history uses this tab's `sessionStorage`: up to 24 recent
messages before the queue plus all pending turns while work remains. It persists
across site navigation and reload and can be cleared in the drawer. Clearing the
drawer does not delete server rows or rotate the anonymous session identifier.
An interrupted answer restores as stopped; pending questions resume sequentially
after reload. Storage failure leaves the current in-memory conversation usable.
On Send, bounded conversation history, selected public site excerpts and any
usable memory notes are sent to the configured provider. The current question
is also sent to Context when memory is enabled and the pre-filter passes.
Nothing is sent merely by opening the drawer.

## Message persistence and privacy

The client stores a random UUID in `localStorage` under `site-agent-session-v1`
and sends it as `sessionId` with each `/api/agent` request. It persists across
tabs, reloads and drawer clearing, and rotates when local storage is cleared.
When storage is unavailable, the current drawer keeps an in-memory UUID. Older
API clients that omit the field receive a new server UUID per request; malformed
identifiers are rejected.

[Migration 0003](../packages/database/migrations/0003_agent_messages.sql) adds
`agent_messages` in the existing site PostgreSQL database. The server saves the
latest user turn and the delivered assistant text together, with page, locale,
model used for the delivered attempt (including fallback), filter flag/reason, sources and elapsed milliseconds. It does
not duplicate incoming conversation history. Refusals are retained, including
output-guard filtering; provider failures/interruption retain partial output
with a reason. `created_at` is generated by PostgreSQL. IP addresses and
User-Agent are not stored. Offline, rate-limited and invalid envelopes rejected
before conversation processing do not create rows.

Writes run in background request work and never delay SSE completion. A failed
write is swallowed without logging content or credentials; it can lose those
rows, but cannot fail the answer. There is no retention job or admin UI: rows
are kept indefinitely. Server retention is independent of the drawer's local
history controls. The composer has no storage footer.

### Later operator query on de2 (documentation only)

The owner reports that the site database runs in a PostgreSQL container on de2.
Its current container name is not tracked or verified here. An authorized
operator should select the existing PostgreSQL container backing the site's
`NUXT_DATABASE_URL` in the deployment configuration, not the web app container
or `pg-test`. Do not print the connection URL or inspect/dump container secrets.
The commands below use the selected container's existing `POSTGRES_USER` and
`POSTGRES_DB`; no credentials are embedded. They were not run during
development.

Run in the operator's terminal already on de2 with Docker access. First list
names/images and enter the confirmed site database container name. An empty
session filter lists the latest 100 rows since yesterday at midnight; paste a
`session_id` to inspect that conversation within the same time window. Change
`since` to an ISO timestamp or another PostgreSQL timestamp expression if
needed.

```bash
docker ps --format '{{.Names}}  {{.Image}}'
read -r -p 'Existing site PostgreSQL container name: ' site_pg_container
read -r -p 'Session UUID (blank for all recent sessions): ' site_agent_session
docker exec -i "$site_pg_container" sh -c '
  exec psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" "$@"
' sh --set=since='yesterday' --set=session_id="$site_agent_session" <<'SQL'
SELECT id, created_at, session_id, role, content, page, locale, model,
       filtered, filtered_reason, sources, latency_ms
FROM agent_messages
WHERE created_at >= :'since'::timestamptz
  AND (:'session_id' = '' OR session_id = :'session_id')
ORDER BY created_at DESC, id DESC
LIMIT 100;
SQL
```

This is a manual inspection query, not a deployment verification script. Keep
its message output in the authorized operator session.

## Verification

Run the repository's `pnpm run check:full` with the explicit local test database
variables described in the README. Additional provider-boundary integration:

```sh
pnpm exec playwright test --config playwright.agent.config.ts
AGENT_SCREENSHOTS=1 pnpm exec playwright test e2e/site-agent.test.ts
```

The dedicated configuration loads `e2e/fixtures/agent-provider.mjs` into the
local test server through `NODE_OPTIONS`. It intercepts provider fetches and
supplies synthetic delayed SSE; there is no production mock flag or configurable
upstream URL. It verifies actual endpoint streaming, packed evidence, Stop,
validation, stop-then-continue queue behavior, provider failure, rate limits and
resistance to spoofed forwarding headers. The ordinary browser suite exercises
the real offline endpoint without a key and uses intercepted SSE for
deterministic UI captures. Both configurations start isolated test servers,
disable GitHub activity fetching and explicitly clear `NUXT_CONTEXT_URL` and
`NUXT_CONTEXT_TOKEN`, so E2E never contacts Context. Unit tests mock the MCP
client/transport and exercise disabled config, grounding, bounded excerpts,
timeouts, errors, connection reuse and sanitized logging. Additional transport
tests use the real SDK with synthetic fetch responses for JSON and SSE, without
network access. Fragmented tags are covered by unit tests and the dedicated
provider fixture; streamed and persisted answers must match.
Unit tests exercise the API handler with the real public knowledge pack and a
local provider stub: RU/EN attack/off-topic prompts must make no provider call,
and legitimate skill, current-work and product questions must reach it.
Additional cases cover unrelated follow-ups, retrieval thresholds, reasoning
settings, output caps, fragmented fences, exact short quotations, history limits
and prompt boundaries. Existing retrieval, full project coverage and fragmented
UTF-8 SSE tests remain.

[RU/EN desktop and mobile screenshots](images/site-agent/) are local review
captures with synthetic answers, not live provider or deployment evidence. The
Dockerfile already copies `patches`, packages and the complete web app before
install/build; generated knowledge ships inside `.output`. No Docker execution,
merge or deployment is part of this task.