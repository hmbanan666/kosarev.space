# kosarev.space

Personal site — [kosarev.space](https://kosarev.space)

Brand / rework intent: [`docs/brand.md`](docs/brand.md). Full construction lives in private `hmbanan666/book` → `PLAN.md`.

![Preview](apps/web-app/public/preview.png)

## Stack

- **Nuxt 4** + **Vue 3** + **TypeScript**
- **Nuxt UI v4** + **Tailwind CSS v4**
- **PostgreSQL** + **Drizzle ORM**
- **i18n** — Russian / English
- **Playwright** — E2E tests + CV PDF generation
- **Vitest** — unit tests
- **Docker** + **Dokploy** — production deploy on VPS
- **GitHub Actions** — CI (+ release on tags)

## Setup

Use Node.js **24.21.0** (`.node-version`) and the exact pnpm version in
`package.json`. Bootstrap pnpm locally without changing global tools:

```bash
npm install --global --prefix "$PWD/.cache/tooling" --allow-scripts=pnpm "$(node -p 'JSON.parse(require("node:fs").readFileSync("package.json", "utf8")).packageManager')"
export PATH="$PWD/.cache/tooling/bin:$PATH"
pnpm --version # 12.15.0
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

Run the PATH export from the repository root in each new shell. Corepack 0.36
cannot launch pnpm 12's native executable; use the npm bootstrap above. CI and
Docker also install the pinned pnpm through npm.

Copy env files and fill in values:

```bash
cp apps/web-app/.env.example apps/web-app/.env
cp packages/database/.env.example packages/database/.env
```

### Database

Use a dedicated local PostgreSQL database (the examples use localhost:5432).
App startup automatically applies migrations, so do not use production
credentials for development, tests or builds. E2E tests and CV PDF generation
start the app. Use a local `NUXT_DATABASE_URL` to verify database-backed
routes and migrations; CI uses an isolated PostgreSQL service. CV content is
static, so Docker can generate the PDFs without database credentials.

```bash
cd packages/database
pnpm db:generate    # generate migrations
pnpm db:push        # push schema directly (dev)
pnpm db:studio      # open Drizzle Studio
```

Migrations run automatically on app startup.

## Development

```bash
pnpm --filter @kosarev/web-app dev
```

## Scripts

| Command | Description |
|---|---|
| `pnpm run lint` | ESLint |
| `pnpm run typecheck` | Type check |
| `pnpm run test` | Unit tests |
| `pnpm run test:e2e` | E2E tests (Playwright) |
| `pnpm run build` | Production build + CV PDFs |
| `pnpm run check:full` | Lint, types, unit, E2E and production build (no auto-fixes) |

`check:full` requires Chromium. To exercise the database-backed routes too,
export the local database URL when running from the repository root (Nuxt dev
reads the app's `.env`, but the production server used to generate PDFs reads
environment variables):

```bash
export NUXT_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/kosarev_space
pnpm run check:full
```

The npm `--global` flag above controls the install layout; the explicit prefix
keeps the tool inside this checkout and does not replace your global pnpm.

Git hooks run the installed `nano-staged` and `commitlint` via `pnpm exec`.
Keep the bootstrapped pnpm on PATH when committing.

## Project structure

```
apps/web-app/             # Nuxt application
├── app/
│   ├── components/       # Vue components
│   ├── composables/      # Composables
│   ├── layouts/          # Page layouts
│   ├── pages/            # Routes (/, /cases/[key], /cv, /cv/print)
│   └── plugins/          # Yandex Metrika
├── i18n/locales/         # Translation files
├── server/
│   ├── api/cases/        # Cases API (CRUD, views, reactions)
│   ├── plugins/          # Database init + auto-migrate
│   ├── routes/           # CV PDF serving, sitemap
│   └── utils/            # Repository access
└── scripts/              # PDF generation at build time

packages/database/        # Shared database package
├── src/
│   ├── tables.ts         # Drizzle schema
│   ├── database.ts       # Connection + migration
│   ├── constants.ts      # Shared constants
│   └── repository/       # Data access layer
└── migrations/           # SQL migrations
```

## Deploy

Production is on **Dokploy** (build on VPS from `docker/web-app/Dockerfile`, no
GHCR/k8s). Details: [`docs/deploy.md`](docs/deploy.md).

URL: [kosarev.space](https://kosarev.space)

## License

MIT
