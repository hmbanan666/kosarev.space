# Publishing on kosarev.space

Writing is one chronological feed of [publications](../GLOSSARY.md). Notes,
digests and articles share one model. Type is chosen by the author, independent
of length. Projects and cases remain separate.

## Content lives in PostgreSQL

The owner submits text or a file to the agent. The agent prepares the bilingual
material, checks it with the owner and publishes the approved revision. There
is no public write endpoint, upload form, account system or CMS.

- [`publications` and `publication_revisions`](../packages/database/src/tables.ts)
  store stable identity, first-publication date, saved bilingual Markdown
  revisions and the selected public revision. Saving a revision does not publish it.
- The [read repository](../packages/database/src/repository/publication.ts) joins
  only the selected revision. Public list/detail APIs do not expose drafts or
  revision history. The list omits article bodies.
- [`/writing`](../apps/web-app/app/pages/writing/index.vue) and `/en/writing`
  show published records newest first, with slug order breaking same-date ties.
  [`/writing/[slug]`](../apps/web-app/app/pages/writing/[slug].vue) renders the
  selected revision in either language. Unknown and draft-only slugs return 404.
- The [Markdown renderer](../apps/web-app/server/utils/publication-markdown.ts)
  disables raw HTML and uses Markdown-it's unsafe-link checks. Bodies are rendered
  on the server, never compiled as Vue. Code blocks, lists and source links work
  without JavaScript. A heading may end with `{#stable-anchor}` to retain a link.
- Feed, related-work links and sitemap use the published data. Publication APIs
  use `no-store`; sitemap caching is disabled. A subsequent page request sees
  the selected revision without a build or restart. An already open page is not
  a live-update subscription and needs navigation or reload.

Application code, schema, renderer and synthetic tests remain in Git. Actual
publication bodies and metadata are maintained in the database. The old K39 Vue
files remain in Git history; no history rewrite is needed. Markdown export files
are portable inputs and backups, not a second runtime content source.

The current language policy remains **RU and EN for every publication revision**.
Both languages are approved and selected together. There is no silent fallback
or automatic translation at read time. A single-language pilot needs a separate
product decision and route/switcher changes.

## Prepare and review

The owner may send Russian prose, a Markdown file or links with observations.
For a digest, establish the covered period and verify each selected development
against a dated primary source. Distinguish releases from proposals and claimed
benchmarks from reproduced results. Keep the owner's judgement separate from
source facts; never manufacture personal testing or opinions to fill a section.
There is no required item count or automatic weekly publication.

Apply [publication-editor](../.agents/skills/publication-editor/SKILL.md) before
pitching, drafting, translating or reviewing public material. Establish the
reader's question and useful takeaway; review both languages. Preserve what is
unknown. A local test is not proof of production behavior. Clear new disclosures
and final public wording with the owner. Explicit approval covers the agreed
material, not unrelated later publications.

Keep draft files outside tracked public paths, for example in ignored `.cache/`.
The agent prepares one JSON input with these fields:

- `slug`: stable lowercase hyphenated address, at most 160 characters.
- `type`: `note`, `digest` or `article`.
- `locales.ru` and `locales.en`: each has `title`, `description` and Markdown `body`.
  The title and summary are displayed by the frame; do not repeat them in the body.
- `relatedWork`: an array, possibly empty, of real `{ kind, key, title: { ru, en } }`
  relationships. `kind` is `project` or `case`. Check the actual target keys;
  syntactic validation is not proof that the target exists.

Preview the candidate in a dedicated local test database using the same renderer
and reading page, then compare the visible RU/EN text, source links, code and
mobile/desktop layout with the approved draft. Do not use a public draft URL.

## Save and publish an exact revision

Run from the repository root with dependencies installed. Set
`PUBLICATION_DATABASE_URL` explicitly through a secure environment; the command
never loads `.env`. Confirm the intended database before writes. Do not place
credentials in a payload, shell history, PR or documentation.

The [publication command](../packages/database/scripts/publication.mjs) runs from
an operator checkout; it is not a public API and is not included in the app image.
The operator needs database connectivity. The configured production deployment
requires its authorized internal execution path; the public website cannot upload
these files on the owner's behalf.

```sh
pnpm --filter @kosarev/database publication draft "$PWD/.cache/publication.json"
pnpm --filter @kosarev/database publication history SLUG
pnpm --filter @kosarev/database publication export SLUG REVISION "$PWD/.cache/reviewed-revision.json"
```

`draft` validates both languages, saves the complete revision and prints its
SHA-256 digest. Repeating the same normalized input reuses the revision. Export
writes a new owner-readable file and refuses to overwrite it; its stored content
is checked against the digest. Draft saving leaves the public selection untouched.

Review that exact exported revision and the current live digest. After the
owner approves the material and publication, select it:

```sh
pnpm --filter @kosarev/database publication publish SLUG REVIEWED_REVISION EXPECTED_LIVE_REVISION
```

Use `none` as the expected live revision for a first publication. Publication
locks the identity row, verifies the chosen revision belongs to it and checks
its content digest. A different live revision aborts the change. Both languages
switch together; the command never implicitly publishes the newest draft.
Repeating an already completed selection is harmless. This is an operator
workflow, not enforced separation between independent human approvers: database
credentials can select revisions, and the agent must honor the owner's decision.

The first selection records the current UTC date. Later edits and rollbacks keep
it. The optional final `YYYY-MM-DD` argument is for importing an already published
material with its real original date; it cannot change an existing date or set a
future one. It is not scheduled publication.

A content-only update needs **no Git commit, PR, application build or deploy**.
Code/schema/renderer changes still follow focused PRs, checks and authorized
releases. After every content publication, read the public RU/EN feed and page:
verify exact content, revision identity, date, metadata, source/related links and
sitemap. A successful database command alone does not prove public visibility.

## History, corrections and rollback

Commands append revisions and retain older content in the database. A correction
uses the same slug and a new reviewed revision. Explain a substantive factual
correction to readers when necessary; do not change the first-publication date
to move an old article to the top of the feed.

To restore an earlier revision, use the same `publish` command with the older
digest and the current live digest as the expected value. This checks for
intervening changes and preserves the URL, date and all saved revisions. The
command has no delete or unpublish operation. Database backups are still needed;
revision history is not a substitute for an independently recoverable backup.

## Moving the existing K39 article

This implementation requires the additive publication migration and content
import **before** deploying the database-backed reader. There is no automatic
seed or static-content fallback. Preserve the previous public copy as a saved
revision for rollback; import the owner-approved rewrite as another revision,
with the same slug and original date `2026-10-28`. Review and select the approved
revision, then deploy and verify the public result separately.

Do not commit the import payload or put article text in a schema migration.
The old static app continues to serve its old body during preparation. Reverting
the application change restores that static body; selecting an older database
revision instead changes the text served by the new reader. These are different
rollback actions. Leave the additive tables intact during an application rollback.

Code verification includes real-database publication/conflict/rollback tests,
Markdown safety tests and E2E checks that save/publish while the app stays running.
E2E uses synthetic content and requires matching explicit local test URLs for
`CASE_CONTENT_TEST_DATABASE_URL` and `NUXT_DATABASE_URL`, with a database name
ending in `_test`. Real approved copy is checked separately during release.
