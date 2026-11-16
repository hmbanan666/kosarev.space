# Portfolio direction

The site presents Nikolai Kosarev as an AI Product Engineer / Fullstack Engineer
who has built products, backend systems and infrastructure since 2010. It
supports both hiring and product or contract discussions. This brief replaces
the earlier direction that explicitly deprioritized employment.

## Audiences and tasks

- Recruiters and hiring teams need the role, recent experience, a readable CV,
  downloadable PDFs and direct contact without a mandatory persona selector.
- Technical leaders need concrete responsibilities, implementation decisions,
  case studies and enough technical context to assess relevant experience.
- Founders need to understand product delivery and ownership, explore relevant
  prior work and start a conversation without a sales funnel or pricing claims.

## Implemented structure

- A server-rendered home with role, location, CV, PDF, work and email links.
  Desktop and tablet enhance the blocks into a bounded 17 by 11 cell canvas.
  The home contains only this canvas; `/projects`, `/cases` and `/contact`
  provide the catalogs and contact page, alongside `/writing` and `/cv`.
  The header uses real localized routes and marks their active route.
  Below 768px and without JavaScript, the same HTML uses a priority-ordered list.
  The home links to the CV for the full career history.
- A case finder with shareable URL filters, search, a visible path to all cases,
  and technical context available through native disclosure controls.
- Case pages with challenge/result summaries, expandable implementation details,
  context-preserving navigation and direct contact through the shared footer.
- A project section with Context, K39 and Woodlands in active development.
  Dostigus is listed separately as paused experience, above the retained
  historical list. Context, K39 and Dostigus each have a bilingual project
  page. Context and Dostigus link to their public repositories and do not use
  interface captures. K39 and Woodlands keep public destination links,
  bilingual implementation summaries and actual interface captures. The K39
  page keeps that short summary, adds the long-form sections, and links to
  https://k39.online.
  Project pages render optional long-form sections when text is present:
  problem, what was built, key decisions, stack, status and next, and links.
  Context, Dostigus and K39 fill those sections in Russian and English.
  Source lists stay off the pages.
  Woodlands uses a labelled demo capture; its private repository is not linked.
- A project archive retaining real visuals and source links. Startodel, Meloteka
  and ChatGame closed in 2026; individual closure months are not established.
  NextOrders has not been declared closed.
- One chronological Writing feed for notes, digests and articles, with type
  metadata independent of length. K39 is its first real bilingual publication;
  no placeholder materials are displayed. Publications may link to separate
  projects and cases. Reading uses the existing dark typography and layout,
  with live cursors unmounted. Code and local test evidence is dated and separate
  from production claims; digests require primary sources and author commentary.
- Email and Telegram are directly visible. Email copying confirms success or
  offers manual selection if clipboard access fails. No contact backend exists.
- The native `nuxt-live-cursors` component starts automatically on fine-pointer
  portfolio and case pages. Its familiar bottom pill opens the native profile,
  with shuffle, hide/show and the source-case link supplied through the public
  actions slot. Hide/show changes cursor visibility while keeping the connection
  active; the module retains that visibility choice during the app session.
  There is no custom header switch, pointer renderer or connection counter.
  The home uses an optional coordinate target through a pinned package patch:
  peers share normalized canvas coordinates across viewport aspect ratios,
  pan, zoom and locales while retaining
  the native face renderer. The `#coordinates-v2` room suffix separates this protocol from older open
  tabs; Y uses 10,000 integer units to preserve precision in the native transport.
  Other pages retain page coordinates.
  Coarse pointers, reduced motion and CV/print keep the component unmounted.
  The home docks the native pill in the middle of its canvas control bar.
  Other pages keep the fixed pill, respect safe areas and reserve footer space.


## Visual principles

The website uses a dark-only black and restrained amber system: Carbon
`#080808`, Surface `#151515`, Border `#353535`, Paper `#F3F1EB`, Muted
`#AAA8A2` and Amber `#D9AD67`. Saved light-mode preferences do not change the
website. Print pages remain white.

The original color portrait and deliberate typography carry the introduction;
do not desaturate the portrait or replace it with a decorative diagram. A fine
amber corner frame gives the introduction depth, while real project screenshots
retain their original colors on project pages. Short action/reading responses
support the same visual language without entrance animations across every section. Noto
Sans serves interface and body text, while Lora distinguishes the name, with
Cyrillic and Latin coverage. Align content to shared left edges, keep body
lines below 80 characters and resolve control heights, labels and spacing as
one system. The case finder enhances native GET controls with accessible
select menus; native controls remain available without JavaScript.

### Restrained engineering details

Keep surfaces angular, with zero or near-zero radii across controls, images,
frames and reading pages. The live-cursor faces and native profile pill retain
their familiar shapes. Noto Sans and Lora remain the primary typography;
`--font-mono` uses the system monospace stack for short technical labels only.
Body copy remains proportional and readable.

