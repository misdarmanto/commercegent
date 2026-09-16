# FRESH Ecommerce

Monorepo for the FRESH Ecommerce platform: the backend API and the admin dashboard.

> Proprietary project — see [LICENSE](./LICENSE). Internal use only.

## Structure

```
.
├── apps/
│   ├── api/         Express + TypeScript backend (REST API, workers, DB migrations)
│   └── dashboard/    React + Vite admin dashboard
├── turbo.json        Turborepo task pipeline
└── pnpm-workspace.yaml
```

Each app keeps its own README with app-specific details:

- [apps/api/README.md](./apps/api/README.md)
- [apps/dashboard/README.md](./apps/dashboard/README.md)

## Prerequisites

- Node.js 20+ (see [`.nvmrc`](./.nvmrc))
- [pnpm](https://pnpm.io) 9+ (`corepack enable` or `npm i -g pnpm`)
- MySQL (for the API) and Redis (for background queues)

## Getting started

```bash
pnpm install

# copy env files and fill in the values
cp apps/api/.env.example apps/api/.env
cp apps/dashboard/.env.example apps/dashboard/.env
```

## Common scripts

Run from the repo root (powered by [Turborepo](https://turbo.build)):

| Command                | Description                                   |
| ----------------------- | ---------------------------------------------- |
| `pnpm dev`              | Run every app in dev mode, in parallel         |
| `pnpm dev:api`          | Run only the API in dev mode                   |
| `pnpm dev:dashboard`    | Run only the dashboard in dev mode             |
| `pnpm build`            | Build every app                                |
| `pnpm lint`             | Lint every app                                 |
| `pnpm typecheck`        | Type-check every app                           |

You can also target a single workspace directly, e.g. `pnpm --filter @fresh-ecommerce/api run migrate:up`.

## Running with Docker

Spins up MySQL, Redis, the API, and the dashboard together — no local Node/MySQL/Redis install required.

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env   # fill in real secrets (Wablas, Midtrans, BiteShip, tokens, ...)

docker compose up -d --build
```

- Dashboard: http://localhost:5173
- API: http://localhost:8000

`docker-compose.yml` overrides `DB_HOST`/`REDIS_HOST` in `apps/api/.env` so the API talks to the `mysql`/`redis` containers — everything else in that file (API keys, tokens) is used as-is via `env_file`.

Run migrations/seeders against the containerized database:

```bash
docker compose exec api npx sequelize-cli db:migrate
docker compose exec api npx sequelize-cli db:seed:all
```

The dashboard's `VITE_*` variables are baked in at build time (see root `.env`), so change them there and re-run `docker compose up -d --build dashboard` rather than editing anything post-build.

```bash
docker compose logs -f api      # tail one service
docker compose down             # stop (add -v to also wipe DB/Redis volumes)
```

## Contributing

- Commits follow [Conventional Commits](https://www.conventionalcommits.org) (enforced by commitlint).
- `lint-staged` runs on pre-commit via husky.
- Open a PR against `master`; CI runs lint, typecheck, and build for both apps.
