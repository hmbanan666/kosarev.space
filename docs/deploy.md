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
