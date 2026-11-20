# kosarev.space

Source for the bilingual personal site at [kosarev.space](https://kosarev.space).
Russian is the default locale; English pages use the `/en` prefix.

The application uses a dark-only black and amber interface with an original
color portrait. It includes a portfolio, database-backed case studies,
a CV with printable pages and downloadable PDFs, current Context, K39 and
Woodlands product entries, a paused Dostigus entry, project pages for Context,
K39 and Dostigus, a historical project archive, a unified bilingual Writing
feed, direct contact links, a shared home board with live cursors and a desktop profile
pill, and optional Yandex Metrika tracking. The
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

Run checks from the repository root against a separate local test database.
Using PostgreSQL client tools and your local role, create it once:

```bash
PGPASSWORD=postgres createdb --host=127.0.0.1 --username=postgres kosarev_space_test
```

Export matching test URLs for the application and fixture commands, then apply
the tracked migrations. These explicit values also cover processes that do not
load the development `.env`, including PDF generation:

```bash
export NUXT_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/kosarev_space_test
export CASE_CONTENT_TEST_DATABASE_URL="$NUXT_DATABASE_URL"
DATABASE_URL="$NUXT_DATABASE_URL" pnpm --filter @kosarev/database db:migrate
pnpm run check:full
```

Use the credentials and port you configured locally in place of this example.
The E2E fixture guard requires a loopback host and an effective database name
ending in `_test`; it checks the actual `pg` connection parameters before
connecting. E2E setup replaces its synthetic publication fixtures, so do not
point these commands at a database containing content you need to retain.

| Command | Effect |
|---|---|
| `pnpm run lint` | Run ESLint |
| `pnpm run lint:fix` | Run ESLint with automatic fixes |
| `pnpm run typecheck` | Type-check both workspace packages |
| `pnpm run test` | Run Vitest unit tests |
| `pnpm run test:content` | Test case-content and publication transactions in temporary schemas on `CASE_CONTENT_TEST_DATABASE_URL` |
| `pnpm run test:e2e` | Run Playwright smoke tests; starts Nuxt dev on port 3333 |
| `pnpm run build` | Build Nuxt, then generate both CV PDFs with Chromium |
| `pnpm run check:full` | Run lint, types, unit and content-transaction tests, E2E tests and build in sequence |
| `pnpm --filter @kosarev/web-app preview` | Serve an existing build with Nuxt preview |

`check:full` invokes plain lint, not `lint:fix`. E2E and PDF generation require
Chromium. Content tests require an explicitly selected local/test database;
they create and remove their own temporary schemas, without modifying the
application's tables. The PDF generator starts the built app and writes `cv.pdf` and
`cv-en.pdf` into `apps/web-app/.output/public`. CV content is static; the Docker
build has been validated without database credentials. Database-backed routes
still need a configured database and schema. For a standalone production
preview, check the migration-directory contract in the [deployment guide](docs/deploy.md).

## Public GitHub activity

Home reads `GET /api/activity`. Its 30-minute server snapshot uses Nitro's
`cache` storage, with background revalidation, a one-day stale limit and an
immediate empty fallback on cold starts. Storage persistence follows the Nitro
adapter; the default Node deployment cache is process-local and resets on
restart. Language bytes are cached separately for 24 hours. No GitHub request
blocks rendering. The browser revisits the snapshot after hydration and polls
once a minute.

`NUXT_GITHUB_TOKEN` is optional and server-only. Leave it empty for public REST
requests, or supply a read-only token through runtime environment configuration
to increase rate limits and enable the profile contribution calendar through GraphQL.
No private repository access is needed. Public owner listings, explicit visibility
checks and fork exclusion gate repository details even if a supplied token has
broader permissions. Never put a token in public runtime config or commit it.

REST activity is a labelled 90-day sample, not a complete contribution total:
up to six recent/mapped repositories, 100 default-branch commits and 100 PRs per
repo, plus public release events. Languages cover up to 40 verified public owned
repos. With a token, public activity covers up to 40 repos. Only the year calendar
uses `contributionCalendar`: 365 days and `totalContributions`, including
anonymous private counts when shared on the GitHub profile. No repository names
are requested by that query. Feed rows, project graphs, panels and languages
remain restricted to verified public repositories. Rate limits, API retention and truncation
can leave partial data; GraphQL failure falls back to REST. Project mappings
live in `apps/web-app/server/utils/activity-projects.ts`.

`NUXT_GITHUB_ACTIVITY_DISABLED=true` disables upstream activity requests and
returns the empty fallback. Playwright sets it for its test server; activity
browser tests intercept the API with public repository observations and a
synthetic year calendar fixture. Unit
and browser activity tests require no GitHub connection or token. Fixture
provenance and capture commands are in
[the canvas polish screenshots directory](docs/images/canvas-polish/README.md).

## Routes and repository layout

Pages are `/`, `/projects`, `/projects/[key]`, `/cases`, `/cases/[key]`, `/contact`, `/writing`, `/writing/[slug]`, `/cv` and `/cv/print`, with English equivalents
under `/en`. Writing feeds are `/writing/feed.xml` and `/en/writing/feed.xml`.
Download routes are `/cv.pdf` and `/cv-en.pdf`. Generated Open Graph images
are served from `/og/{ru|en}/...png`.

Writing reads published revisions from the existing PostgreSQL database. Notes,
digests and articles use one model and shared reading page. RU/EN Markdown,
titles, summaries and related work are saved through an operator command and
published as an exact reviewed revision; content-only updates need no build or
Git commit. Drafts are not returned by public APIs. The K39 article keeps its
existing address and original date. See the [publishing workflow](docs/publishing.md)
and [maintenance policy](docs/maintenance.md). No CMS or public write API exists.


The public case API exposes list/detail reads (`GET /api/cases` and
`GET /api/cases/[key]`), view recording (`POST /api/cases/[key]/view`) and
reaction changes (`POST /api/cases/[key]/react`). Internal repository creation
methods are not public CRUD endpoints. Case search supports shareable `q`,
`focus` and `tech` query parameters, with `all=1` exposing the full list. Contact
links are directly visible, with email copy/manual-selection feedback; there
is no contact-submission endpoint or `/book` page.

The unfiltered case index prioritizes the editorial keys in
[`case-finder.ts`](apps/web-app/app/utils/case-finder.ts), fills remaining slots
from available cases and shows at most six. Search and the full catalog keep
their database order. The reviewed bilingual content bundle is in
[`engineering-cases.json`](packages/database/content/engineering-cases.json).
It is applied separately from application deployment; see the
[case-content procedure](docs/deploy.md#case-content-updates).

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
separately labels the dated live Dokploy checks and operator-reported hosting. Current
workflows run CI and create GitHub Releases on `v*` tags; they do not publish
container packages or create GitHub Deployments. Existing historical GitHub
records are separate from the current workflow configuration.

## License

[MIT](LICENSE).

## Site agent

The header's Agent button opens a bilingual conversation drawer. Set the
server-only `NUXT_OPENROUTER_API_KEY` to enable answers and optionally override
`NUXT_AGENT_MODEL`. With no key, the drawer displays an offline state and a
contact link. See [site agent documentation](docs/site-agent.md) for the public
knowledge build, current publication/activity supplements, proxy configuration,
limits and provider-free browser tests.
