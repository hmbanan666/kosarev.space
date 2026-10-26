# kosarev.space

Source for the bilingual personal site at [kosarev.space](https://kosarev.space).
Russian is the default locale; English pages use the `/en` prefix.

The application uses a dark-only black and amber interface with an original
color portrait. It includes a portfolio, database-backed case studies,
a CV with printable pages and downloadable PDFs, direct contact links, an
opt-in live-cursor miniature demo, and optional Yandex Metrika tracking. The
[portfolio brief](docs/brand.md) describes the audiences, implemented design
direction and boundaries for future work.

## Stack

- Nuxt 4, Vue 3 and TypeScript
- Nuxt UI v4 and Tailwind CSS v4
- PostgreSQL and Drizzle ORM
- Nuxt i18n, sitemap and robots modules
- Vitest for unit tests; Playwright for E2E tests and CV PDF generation
- Docker build/runtime definition; GitHub Actions for CI and tagged releases

## Setup

Run the following commands from the repository root in a POSIX shell.

### Select Node and bootstrap pnpm

Use the Node version in [`.node-version`](.node-version) (24.21.0) and the pnpm
pin in [`package.json`](package.json) (12.15.0). The version file does not switch
your shell's runtime automatically. Activate the pinned Node explicitly before
running npm or pnpm; a system or Homebrew Node may otherwise take precedence.

For an existing nvm installation:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
. "$NVM_DIR/nvm.sh"
nvm install "$(cat .node-version)"
nvm use "$(cat .node-version)"
node --version # v24.21.0
```

With another runtime manager, select that same version before continuing.
Bootstrap native pnpm into this checkout:

```bash
npm install --global --prefix "$PWD/.cache/tooling" --allow-scripts=pnpm "$(node -p 'JSON.parse(require("node:fs").readFileSync("package.json", "utf8")).packageManager')"
export PATH="$PWD/.cache/tooling/bin:$PATH"
pnpm --version # 12.15.0
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
```

The explicit npm prefix keeps pnpm inside the ignored `.cache/tooling`
directory; it does not replace your globally installed pnpm. Corepack 0.36
cannot launch pnpm 12's native executable, so this setup uses npm. Installing
Playwright system dependencies on Linux may require administrator privileges.

In each new shell, repeat runtime selection and the PATH export from the
repository root. Git hooks use `pnpm exec nano-staged` and `pnpm exec commitlint`,
so the pinned pnpm must also be on PATH when committing.

### Configure a local database

Create a dedicated local PostgreSQL database and copy the environment examples:

```bash
cp apps/web-app/.env.example apps/web-app/.env
cp packages/database/.env.example packages/database/.env
```

Edit both files for your local database. `NUXT_DATABASE_URL` is used by the app;
`DATABASE_URL` is used by Drizzle CLI commands. Point both at the same local
database. The examples assume `kosarev_space` on localhost:5432; copying them
does not create the database or its user. `NUXT_PUBLIC_METRIKA_ID` is optional;
leaving it empty disables the app's Metrika plugin.

The [database plugin](apps/web-app/server/plugins/01.database.ts) attempts
migrations on startup, but catches and logs migration errors. Startup alone
does not prove that the schema is ready. Apply the tracked migrations explicitly
to check them before development:

```bash
pnpm --filter @kosarev/database db:migrate
```

Other database commands, also run from the repository root:

| Command | Effect |
|---|---|
| `pnpm --filter @kosarev/database db:generate` | Generate SQL migrations from the schema |
| `pnpm --filter @kosarev/database db:push` | Apply the schema directly to the local database |
| `pnpm --filter @kosarev/database db:studio` | Open Drizzle Studio |

Tracked migrations create schema objects, not case-study content. There is no
seed command in the package scripts; a new database starts with an empty case
list. Use local credentials for development, tests and builds, not production
credentials.

## Development and checks

Nuxt dev reads `apps/web-app/.env`:

```bash
pnpm --filter @kosarev/web-app dev
```

Run checks from the repository root. Export the local database URL for processes
that do not load the app's development `.env`, including the built server used
to generate PDFs:

```bash
export NUXT_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/kosarev_space
pnpm run check:full
```

Use the credentials you configured locally in place of this example.

| Command | Effect |
|---|---|
| `pnpm run lint` | Run ESLint |
| `pnpm run lint:fix` | Run ESLint with automatic fixes |
| `pnpm run typecheck` | Type-check both workspace packages |
| `pnpm run test` | Run Vitest unit tests |
| `pnpm run test:e2e` | Run Playwright smoke tests; starts Nuxt dev on port 3333 |
| `pnpm run build` | Build Nuxt, then generate both CV PDFs with Chromium |
| `pnpm run check:full` | Run lint, types, unit tests, E2E tests and build in sequence |
| `pnpm --filter @kosarev/web-app preview` | Serve an existing build with Nuxt preview |

`check:full` invokes plain lint, not `lint:fix`. E2E and PDF generation require
Chromium. The PDF generator starts the built app and writes `cv.pdf` and
`cv-en.pdf` into `apps/web-app/.output/public`. CV content is static; the Docker
build has been validated without database credentials. Database-backed routes
still need a configured database and schema. For a standalone production
preview, check the migration-directory contract in the [deployment guide](docs/deploy.md).

## Routes and repository layout

Pages are `/`, `/cases/[key]`, `/cv` and `/cv/print`, with English equivalents
under `/en`. Download routes are `/cv.pdf` and `/cv-en.pdf`.

The public case API exposes list/detail reads (`GET /api/cases` and
`GET /api/cases/[key]`), view recording (`POST /api/cases/[key]/view`) and
reaction changes (`POST /api/cases/[key]/react`). Internal repository creation
methods are not public CRUD endpoints. Case search supports shareable `q`,
`focus` and `tech` query parameters, with `all=1` exposing the full list. Contact
links are directly visible, with email copy/manual-selection feedback; there
is no contact-submission endpoint or `/book` page.

```text
apps/web-app/
├── app/                  # Pages, components, layouts, composables and Metrika plugin
├── i18n/locales/          # Russian and English product translations
├── public/               # Static assets
├── server/api/cases/      # Public read, view and reaction handlers
├── server/plugins/       # Database initialization and cache warmup
├── server/routes/        # CV PDF serving and the sitemap data source
└── scripts/              # CV PDF generation
packages/database/
├── src/                  # Schema, connection utilities and internal repository
└── migrations/           # Tracked SQL migrations
```

## Build, hosting and release

The [deployment guide](docs/deploy.md) describes the Docker contract and
separately labels the operator-reported Dokploy hosting context. Current
workflows run CI and create GitHub Releases on `v*` tags; they do not publish
container packages or create GitHub Deployments. Existing historical GitHub
records are separate from the current workflow configuration.

## License

[MIT](LICENSE).
