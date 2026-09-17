# Build context is the monorepo root (see docker-compose.yml), so pnpm can
# resolve the workspace lockfile shared with apps/dashboard.
FROM node:22-slim AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
RUN pnpm --filter @fresh-ecommerce/api run build
RUN pnpm --filter @fresh-ecommerce/api deploy --prod /repo/out/api

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /repo/out/api/node_modules ./node_modules
COPY --from=build /repo/apps/api/build ./build
COPY --from=build /repo/apps/api/package.json ./package.json
COPY --from=build /repo/apps/api/resources ./resources
COPY --from=build /repo/apps/api/.sequelizerc ./.sequelizerc

EXPOSE 8000
CMD ["node", "build/src/server.js"]
