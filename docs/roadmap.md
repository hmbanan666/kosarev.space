# Website development roadmap

**Planning snapshot:** 27 October 2026  
**Status:** Proposed sequence; implementation of each sprint requires separate approval.  
**Primary goal:** Help Nikolai find a suitable small product team while building
a durable professional reputation based on real engineering work.

This is a near-term direction, not a fixed delivery calendar or evidence that
work has shipped. Job outreach and conversations can begin immediately; website
iterations must not delay them.

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

## Sprint 1 — Clear positioning for small product teams

**Outcome:** A recruiter, technical leader or founder can understand the
hands-on role Nikolai is looking for, the responsibility he can take, and how
to contact him from the first screen.

**Candidate work**
- Draft concise Russian and English introductory copy expressing interest in
  a small product team, product/architecture ownership and continued hands-on
  implementation. Treat role titles as copy options, not established facts.
- Check prominent claims in the hero, CV and initially visible cases against
  approved career facts and evidence. Resolve ambiguous claims before using
  them to persuade hiring teams; avoid implying unverified outcomes.
- Keep CV, PDF, work examples and direct contact easy to reach without
  rearranging the existing layout.

**Acceptance**
- The owner approves final RU/EN positioning before publication.
- First-screen role, team preference and contact path are understandable at
  desktop and mobile sizes; CV and PDF links continue to work.
- High-impact claims have documented support or have been qualified/removed;
  both locales agree in meaning.
- No new design system or unrequested interface features are introduced.

**Not in scope:** Rechecking every historical case before any copy can ship.

## Sprint 2 — Strong evidence of engineering responsibility

**Outcome:** At least one substantial, credible case shows technical depth
and personal responsibility rather than only technology names.

**Candidate work**
- Prepare one bounded EXPI case, potentially about billing and keeping paid
  access consistent, using only facts approved for public disclosure.
- Describe problem, individual responsibility, solution, limitations and
  verifiable results. Separate implementation, testing and planned rollout.
- Curate a small set of hiring-relevant case examples on the home page; do
  not rely solely on creation-date ordering.
- Verify that meaningful case searches (for example, `billing`) surface
  the appropriate content in both locales.

**Acceptance**
- Public wording is explicitly approved and contains no employer secrets,
  private architecture records, client data or invented metrics.
- The RU/EN case is readable, searchable and linked from the relevant site
  surface, with accurate descriptions of the work's status.
- Curated examples are justified by relevance and their behavior is covered
  by appropriate checks.
- Data changes are tested against isolated preview fixtures. Case bodies live
  in PostgreSQL and are not recreated by schema migrations; a code-only PR
  does not prove production case content has changed.

**Not in scope:** Importing private employer material to obtain better copy.

## Sprint 3 — Current independent products

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

## Sprint 4 — First engineering publication

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

Internal work tracking stays in the running agent/session or agreed external
tool, not in repository GitHub Issues by default. Avoid updating this roadmap
for minor task status changes; change it when priorities, approved outcomes
or constraints materially change.
