# FRESH Ecommerce

FRESH Ecommerce is a full e-commerce platform built as a monorepo. It has three parts that work together:

- **API** — the backend server that stores data and handles all the business logic (products, orders, payments, shipping, and an AI-powered chat assistant).
- **Dashboard** — an admin panel where staff manage products, orders, customers, and settings.
- **Storefront** — the public website where customers browse and buy products.

> Proprietary project — see [LICENSE](./LICENSE). Internal use only.

## What's inside

```
.
├── apps/
│   ├── api/          Express + TypeScript backend (REST API, background workers, database)
│   ├── dashboard/     React + Vite admin panel
│   └── storefront/    Next.js customer-facing website
├── docker-compose.yml Runs everything together with Docker
├── turbo.json         Turborepo task runner config (build/dev/lint for all apps at once)
└── pnpm-workspace.yaml
```

Each app has its own README with more details specific to that app:

- [apps/api/README.md](./apps/api/README.md)
- [apps/dashboard/README.md](./apps/dashboard/README.md)

## How the API is organized

The API is the core of the system. A few things worth knowing:

- **Database**: MySQL, accessed through [Sequelize](https://sequelize.org) models, with migrations for schema changes.
- **Background jobs**: [BullMQ](https://docs.bullmq.io) (powered by Redis) handles slow tasks in the background instead of blocking requests — for example:
  - `productEmbeddingQueue` / `productFileQueue` — process product data and files.
  - `faqEmbeddingQueue` — process FAQ content.
- **AI features**: The API includes an AI chat assistant (see `Chat.service.ts` and `ChatTools.service.ts`) that uses vector embeddings (stored in [Pinecone](https://www.pinecone.io)) so it can answer questions about products and FAQs.
- **Payments & shipping**: integrations for Midtrans (payments), BiteShip (shipping), and Wablas (WhatsApp notifications) — see `services/external`.

Main folders inside `apps/api/src`:

| Folder | Purpose |
| --- | --- |
| `routes` | API endpoints (one file per resource, e.g. `Product.route.ts`, `Order.route.ts`) |
| `controllers` | Handles incoming requests and sends responses |
| `services` | The actual business logic (talks to the database, external APIs, etc.) |
| `models` | Database tables, defined with Sequelize |
| `middlewares` | Request checks like authentication |
| `queues` / `worker` | Background job definitions and the workers that run them |
| `schemas` | Validation rules for request data |

## Prerequisites

Before you start, make sure you have:

- **Node.js 20+** (the exact version is in [`.nvmrc`](./.nvmrc))
- **pnpm** — install it with `corepack enable` or `npm i -g pnpm`
- **MySQL** — used by the API to store data
- **Redis** — used by the API for background job queues

If you don't want to install MySQL/Redis yourself, skip to [Running with Docker](#running-with-docker) below — Docker sets everything up for you.

## Getting started (running locally without Docker)

1. **Install dependencies** for all apps at once, from the repo root:

   ```bash
   pnpm install
   ```

2. **Copy the environment files** and fill in real values (database credentials, API keys, etc.):

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/dashboard/.env.example apps/dashboard/.env
   ```

   Check `apps/storefront` for its own `.env.example` if it has one, and copy it the same way.

3. **Start the apps.** You can run everything together, or just the one you're working on:

   ```bash
   pnpm dev              # run every app at once
   pnpm dev:api          # only the backend API
   pnpm dev:dashboard    # only the admin dashboard
   pnpm dev:storefront   # only the customer storefront
   ```

## Common commands

All of these run from the repo root and are powered by [Turborepo](https://turbo.build), which runs the same command across every app.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Runs every app in development mode, all at once |
| `pnpm dev:api` | Runs only the API |
| `pnpm dev:dashboard` | Runs only the dashboard |
| `pnpm dev:storefront` | Runs only the storefront |
| `pnpm build` | Builds every app for production |
| `pnpm lint` | Checks code style in every app |
| `pnpm lint:fix` | Same as above, but auto-fixes what it can |
| `pnpm typecheck` | Checks for TypeScript type errors in every app |
| `pnpm test` | Runs the test suite (mainly in the API) |

Want to run a command for just one app? Use `--filter`, for example:

```bash
pnpm --filter @fresh-ecommerce/api run migrate:up
```

## Working with the database (API)

The API uses Sequelize migrations to manage the database schema. From `apps/api`, or using `--filter` from the root:

```bash
pnpm --filter @fresh-ecommerce/api run migrate:up    # apply migrations
pnpm --filter @fresh-ecommerce/api run migrate:undo   # undo the last migration
pnpm --filter @fresh-ecommerce/api run seed           # insert sample/starter data
```

## Running with Docker

This is the easiest way to try the whole platform — it starts MySQL, Redis, the API, and the dashboard together, so you don't need to install anything locally besides Docker.

1. Copy the environment files:

   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env   # fill in real secrets: Wablas, Midtrans, BiteShip, tokens, etc.
   ```

2. Start everything:

   ```bash
   docker compose up -d --build
   ```

3. Open the apps in your browser:

   - Dashboard: http://localhost:5173
   - API: http://localhost:8000

**Good to know:**

- `docker-compose.yml` automatically points the API to the `mysql` and `redis` containers (overriding `DB_HOST`/`REDIS_HOST` from your `.env`). Every other value in `apps/api/.env` (API keys, tokens, etc.) is used exactly as you wrote it.
- The dashboard's `VITE_*` variables get baked into the app at build time (from the root `.env`). If you change them, you need to rebuild: `docker compose up -d --build dashboard`.

Run database migrations/seeders inside the running containers:

```bash
docker compose exec api npx sequelize-cli db:migrate
docker compose exec api npx sequelize-cli db:seed:all
```

Other useful Docker commands:

```bash
docker compose logs -f api      # watch the API's logs live
docker compose down             # stop everything
docker compose down -v          # stop everything AND delete the database/Redis data
```

## Contributing

- Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org) (e.g. `fix: correct order total calculation`). This is checked automatically by commitlint.
- Code is automatically linted before each commit (via husky + lint-staged), so obvious style issues get caught early.
- Open pull requests against the `master` branch. CI will run lint, typecheck, and build checks on your changes.