The shared tokens and components are defined in
[`blueprint.css`](../apps/web-app/app/assets/css/blueprint.css) and
[`components/blueprint`](../apps/web-app/app/components/blueprint/).
The canvas starts with a 96px logical cell and 16px gap; cells expand to
use the viewport before the board is uniformly scaled. Its blueprint grid is barely visible.
Frames may carry a part number or gold corner marks, but neither is required
on every block. Zone labels, dimension lines, crosshairs, rulers, title blocks
and hatching are available as small reusable marks. Keep them at edges and in
empty gaps, with one or two details per zone. Decorative marks are hidden from
assistive technology. Never turn project cards into densely annotated diagrams.

### Spacing and canvas geometry

| Token | Value | Use |
| --- | --- | --- |
| `--site-gutter` | `clamp(20px, 3.125vw, 48px)` | Equal page side gutters |
| `--site-max-width` | `1664px` | Inner-page header, catalog and footer container; fullscreen home is uncapped |
| `--grid-cell` | `96px` | Minimum logical cell pitch before viewport fitting |
| `--grid-gap` | `16px` | All block gaps and frame padding |
| `--block-inset` | `24px` | Card padding and bottom link inset |
| `--grip-inset` | `8px` | Every drag handle's top/right inset |
| `--control-height` | `44px` | Native online pill and shared controls |

Page tokens live in [`portfolio.css`](../apps/web-app/app/assets/css/portfolio.css).
Canvas coordinate values come from
[`home-canvas.ts`](../apps/web-app/app/utils/home-canvas.ts); the home supplies
its gap to CSS as well. Insets are measured inside the 1px card border.
Canvas dimensions are `columns × cell − gap` and `rows × cell − gap`, so
there is no trailing empty strip. The 17 by 11 graph-paper board leaves empty
cells between clusters. It is not a packed rectangle. The role and original
portrait remain prominent at centre-left; contact is a small edge card.
Four quiet crosshairs and coordinate marks frame the board.

The project layout is deterministic. For each project, the score is the sum of
`max(0, 30 − floor(days since latest observed commit/PR))`, the number of observed
commits/PRs in 30 days, and the number in 14 days. Releases do not affect rank;
future dates are excluded. Equal scores use project-key order. The highest
rank occupies the central 6 by 3 slot; remaining projects use 4 by 3 edge slots.
The same rank orders the mobile list. The algorithm is in
[`home-canvas.ts`](../apps/web-app/app/utils/home-canvas.ts), with scoring in
[`activity.ts`](../apps/web-app/shared/activity.ts).

On desktop the sticky header and one bottom strip surround an edge-to-edge
viewport. The enhanced home is exactly `100dvh` tall with no document scroll.
The board's four outer gutters use `--site-gutter`; the world aligns with the
header. Logical cells expand to match the available aspect ratio; uniform
scaling preserves geometry. A text scale floor improves readability at fitted
zoom. Saved positions and sizes survive activity updates and viewport changes.

Initial load, fitted resize, reset and recenter fit both dimensions. The fitted
scale is capped at 100%; zoom ranges from the smaller of fitted scale and 80%
up to 125%. Pan by dragging empty space, scrolling or focusing the viewport
and pressing arrow keys after zooming. Native scroll bounds prevent getting
lost; the document does not scroll through the canvas. The zoom percentage
button fits and recenters the board. Tab focus reveals off-screen blocks.

The bottom strip is one 58px row: a compact zoom control and reset icon on
the left, the native online/profile pill in the centre, and copyright plus
Contact, Telegram and GitHub on the right. Reset has an accessible label and
tooltip. There is no layout block, undo button, separate recenter label or
minimap. One presence instance moves between the dock and page shell,
preserving its connection across route changes. Inner pages retain the contact
footer. Below 768px, blocks form a vertical list with the normal footer and no
canvas controls. This readable fallback also works without JavaScript.

Every card opens a detail panel from its surface or its keyboard action.
Inner links keep their destinations; movement beyond six pixels suppresses a
surface click. `?card=context` (and other card IDs) is shareable and participates
in browser history. A native modal dialog supplies focus containment and Escape;
outside clicks close it, and closing restores the card action's focus. Desktop
uses a right sheet; mobile uses a bottom sheet. Project details include status,
approved pitch, 30-day graph, observed commits/PRs, language bytes and available
links. Repository/source information appears only after runtime public checks.

### Link icons

Text-link arrows use [`SiteLinkIcon`](../apps/web-app/app/components/site/LinkIcon.vue):
Lucide `arrow-right` for internal destinations and `arrow-up-right` for external
ones (including email). Both are 14px, vertically centered, separated from the
label by 8px, and gold on hover or keyboard focus. Direction icons follow the
label, including back links. Header navigation and plain prose links may omit
an arrow; never use text arrow glyphs. Action controls retain their semantic
icons, such as copy, download and grip. Mobile keeps the same rule; on the
zoomable board icons scale with its text.

Home project cards show a small 30-day activity graph and localized last-commit
time when public data is available. Project-page images remain unchanged.
Blocks lift by 2px on hover with a gold border and ease into snapped positions
over 240ms; reduced motion disables both.

