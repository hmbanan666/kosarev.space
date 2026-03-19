# kosarev.space

Personal portfolio and CV website — [kosarev.space](https://kosarev.space)

![Preview](apps/web-app/public/preview.png)

## Stack

- **Nuxt 4** + **Vue 3** + **TypeScript**
- **Nuxt UI v4** + **Tailwind CSS v4**
- **PostgreSQL** + **Drizzle ORM**
- **i18n** — Russian / English
- **Playwright** — E2E tests + CV PDF generation
- **Vitest** — unit tests
- **Docker** + **Kubernetes** — deployment
- **GitHub Actions** — CI/CD

## Setup

```bash
pnpm install
```

Copy env files and fill in values:

```bash
cp apps/web-app/.env.example apps/web-app/.env
cp packages/database/.env.example packages/database/.env
```

### Database

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
| `pnpm run check:full` | All checks at once |

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

## License

MIT
