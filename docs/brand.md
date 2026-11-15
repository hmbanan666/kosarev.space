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
  Desktop and tablet enhance the blocks into a bounded 17 by 9 cell canvas.
  Below 768px and without JavaScript, the same HTML uses a grouped list.
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
  peers share canvas coordinates across pan, zoom and locales while retaining
  the native face renderer. Other pages retain page coordinates.
  Coarse pointers, reduced motion and CV/print keep the component unmounted.
  The home mounts the native pill in the middle of its canvas control bar.
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
The canvas uses a 96px cell and 16px gap. Its blueprint grid is barely visible.
Frames may carry a part number or gold corner marks, but neither is required
on every block. Zone labels, dimension lines, crosshairs, rulers, title blocks
and hatching are available as small reusable marks. Keep them at edges and in
empty gaps, with one or two details per zone. Decorative marks are hidden from
assistive technology. Never turn project cards into densely annotated diagrams.

### Spacing and canvas geometry

| Token | Value | Use |
| --- | --- | --- |
| `--site-gutter` | `clamp(20px, 3.125vw, 48px)` | Equal page side gutters |
| `--site-max-width` | `1664px` | Shared header, canvas, catalog and footer container |
| `--grid-cell` | `96px` | Canvas coordinate pitch |
| `--grid-gap` | `16px` | All block gaps and frame padding |
| `--block-inset` | `24px` | Card padding and bottom link inset |
| `--grip-inset` | `8px` | Every drag handle's top/right inset |
| `--control-height` | `44px` | Minimap, buttons and native online pill |

Page tokens live in [`portfolio.css`](../apps/web-app/app/assets/css/portfolio.css).
Canvas coordinate values come from
[`home-canvas.ts`](../apps/web-app/app/utils/home-canvas.ts); the home supplies
its gap to CSS as well. Insets are measured inside the 1px card border.
Canvas dimensions are `columns × cell − gap` and `rows × cell − gap`, so
there is no trailing empty strip. Default cells fill one 17 by 9 rectangle.
The extra row gives Contacts the same label, title and bottom action spacing
as the other cards. The introduction retains its portrait and name composition.
Status labels share a baseline within each row, and all links end at the same
bottom inset. Part numbers stay inside the upper corner, away from the grips.
Four crosshairs sit symmetrically on the board corners; internal gaps contain
no divider fragments or plates.

Initial load, resize while fitted, reset and recenter fit the whole board,
with equal frame margins. The fitted scale is capped at 100%; zoom ranges from
the smaller of the fitted scale and 80% up to 125%. Coordinate-space gaps,
text and insets scale together. At narrower desktop widths the default is a
board overview; zoom enlarges the content for reading. Pan by dragging empty
space, scrolling or focusing the viewport and pressing arrow keys after
zooming. Native scroll bounds prevent getting lost. The minimap navigates the
zoomed board; its keyboard action fits and recenters. Tab focus reveals
off-screen blocks. The canvas grows with its fitted contents rather than
clipping the last row to a fixed viewport height.

The control bar uses equal left/right grid tracks around a centered native
online pill, including the original face renderer and profile actions. The
footer is in normal document flow below the catalog disclosure, with a quiet
contact label, existing contact copy, direct links and a mono copyright row.
Inner pages share this footer and horizontal container while retaining their
reading line-length limits. Mobile uses 20px side gutters and consistent mono
section labels; the grouped list and footer remain accessible without scripts.

The home K39 preview crops the existing capture to the map area and applies
the dark gold CSS duotone. Small linked attribution remains visible; no image
bytes are added and the project page keeps the original. Blocks lift by 2px
on hover and ease into snapped positions over 240ms; reduced motion disables
both. Colors remain unchanged.

Browser geometry regressions in
[`canvas-precision.test.ts`](../e2e/canvas-precision.test.ts) cover 1024, 1280,
1440, 1920 and 390px in RU/EN. They check shared edges, equal frame margins,
gaps, padding, link insets, centered controls, native faces, overflow and
hydration. The unit packing check ensures every default cell is occupied
exactly once. Review captures are in [`images/canvas-precision`](images/canvas-precision).
With the test database configured as in the README, refresh the home captures
using `CANVAS_SCREENSHOTS=after pnpm exec playwright test e2e/canvas-precision.test.ts`.
These screenshots are review evidence; geometry assertions run in CI without
platform-dependent font rasterization comparisons.

Move blocks with the grip or its arrow keys. Positions snap to cells and
colliding neighbours move to nearby free positions. If no placement is possible,
the move is rejected. Escape cancels a drag. Versioned localStorage keeps only
this device's layout; invalid or inaccessible data falls back to defaults.
Undo retains up to 30 changes in the current session, including reset. Layouts
are never sent to the server. The common canvas coordinate system describes
positions, not a shared arrangement of blocks.

The complete case finder and project archive remain in a native disclosure
below the canvas. Navigation hashes open the disclosure; query filters also
open it in SSR. Mobile follows semantic zone order and has no canvas controls.
Inner pages keep their normal reading layout with angular surfaces, readable
line lengths and visible focus. Print CV styling remains separate: two A4
pages per language, selectable text and clickable contact/source links.

Avoid technology tag walls, vanity counters, repeated identical cards,
motion-dependent content and unnecessary overlays. Do not invent live activity
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
