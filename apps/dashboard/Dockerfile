# Build context is the monorepo root (see docker-compose.yml), so pnpm can
# resolve the workspace lockfile shared with apps/api.
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
RUN pnpm install --frozen-lockfile

COPY apps/dashboard apps/dashboard

# Vite inlines VITE_* variables at build time, so they must be passed as
# build args (see docker-compose.yml), not runtime environment variables.
ARG VITE_APP_STAGE=production
ARG VITE_BASE_URL=http://localhost:8000
ARG VITE_LOCAL_STORAGE_KEY=fresh_dashboard_token
ARG VITE_UPLOAD_FILE_URL=
ARG VITE_TOKEN_KEY_LOCAL_STORAGE=fresh_dashboard_token
ARG VITE_TOKEN_SECRET=
ENV VITE_APP_STAGE=$VITE_APP_STAGE \
    VITE_BASE_URL=$VITE_BASE_URL \
    VITE_LOCAL_STORAGE_KEY=$VITE_LOCAL_STORAGE_KEY \
    VITE_UPLOAD_FILE_URL=$VITE_UPLOAD_FILE_URL \
    VITE_TOKEN_KEY_LOCAL_STORAGE=$VITE_TOKEN_KEY_LOCAL_STORAGE \
    VITE_TOKEN_SECRET=$VITE_TOKEN_SECRET

RUN pnpm --filter @fresh-ecommerce/dashboard run build

FROM nginx:1.27-alpine AS runner
COPY apps/dashboard/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/dashboard/build /usr/share/nginx/html

EXPOSE 80
