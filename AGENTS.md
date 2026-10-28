# Project documentation

- Write all project documentation in English, including README files, guides,
  plans, agent instructions, ADRs, CONTEXT files and explanatory code/config
  comments. Keep localized product copy, CV text, database content and test
  fixtures in their intended languages.
- Check factual claims against the tracked implementation. Verify commands,
  paths, routes, environment variables and build/release behavior before
  documenting them; link to the relevant source where useful.
- Label future design intent separately from implemented behavior. Distinguish
  operator-reported hosting details from configuration actually verified live.
- Do not infer that historical packages, deployments or environments are absent
  merely because current workflows do not use them. Do not make private plans
  a public setup prerequisite.

## Development roadmap

- Read [`docs/brand.md`](docs/brand.md) for the site's approved audiences,
  design and public-claims boundaries. Read [`docs/roadmap.md`](docs/roadmap.md)
  for the proposed sequence of work; the roadmap is not permission to start
  every sprint.
- Work only on the explicitly approved sprint and scope. Confirm new
  positioning copy, publication/disclosure decisions and expanded scope with
  the owner before publishing them.
- Agents may use installed AI Hero or other relevant engineering skills for
  scoping, implementation, testing and code review. Follow these repository
  instructions first; do not require skills to be installed and do not create
  GitHub Issues or extra task files as a side effect.
- Use isolated branches and focused PRs with verification evidence. Merge or
  deploy only with explicit owner approval. Claim a change is live only when
  deployment evidence supports it.

## Editorial publications

When proposing, drafting, rewriting, translating or reviewing public Writing
materials (notes, curated digests, articles and technical essays), first apply
[publication-editor](.agents/skills/publication-editor/SKILL.md). Its reader-value
review is required in addition to code review; a technically correct article is
not necessarily ready to publish. It is not required for routine code or internal
engineering documentation. The owner still approves publication and disclosure.

## Agent skills

### Issue tracker

Tasks and specifications use GitHub Issues in `hmbanan666/kosarev.space`.
See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels.
See `docs/agents/triage-labels.md`.

### Domain docs

Use a single-context layout: root `GLOSSARY.md` and `docs/adr/`.
See `docs/agents/domain.md`.
