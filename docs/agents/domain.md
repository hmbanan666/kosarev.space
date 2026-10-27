# Domain docs

## Layout and reading rules

This repository uses a single domain context across the web application
and database package.

Before exploring an area, read the root `GLOSSARY.md`, if present,
and relevant decisions under `docs/adr/`.

These paths describe the intended locations. Create domain documents
only when terminology or architectural decisions need recording.
If they do not exist, proceed silently without proposing placeholders.

## Vocabulary

Use glossary terms consistently in specifications, issues, code and tests.
When a needed concept is missing, first check existing project usage.
Record a new term through domain modeling when its meaning is settled.

## Architectural decisions

If proposed work contradicts an existing ADR, identify the decision
and explain the conflict before proceeding.
