# syntax=docker/dockerfile:1

FROM oven/bun:1.3 AS base
WORKDIR /app

# Install dependencies — each workspace package.json must keep its path (no globs).
FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/audit-log/package.json packages/audit-log/
COPY packages/auth/package.json packages/auth/
COPY packages/config/package.json packages/config/
COPY packages/db/package.json packages/db/
COPY packages/domain/package.json packages/domain/
COPY packages/email/package.json packages/email/
COPY packages/env/package.json packages/env/
COPY packages/ui/package.json packages/ui/
COPY packages/ws-protocol/package.json packages/ws-protocol/
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
ARG NEXT_PUBLIC_APP_URL=https://paadel-app-dev.dioilham.com
ARG NEXT_PUBLIC_API_URL=https://api-paadel-app-dev.dioilham.com
ENV SKIP_ENV_VALIDATION=true
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN bun run build

FROM deps AS migrate
COPY packages/db ./packages/db
COPY packages/config ./packages/config
CMD ["bun", "run", "db:migrate"]

FROM oven/bun:1.3-slim AS api
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/bun.lock /app/turbo.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api ./apps/api
COPY --from=build /app/packages ./packages
EXPOSE 3001
CMD ["bun", "run", "--filter", "@paadel/api", "start"]

FROM oven/bun:1.3-slim AS web
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/bun.lock /app/turbo.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/web ./apps/web
COPY --from=build /app/packages ./packages
EXPOSE 3000
CMD ["bun", "run", "--filter", "@paadel/web", "start"]
