# Deploy — web-app (Dokploy)

Production lives on the Dokploy VPS. GitHub Actions only runs **CI** (lint /
typecheck / test / build) and **Release** (changelog on tags). Images are
**not** pushed to GHCR; Dokploy builds from the Dockerfile on the VPS.

| | |
|---|---|
| App URL | https://kosarev.space |
| Host | Dokploy project `kosarev-space` → env `production` → app `web-app` |
| Source | GitHub `hmbanan666/kosarev.space` @ `main` (GitHub App `port-ru-1`) |
| Build | `dockerfile` · file `docker/web-app/Dockerfile` · context `.` |
| Auto-deploy | push to `main` when watch paths change (see below) |

## Topology

```
GitHub (source)                    Dokploy VPS (.5)              LAN
hmbanan666/kosarev.space ─clone/build─▶ web-app ──NUXT_DATABASE_URL──▶ Postgres @ 192.168.0.7
                              │
                    kosarev.space (Traefik + Let's Encrypt)
```

- **Postgres stays off Dokploy** — app connects over LAN (`NUXT_DATABASE_URL` →
  `192.168.0.7` / DB `kosarev_space`). Do not create a Dokploy postgres for this app.
- **One replica** is enough for the portfolio site.

## Env (Dokploy → application → Environment)

| Variable | Required | Notes |
|----------|----------|--------|
| `NODE_ENV` | yes | `production` |
| `NUXT_DATABASE_URL` | yes | `postgresql://…@192.168.0.7:5432/kosarev_space` |
| `NUXT_PUBLIC_METRIKA_ID` | yes | Yandex Metrika counter id |
| `NUXT_SESSION_PASSWORD` | yes | Session cookie encryption |

Migrations run on container boot (`server/plugins/01.database.ts`).

## Watch paths (Dokploy auto-deploy)

Redeploy on push when any of these change:

- `apps/web-app/**`
- `packages/**`
- `docker/web-app/**`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`

Manual redeploy: Dokploy UI, or MCP `application-redeploy`.

## Dockerfile

Same path Dokploy uses:

```
docker/web-app/Dockerfile
```

Context is the monorepo root. Build stage installs Playwright Chromium to
generate CV PDFs at build time.

## Cutover checklist (reference)

1. Deploy app on Dokploy with env + domain `kosarev.space` (LE).
2. Smoke via VPS public IP with `Host: kosarev.space` (while DNS still on k8s).
3. Point DNS A for `kosarev.space` → `185.178.47.234`.
4. Confirm HTTPS + LE cert, then stop k8s `deployment/web-app` in `kosarev-space`.

## What GitHub Actions does now

| Workflow | Role |
|----------|------|
| [`ci.yml`](../.github/workflows/ci.yml) | lint, typecheck, unit, e2e, build on `main` / PRs |
| [`release.yml`](../.github/workflows/release.yml) | GitHub Release + changelog on `v*` tags |

Removed (obsolete): Web App Docker (GHCR + kubectl rollout) and the `k8s/` manifests.
