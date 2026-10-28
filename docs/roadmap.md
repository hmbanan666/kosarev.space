# Website development roadmap

**Planning snapshot:** 28 October 2026

**Status:** Phase 1 published. Phase 2 copy, images, public PR and release after
successful CI are owner-approved. Later phases remain out of scope.

**Primary goal:** Help Nikolai find a suitable small product team while building
a durable professional reputation based on real engineering work.

**Long-term goal:** Develop kosarev.space into Nikolai's durable professional
and author hub: **Professional** (experience, cases and contact), **Products**
(active independent products and their history), and **Writing** (substantial
engineering, AI, experiment and product-building publications). The site should
demonstrate the ability to create and evolve products independently.

These are content directions, not a proposal for new navigation or a fixed
delivery calendar. Creative work requires a separate owner decision; private
writing is outside this roadmap. Job outreach can begin immediately; website
iterations must not delay it.

## Sources and boundaries

- [Portfolio direction](brand.md) defines audiences, approved design, factual
  constraints and the implemented baseline.
- [Repository instructions](../AGENTS.md) define how agents must work.
- [README](../README.md) describes the current technical implementation and
  verification commands.
- Current code, database content and verified runtime evidence determine what
  is actually implemented or published. This roadmap does not override them.

Preserve the current design, tech stack, bilingual CV/PDF paths, accessible
contact routes and case finder. No redesign, new CMS, speculative feature or
infrastructure migration is justified by this plan.

## Completed foundation and remaining evidence gaps

Pre-Phase-1 repository baseline: `dcb8f05` on `main`, inspected on 28 October 2026.