Browser regressions cover RU/EN at 1024, 1280, 1440, 1920 and 390px, shared
edges, equal world margins, non-overlap, readable content, the one-row strip,
native faces, overflow and hydration. Activity tests use a recorded public
snapshot and check panel history, focus, dismissal and drag separation. Unit
tests cover ranking, empty cells, public filtering and cache behavior. Review
captures live in [`images/activity-canvas`](images/activity-canvas); historical
fullscreen and precision captures remain unchanged. With the local test database
configured, refresh the activity captures using
`CANVAS_SCREENSHOTS=after pnpm exec playwright test e2e/activity-canvas.test.ts`.
They are local review evidence, not production captures.

Move blocks with the grip or its arrow keys. Positions snap to cells and
colliding neighbours move to nearby free positions. If no placement is possible,
the move is rejected. Escape cancels a drag. Versioned localStorage keeps only
this device's layout, including card sizes; invalid or inaccessible data falls
back to current activity defaults. Reset returns to those defaults. Layouts are
never sent to the server. The common presence coordinate system describes
positions, not a shared arrangement of blocks.

### Public activity

[`GET /api/activity`](../apps/web-app/server/api/activity.get.ts) returns a
server snapshot immediately from Nitro storage or an empty fallback, while
refreshing in the background. Snapshots are fresh for 30 minutes, stale for at
most a day, and refresh failures retry no faster than once a minute. The browser
refreshes after hydration, after ten seconds and every minute. Language byte
responses have a separate 24-hour Nitro cache, used only after visibility checks.

The public GitHub owner listing and a per-repository visibility check gate all
returned repository data. Forks are excluded. The server-only
[project mapping](../apps/web-app/server/utils/activity-projects.ts) includes
Context, K39, Woodlands and kosarev.space as candidates, not a declaration that
all are public. Missing/private projects retain approved product copy without
repository data or a source link.

Without `NUXT_GITHUB_TOKEN`, REST supplies public owned repositories, languages,
up to 100 author-filtered default-branch commits and 100 PRs per selected repo,
and public release events. Languages cover up to 40 verified repositories;
recent commit/PR requests cover six (mapped projects first, then recently pushed
repos). The 90-day graph and totals are explicitly a public sample, not complete
GitHub statistics. Rate limits and truncation can make it incomplete. No
unobserved activity is invented. Skills combine returned language bytes with
technology tags already present in portfolio content.

The optional server-only token increases the API budget and enables a 365-day
public commit/PR calendar through GraphQL `contributionsCollection`. It uses
repository-level contributions checked against the public allowlist, never the
aggregate calendar or restricted contribution counts. Up to 40 repositories and
100 contribution nodes per connection are observed; labels still say public
sample. A GraphQL failure retains REST coverage. The token is never serialized
into a response. See [README](../README.md#public-github-activity) for configuration.

The project archive lives at `/projects`; the case finder at `/cases` retains
its `q`, `focus`, `tech` and `all` query filters, including native GET controls.
`/contact` reuses the existing contact text and email-copy/manual-selection UI.
All three routes have RU/EN metadata, canonicals and sitemap entries. The
portfolio ItemList lives on `/projects`; Person and WebSite stay on home.
Legacy home hashes redirect on the client, preserving locale and query:
`#projects` and `#project-*` to `/projects` (retaining project hashes), `#skills`
to `/cases`, `#experience` to `/cv#experience`, and `#contacts` to `/contact`.
A bare home URL carrying case filters also redirects to `/cases`. Mobile follows activity priority and has no canvas controls.
Inner pages keep their normal reading layout with angular surfaces, readable
line lengths and visible focus. Print CV styling remains separate: two A4
pages per language, selectable text and clickable contact/source links.

Avoid technology tag walls, vanity counters, repeated identical cards,
motion-dependent content and overlays that do not add useful detail. Do not invent live activity
or metrics. Respect reduced motion; no content depends on animation. The case
finder keeps native GET controls when JavaScript is unavailable.

## Accuracy and boundaries

The current-product images in `public/projects/` (under `apps/web-app`) are
interface captures approved by the owner on 28 October 2026. `k39.png` shows the public
visitor map with its place panel collapsed; the figure credits OpenStreetMap
contributors and Protomaps. `woodlands.png` shows the deployed app's ordinary
browser demo with demo fixtures outside Telegram. Its caption identifies
the demo deal; the destination link opens the Telegram bot.

Career chronology and approved CV copy are canonical for career claims.
Distinguish partial migrations from completed work and launch preparation from
public availability. Do not imply paying Matrix customers or compare a warm
repeat build with an unrelated ordinary build. Never publish private client
records, operational identifiers, private ADRs or source attachments.

There is no book route, account system, subscription product, contact-submission
service or pricing offer on this site. A manuscript in a separate private
repository is not a setup prerequisite. Publishing finished chapters can be
considered later with its own scope; no release date is established. Hosting
configuration and deployment triggers are external facts, described separately
in the [deployment guide](deploy.md).
