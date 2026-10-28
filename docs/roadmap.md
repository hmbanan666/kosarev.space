# Website development roadmap

**Planning snapshot:** 28 October 2026

**Status:** Documentation proposal; Phase 1 implementation awaits owner approval.

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

Repository baseline: `dcb8f05` on `main`, inspected on 28 October 2026.

- Bilingual CV, print/PDF generation and shared career facts are implemented
  ([PR #5](https://github.com/hmbanan666/kosarev.space/pull/5)); EXPI launch and
  warm-cache build qualifications were clarified in
  [PR #6](https://github.com/hmbanan666/kosarev.space/pull/6).
- The black-and-amber design, case pages, shareable search/filters, project
  archive and direct contacts are implemented
  ([PR #7](https://github.com/hmbanan666/kosarev.space/pull/7)).
- Owner-approved RU/EN small-team positioning is merged
  ([PR #13](https://github.com/hmbanan666/kosarev.space/pull/13)). The former
  Sprint 1's copy work is complete, but
  [issue #10](https://github.com/hmbanan666/kosarev.space/issues/10) remains open
  for two unverified case claims: adding a language in 30 minutes and whole-team
  adoption within a week. This roadmap does not close that evidence work.

**Public runtime observation, 28 October 2026:** Read-only HTTP checks of
[/](https://kosarev.space/) and [/en](https://kosarev.space/en) returned the
approved small-team copy. Both CV pages and PDF URLs returned HTTP 200; the
downloads had PDF signatures. The public case API returned 13 entries in each
locale, with no EXPI entry. These checks establish observed public responses,
not deployed commit identity, PDF visual quality or live Dokploy configuration.
Hosting remains operator-reported as described in [deploy.md](deploy.md).

The [case repository](../packages/database/src/repository/case.ts) sorts by
creation date; the [home-page catalog](../apps/web-app/app/components/SkillsShowcaseSection.vue)
shows the first six without filters. There is no editorial selection yet.
The [project list](../apps/web-app/app/utils/data.ts) contains the historical
portfolio, not K39/Woodlands; publication routes are not implemented. These
future phases have not been completed by the foundation work above.

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
exception was repaired automatically. Final RU/EN wording still needs review.

**Proposed delivery sequence**

1. **Establish public evidence.** Use the approved EXPI CV entries in
   [RU](../apps/web-app/i18n/locales/ru.json) and
   [EN](../apps/web-app/i18n/locales/en.json) as the starting point: sole-engineer
   responsibility and a unified payment, subscription, refund and access flow
   with reconciliation. Ask the owner for a disclosure-safe account of the
   original problem, personal decisions, alternatives, failure handling and
   actual rollout/results beyond the brief above. Track each proposed claim,
   its support and approval in the owner review; only approved, disclosure-safe evidence goes into a
   public PR. Existing copy or agent-generated reports do not prove additional
   detail. Preserve the approved partial-migration and warm-cache qualifications.
2. **Draft one bounded EXPI billing case.** Explain context and constraints,
   personal responsibility, decisions/tradeoffs, verification, delivered result
   and remaining limitations. Fit it into the existing `description`, `task`,
   `solution` and `result` fields. Separate implemented behavior, tested behavior
   and launch preparation. A qualitative, evidenced result is sufficient;
   omit concrete figures and specific clients from this EXPI case as instructed
   by the owner.
   Obtain approval of exact RU/EN copy before a public content PR or data write.
3. **Curate existing cases.** Review the shortlist below in both locales,
   including detail bodies. Prefer personal ownership, product relevance,
   concrete decisions and evidence quality over technology count or recency.
   Resolve the two outstanding claims from issue #10 alongside this selection.
   Unsupported claims must be supported or replaced with approved qualified
   wording before promotion; being online does not establish their accuracy.
4. **Implement a small technical PR after scope approval.** Propose a static
   ordered list of approved case keys for the unfiltered home-page view, using
   the existing six slots and a stable fallback for other available cases.
   Ignore missing keys, avoid duplicates, and preserve full-list/filter and
   context-navigation behavior. Reuse the current components and schema.
   Search currently matches key/title/description/tags, not detail bodies
   ([filter implementation](../apps/web-app/app/utils/case-finder.ts)); include
   natural billing terminology in the approved localized summaries and check
   `биллинг` in RU and `billing` in EN.
5. **Prepare and verify content delivery separately.** Case bodies are in
   PostgreSQL. Prepare a repeatable update limited to approved keys/locales,
   preview its before/after values in an isolated database, and provide a
   rollback from the affected rows. Preserve IDs, unrelated cases and engagement
   records. Confirm the target database, deployment path and cache behavior
   with the operator before requesting permission to apply it. A schema
   migration or code deploy alone does not publish the case.

**Provisional shortlist, subject to evidence and owner approval**

| Priority | Case | Reason to consider it | Evidence needed before promotion |
|---|---|---|---|
| Lead | New EXPI billing case | Recent end-to-end responsibility and a concrete product invariant: payment and access consistency | Verify personal decisions and qualitative outcome within the approved disclosure boundary |
| 2 | `o5-rewrite` | Evolving an existing product while maintaining continuity | Actual migration scope; substantiate or qualify client counts, zero downtime, speed and coverage claims |
| 3 | `meloteka-transcoding` | Independent product ownership across processing, storage and playback | Verify implementation and measured limits/costs; retain its closed-in-2026 status |
| 4 | `sushilove-async` | Background processing and operational reliability | Confirm failure handling; substantiate or qualify latency, throughput and zero-loss claims |
| Supporting | `nextorders-i18n`, `kosarev-live-cursors` | Contributor experience and inspectable implementation | Verify current source/ownership; resolve the i18n timing claim and check cursor copy against the current module |

This is an editorial hypothesis, not a certified ranking. Public detail reads
for the migration, transcoding and async cases exposed quantitative claims not
substantiated by this repository audit. If evidence is insufficient, use a
better-supported candidate rather than embellishing the story. Retain access
to the full archive; do not expand this into a prerequisite audit of every case.

**Acceptance**
- Public wording is explicitly approved and contains no employer secrets,
  private architecture records, client data or invented metrics.
- The RU/EN case is readable, searchable and linked from the relevant site
  surface, with accurate descriptions of the work's status.
- Curated examples are justified by relevance and their behavior is covered
  by appropriate checks: ordered selection, missing keys and duplicates,
  unaltered filters/all-results access, and RU/EN detail/back navigation.
- Run applicable lint, type, unit, E2E and build checks from the README for the
  implementation PR; check desktop/mobile layout and CV/PDF/contact paths.
- Data changes are tested against isolated preview fixtures. Case bodies live
  in PostgreSQL and are not recreated by schema migrations; a code-only PR
  does not prove production case content has changed.

**Decision boundary:** Within the approved Phase 1 slice, the agent can inspect
public/source evidence, choose implementation details, prepare isolated fixtures,
implement selection behavior, test and open focused PRs. The owner confirms
any disclosure beyond the brief, attribution, new facts, exact RU/EN claims and
final editorial selection. Private evidence stays outside the public repository/PR.
Production data writes, merge and deployment require explicit owner approval;
post-release checks must separately confirm both localized lists/detail pages,
search, approved ordering and fresh cached responses before claiming publication.

**Current authorization:** Audit, plan and this documentation PR only. No
Phase 1 implementation, production writes or later-phase work begins here.

**Not in scope:** Importing private employer material, redesign, new publishing
infrastructure or an exhaustive historical-case audit.

## Phase 2 — Active products

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