- Bilingual CV, print/PDF generation and shared career facts are implemented
  ([PR #5](https://github.com/hmbanan666/kosarev.space/pull/5)); EXPI launch and
  warm-cache build qualifications were clarified in
  [PR #6](https://github.com/hmbanan666/kosarev.space/pull/6).
- The black-and-amber design, case pages, shareable search/filters, project
  archive and direct contacts are implemented
  ([PR #7](https://github.com/hmbanan666/kosarev.space/pull/7)).
- Owner-approved RU/EN small-team positioning is merged
  ([PR #13](https://github.com/hmbanan666/kosarev.space/pull/13)). The former
  Sprint 1's copy work is complete. Phase 1 replaced the unverified i18n timing
  and team-adoption claims with owner-approved wording; it did not change the
  status of [issue #10](https://github.com/hmbanan666/kosarev.space/issues/10).

**Post-Phase-1 runtime verification, 28 October 2026:** Dokploy reported a
successful automatic deployment of `6ebaca6` from `main`. A separate approved
transaction added EXPI and revised six cases in RU/EN. Public list/detail reads
confirmed 14 cases and exact agreement with all seven approved bilingual texts
after cache refresh. Live browser checks covered featured order, full-list
access, billing search, detail/back navigation and mobile/desktop layouts in
both locales; CV/print responses, PDF signatures and contact links also passed.
This is portfolio release evidence, not an audit of EXPI's production systems.

The [case repository](../packages/database/src/repository/case.ts) retains
creation-date order for the full catalog and search. The unfiltered home page
uses the editorial selection in
[case-finder.ts](../apps/web-app/app/utils/case-finder.ts). Phase 2 adds K39 and
Woodlands above the retained historical project list; its release is approved
but still requires separate deployment verification. Publication routes are not
implemented.

Phase 1 below continues former Sprint 2; Phases 2 and 3 continue former
Sprints 3 and 4. Phases 4 and 5 describe later work, each separately approved.

## Phase 1 — Engineering credibility

**Outcome:** At least one substantial, credible case shows technical depth
and personal responsibility rather than only technology names.

**Owner-confirmed brief, 28 October 2026:** A public technical EXPI case is
permitted without concrete figures or references to specific clients. The owner
reports that initial payment/access, renewal, refund/access changes and
payment/access reconciliation operated automatically by the end of the role.
This is owner testimony, not an independent runtime audit or proof that every
exception was repaired automatically. The owner subsequently approved the exact
RU/EN wording and featured order prepared in
[PR #15](https://github.com/hmbanan666/kosarev.space/pull/15).

**Completed delivery**

- [PR #14](https://github.com/hmbanan666/kosarev.space/pull/14) established the
  long-term direction and Phase 1 plan.
- [PR #15](https://github.com/hmbanan666/kosarev.space/pull/15) delivered the
  approved EXPI billing account, qualified historical copy and ordered selection.
  The featured order is EXPI, o5, Meloteka, Sushi-Love async, NextOrders i18n and
  live cursors. The full archive remains accessible.
- The [content bundle](../packages/database/content/engineering-cases.json) and
  [transactional command](../packages/database/scripts/case-content.mjs) separate
  code deployment from content publication. Production planning preserved the
  previous text for rollback; existing IDs, metadata, views and reactions were
  preserved. The [deployment guide](deploy.md#case-content-updates) describes
  drift checks and the rollback restriction once a new case has engagement.
- Local lint, types, unit/content/E2E tests and build passed, followed by hosted
  CI and the separate public checks above.

**Approval and evidence boundary:** The owner approved the exact bilingual
wording/order and the bounded merge, data update and deployment of PRs #14/#15.
EXPI outcomes rely on owner testimony and reviewed implementation evidence;
no figures, clients, private documents or operational identifiers were published.
That release approval does not authorize later product copy or releases.

## Phase 2 — Active products

**Current scope:** The owner requested the next step after Phase 1 publication.
Prepare K39 and Woodlands in the existing project section, with bilingual copy,
real interface images and public destination links. Preserve the archive and
visual system. No new product case, database change, blog or product-repository
implementation is required.

**Verified baseline, 28 October 2026:** K39 main `0420863` and Woodlands main
`5359a46` match successful Dokploy deployments. Public K39 pages and map render;
the Woodlands bot launch page and application respond. Woodlands uses demo
fixtures outside Telegram, so a browser capture is labelled as a demo and does
not establish authenticated gameplay or payment acceptance. Its repository is
private: expose the bot link, not the repository or private implementation files.

**Owner approval, 28 October 2026:** The exact RU/EN text, first-person
attribution, product images and Woodlands implementation summary were approved.
The owner authorized the public PR and its merge/deployment after successful CI.
This approval covers only the bounded Phase 2 change; verify the live result
separately before reporting publication.

**Outcome:** Visitors can distinguish current product work from the archive
of earlier projects.

**Candidate work**
- Present K39 and Woodlands with their actual scope, current status,
  appropriate links, real visuals and a few relevant engineering decisions.
- Retain the existing historical project archive and its closure labels.
- Verify every claim against the projects' own repositories and, for live
  behavior or metrics, against suitable runtime evidence.

**Acceptance**
- Both current products are discoverable and clearly differentiated from
  completed historical work, in Russian and English.
- Images and project statuses are accurate; user counts, traffic and revenue
  are omitted unless verified and cleared for publication.
- Existing archive navigation and responsive layouts remain usable.

**Not in scope:** Rebuilding K39 or Woodlands inside this repository.

## Phase 3 — Writing

**Outcome:** One substantial, reusable public explanation of a real
engineering experiment, supporting professional credibility.

**Candidate work**
- Select a completed or clearly bounded AI-assisted development experiment
  with a concrete problem, method, verification and honest limitations.
- Draft the content and decide on a publication channel only after the draft
  has been reviewed; link it to relevant projects/cases where appropriate.

**Acceptance**
- One finished and owner-approved RU/EN publication or an explicitly approved
  single-language pilot exists, supported by reproducible examples where
  feasible and without private prompts, credentials or third-party material.
- Its publication location is deliberate, and the website has a useful path
  to it if relevant.

**Not in scope:** Creating an empty blog, CMS, newsletter or video platform.

## Phase 4 — Sustainable publishing

**Prerequisite:** The first real publication is published and the owner approves
this phase. Add only the infrastructure needed to maintain actual material and
connect articles, products and cases through understandable navigation.

**Acceptance:** A reader can find the publication and its related work; the
owner has a documented, repeatable publishing path with an explicit language
policy. Choose the smallest implementation supported by the material; a CMS,
accounts and subscriptions are not assumed requirements.

## Phase 5 — Evolution

Review the site as career direction, products and public material change.
Propose bounded improvements based on observed reader needs and verified new
work. Each slice needs its own outcome, scope and approval; keep the site
maintainable rather than turning it into a general-purpose platform.

## Execution contract for agents

1. **One active sprint at a time.** The roadmap orders possibilities; it is
   not a command to execute all sprints. Start only the stage approved by
   the owner, and reconfirm scope when assumptions are uncertain.
2. **Verify before planning changes.** Read `AGENTS.md`, `docs/brand.md`,
   this roadmap, recent PRs and the relevant implementation. Do not rebuild
   work that is already complete.
3. **Choose the smallest verifiable slice.** Agents may decide implementation
   details and testing strategy. Escalate new product promises, publishing
   claims, material scope changes and disclosure decisions for approval.
4. **Use available agent skills where useful.** For example, AI Hero
   `to-spec`, `implement`, `tdd`, `code-review` and `pr` may guide
   planning, implementation and review. Skills are optional tooling, not a
   prerequisite for this repo. Do not let a skill create GitHub Issues,
   ticket files or unrelated ADRs by default.
5. **Deliver via one or more focused PRs.** Use a separate branch, run
   applicable checks and explain what changed, what was verified and what
   remains uncertain. Do not merge or deploy without explicit owner approval.
6. **Review against outcomes.** After a sprint, inspect the PR, CI and any
   required runtime/content evidence before reporting completion or proposing
   the next stage. A merged PR is not proof of a production deployment.

Tasks and specifications use GitHub Issues, following
[the issue tracker conventions](agents/issue-tracker.md). Temporary
execution notes stay in the running agent/session. Create issues only
for owner-requested planning or tracking work. Avoid updating this roadmap
for minor task status changes; change it when priorities, approved outcomes
or constraints materially change.
