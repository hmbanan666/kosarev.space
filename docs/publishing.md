# Publishing on kosarev.space

Writing is one chronological feed of [publications](../GLOSSARY.md). Notes,
digests and articles use the same record and reading page. Type is chosen by
the author; length does not choose it. Projects and cases remain separate.

## Current implementation

- [`shared/publications.ts`](../apps/web-app/shared/publications.ts) owns identity,
  publication date, type, RU/EN metadata, content references and related work.
- [`/writing`](../apps/web-app/app/pages/writing/index.vue) displays every
  registered publication newest first, with slug order as the stable tie-breaker
  for the same day. Its English route is `/en/writing`.
- [`/writing/[slug]`](../apps/web-app/app/pages/writing/[slug].vue) resolves the
  same record in either locale and loads its static Vue content. An unregistered
  slug returns 404. The first article retains `/writing/k39-draft-permissions`.
- Bodies live in [`components/writing/content/`](../apps/web-app/app/components/writing/content/).
  Vue compiles them; there is no runtime Markdown parser, CMS or database write.
- The sitemap receives publication paths from the same registry. Header/footer
  navigation leads to Writing. Related publication links on projects and cases
  are derived from actual registered relationships.

The current language policy is **RU and EN for every published record**. Both
versions share slug, date, type and relationships. Publish equivalent claims,
examples, caveats and source attribution. There is no silent fallback from one
language to the other. A future single-language pilot needs an explicit product
decision and corresponding route, switcher and validation behavior first.

## Prepare a real material

Start with the observation, question or result worth communicating. Keep an
unapproved working draft outside tracked public files, as the current workflow
does in ignored `.cache/`. Do not create a public entry as a placeholder.

For an article, separate what source code establishes, what tests demonstrate,
what was observed live and what the author remembers. Preserve uncertainty.
For a digest, link each item to a primary source, identify the development date
when relevant and explain why it matters in the author's own words. An upstream
claim, benchmark or release announcement is not a result personally reproduced.
For a note, distinguish an observation or opinion from a general factual claim.

Never invent an incident, contribution, client, usage metric or performance
result. Clear third-party disclosures with the owner; do not commit private
source material or credentials. Approve new public copy before pushing it.
Explicit owner delegation can authorize a defined batch; it does not turn
unrelated future materials into pre-approved claims.

## Add the publication

1. Create a focused branch from current `main`. Reuse the existing layout and
   preserve any established public URL when revising a material.
2. Add the finished RU/EN body components under `components/writing/content/`.
   Each component contains semantic body HTML: paragraphs, `h2` sections, lists,
   links and code as needed. Title, summary, type and date belong to the registry
   and frame. Follow the existing K39 bodies; do not add a second renderer or
   duplicate the publication as a database case. Use no untrusted HTML or script.
3. Add one registry record. Use a unique lowercase hyphenated slug, an explicit
   `note`, `digest` or `article` type, and a `YYYY-MM-DD` publication date. Dates
   represent the first public release day in UTC, not the experiment date or
   a timestamp regenerated on each build. Reconcile the intended day with the
   actual release if deployment crosses midnight or is delayed.
4. Set both localized `title`, `description` and `content` fields. `content`
   is the body component's filename without `.vue`; the route's build-time glob
   loads it. The same path works for every type. No route file is added per post.
5. Add only genuine `relatedWork` entries. `kind: project` uses the existing
   project key and links to its home-page anchor. `kind: case` uses an existing
   case key and links to its localized detail page. Supply a short RU/EN label
   consistent with the target. An empty list is valid. Do not link unrelated
   cases merely to populate a section.

## Verify and release

Run the [repository checks](../README.md#development-and-checks) with an explicit
local test database. Publication unit tests validate sorting across types,
identity, dates, references and relationships; update the explicit first-entry
count when a second real material is added. Synthetic fixtures belong in tests
only. Browser tests cover feed, reading, language, metadata, unknown slugs,
relationships and responsive navigation, including no-JavaScript reading.

For each new body, compare rendered copy with the approved source, inspect its
mobile/desktop layout, follow source and related-work links, and verify both
language versions and sitemap URLs. Code examples must retain meaningful
whitespace and be reproducible within their stated assumptions. Use the actual
content to decide whether extra tests or assets are needed.

Open a focused PR with verification evidence. Resolve review findings and
confirm CI for the exact head. Merge/deploy requires owner authorization for
that release; do not repeat an approval already granted for the same scope.
Hosting currently auto-deploys `main`, as documented in the dated
[deployment guide](deploy.md); recheck the configuration when releasing.

Match a successful deployment to the merged commit, then read both public
variants. Verify the feed date/type/link, full content, locale switch, canonical
and alternate URLs, sitemap and related-work navigation. A successful build or
merged PR alone is not publication evidence. Keep sanitized release evidence
locally or in the PR; do not put operational credentials in project docs.

## Corrections and rollback

Correct text through a small reviewed PR. Keep the original publication date
and stable slug; explain a substantive correction in the material itself when
readers need that history. Do not refresh old posts to the top by changing dates.
There is no separate automatic updated-date or scheduled-publication system.

A new publication can be rolled back by reverting its registry entry and body
files through the normal release path. Readers following its old address will
then receive 404; decide explicitly whether a published correction or a retained
withdrawal notice serves them better. These static changes have no database
migration or engagement counters to reverse.
