# Build and deployment contract

This guide describes the tracked Dockerfile, runtime configuration and GitHub
workflows. The operator reports hosting the site through Dokploy on a VPS.
Live Dokploy settings, network topology, database location, replica count,
TLS configuration and auto-deploy triggers are external to this repository
and were not verified for this documentation update.

The canonical site URL configured in [`nuxt.config.ts`](../apps/web-app/nuxt.config.ts)
is `https://kosarev.space`.

## Docker build and runtime

The build definition is [`docker/web-app/Dockerfile`](../docker/web-app/Dockerfile),
with the repository root as its build context:

```bash
docker build -f docker/web-app/Dockerfile -t kosarev-space:local .
```

Both stages use `node:24.21.0-slim`. The build stage installs native pnpm through
npm using the exact `packageManager` pin, installs dependencies with the frozen
lockfile, and installs Playwright Chromium with its system dependencies. It
runs the web app's build script, including Russian and English CV PDFs.
Corepack is not used. No production database credentials are needed for this
image build; the CV content is static.

The runtime image contains the Nuxt `.output` directory and tracked database
migrations. It runs as the `node` user from `/app`, sets `NODE_ENV=production`
and `PORT=3000`, and starts `node .output/server/index.mjs`. It does not include
PostgreSQL; supply access to a separately managed database at runtime.

| Variable | Runtime behavior |
|---|---|
| `NUXT_DATABASE_URL` | Connection string for database-backed functionality; the database plugin throws if it is empty |
| `NUXT_PUBLIC_METRIKA_ID` | Optional Metrika counter ID; empty or zero disables the app's client tracking plugin |
| `PORT` | HTTP listen port; the Dockerfile sets 3000 |
| `NODE_ENV` | The Dockerfile sets `production` |

`DATABASE_URL` belongs to the Drizzle CLI configuration, not the app's runtime
configuration. See the [local setup](../README.md#configure-a-local-database)
for the two environment examples.

## Database startup behavior

[`01.database.ts`](../apps/web-app/server/plugins/01.database.ts) creates the
connection and attempts migrations. It resolves `../../packages/database/migrations`
in development and `./migrations` in production, relative to the server's
working directory. The Dockerfile copies migrations to `/app/migrations`,
matching its working directory. A standalone production preview needs an
equivalent migration directory; `.output` alone does not include that copy.

Migration errors are caught and logged as warnings. Successful startup or an
HTTP response does not establish that migrations succeeded; check the logs
and database schema. The cache-warmup plugin also logs failures instead of
making them a successful-migration guarantee. Never use production credentials
for local verification.

## Dokploy configuration to confirm

Before changing a live installation, confirm its source repository and branch,
Dockerfile path, root build context, runtime environment, database connectivity
and routing in Dokploy. This guide does not establish the current GitHub App,
LAN addresses or deployment triggers.

If automatic deployment is configured, these are suggested watch paths:

- `apps/web-app/**`
- `packages/**`
- `docker/web-app/**`
- `package.json`
- `.node-version`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`

Changing this list does not change Dokploy configuration or initiate a deploy.

## GitHub workflows and historical records

| Workflow | Tracked behavior |
|---|---|
| [`ci.yml`](../.github/workflows/ci.yml) | Runs on pushes to `main` and PRs targeting `main`, subject to its path filters; uses an isolated PostgreSQL service and runs frozen install, lint, typecheck, unit tests, E2E tests and build |
| [`release.yml`](../.github/workflows/release.yml) | Runs `changelogithub` to create a GitHub Release on a pushed `v*` tag |

Neither workflow publishes container images or creates GitHub Deployments.
The Dockerfile does not consume a GHCR image, and the tracked repository has
no Kubernetes deployment manifests or `kubectl` rollout steps. GitHub Packages
and GitHub Deployments are not requirements of the build/runtime flow defined
here. Historical deployment or environment records may remain in GitHub;
workflow contents do not prove that those records or old packages were deleted.

## Case-content updates

[`case-content.mjs`](../packages/database/scripts/case-content.mjs) updates a
reviewed content bundle without changing the schema or deploying the app. It
uses the existing `pg` dependency from a repository checkout with dependencies
installed. It is not included in the runtime image. There is no public write
endpoint and no automatic content import on startup.

The [Phase 1 bundle](../packages/database/content/engineering-cases.json) adds
the EXPI billing case and revises six existing cases. The owner approved its
RU/EN wording and the home-page order on 28 October 2026. The EXPI account
describes implementation decisions and owner-confirmed operating behavior;
it includes no employer metrics or specific clients. Historical case revisions
remove unsupported outcomes and align the cursor case with the current module.
This approval does not establish that the content is already live.

Run from the repository root. Set `CASE_CONTENT_DATABASE_URL` explicitly to the
intended database through a secure environment; the tool never loads `.env`.
For a local rehearsal, use only a dedicated local database containing the
existing case fixtures. The bundle deliberately refuses to recreate missing
historical cases and is not a seed for a fresh installation.

```bash
mkdir -p .cache/case-content
pnpm --filter @kosarev/database content plan content/engineering-cases.json "$PWD/.cache/case-content/phase1.json"
```

Planning is read-only. The new file contains the connection target (without
credentials), before/after content and stable IDs for the affected cases.
It is created with owner-only permissions and refuses to overwrite an existing
file. Keep it outside version control: it contains the prior database content
needed for rollback. Review the target and every changed value before applying.
Generate a separate plan for each target; a local plan cannot be used against
production. Confirm Dokploy's actual database and release path with the operator.

After explicit owner approval of the production write:

```bash
pnpm --filter @kosarev/database content apply "$PWD/.cache/case-content/phase1.json"
```

The update is transactional and repeatable. It checks current content against
the plan and aborts on intervening edits. Existing IDs, metadata, other locales,
unrelated cases, views and reactions are preserved. A brief table lock serializes
case/translation writes; reads remain available. Translation `updated_at` values
advance when text changes. Case creation dates are preserved, so this operation
does not change the full catalog's date ordering.

Before reporting publication, verify the deployed application separately from
the data update: both localized EXPI detail pages, the localized case lists,
the featured order, `биллинг`/`billing` searches, all-results/back navigation and
CV/PDF/contact paths. The list/detail handlers use a 60-second stale-while-
revalidate cache. An immediate request can return old content; confirm refreshed
responses instead of treating an accepted update as proof of public visibility.

To revert this plan after reviewing the current state:

```bash
pnpm --filter @kosarev/database content rollback "$PWD/.cache/case-content/phase1.json"
```

Rollback restores prior text and removes translations created by the plan;
translation update timestamps still reflect the rollback. Later content changes
cause an atomic abort. Deleting a newly created case is refused if it has views
or reactions, to avoid cascading deletion of engagement. In that situation,
prepare an owner-approved corrective content update and, if necessary, remove
the case from the featured selection. The application PR can be reverted
independently; neither rollback path is automatic.
