# Issue tracker: GitHub

Tasks and specifications live in GitHub Issues for
`hmbanan666/kosarev.space`. Temporary execution notes stay in the active
agent/session.

Create issues only for owner-requested planning or tracking work.
Selecting a skill internally does not authorize publishing tasks.

## Operations

Use the GitHub integration or `gh` CLI. With `gh`, pass
`--repo hmbanan666/kosarev.space` explicitly.

- Read: `gh issue view <number> --json number,title,body,labels,comments`.
- List: `gh issue list --state open --json number,title,labels`.
- Create: `gh issue create --title "<title>" --body-file <path>`.
- Update: `gh issue edit <number> --body-file <path>`.
- Label: `gh issue edit <number> --add-label "<label>"`.
- Comment: `gh issue comment <number> --body-file <path>`.
- Close completed work: `gh issue close <number>`.
- Link a child: `gh issue edit <parent> --add-sub-issue <child>`.
- Record a dependency:
  `gh issue edit <child> --add-blocked-by <blocker>`.

Use actual newlines in body files. Apply label names from
`triage-labels.md`. Keep documentation and specifications in English.

## Skill instructions

When a skill says "publish to the issue tracker", create a GitHub issue
within the owner's requested scope.

When a skill says "fetch the relevant ticket", read the GitHub issue
and its comments.

## Pull requests as a triage surface

**PRs as a request surface: no.**
