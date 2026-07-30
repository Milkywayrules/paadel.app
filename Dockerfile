# syntax=docker/dockerfile:1

FROM oven/bun:1.3 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/*/package.json packages/
RUN bun install --frozen-lockfile

FROM deps AS build
COPY . .
ENV SKIP_ENV_VALIDATION=true
ENV NEXT_PUBLIC_APP_URL=https://paadel-app-dev.dioilham.com
ENV NEXT_PUBLIC_API_URL=https://api-paadel-app-dev.dioilham.com
RUN bun run build

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
