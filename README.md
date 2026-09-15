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

## Contributing

- Commits follow [Conventional Commits](https://www.conventionalcommits.org) (enforced by commitlint).
- `lint-staged` runs on pre-commit via husky.
- Open a PR against `master`; CI runs lint, typecheck, and build for both apps.
