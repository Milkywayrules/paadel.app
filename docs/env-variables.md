# Environment variables

Operator runbook for `paadel.app`. Canonical local template: `.env.example`.

## Two axes

| Variable | Meaning | Typical values |
| -------- | ------- | -------------- |
| `NODE_ENV` | Node/runtime mode | `development` (local), `production` (Docker/Coolify), `test` (CI) |
| `APP_ENV` | Deployment tier / Doppler config | `dev`, `stg`, `preview`, `prod` |

Example: Coolify runs `NODE_ENV=production` (optimized build) with `APP_ENV=dev` (dev URLs and feature gates).

## Doppler configs

One Doppler config per tier. Set `APP_ENV` to match the config name.

| Doppler config | `APP_ENV` | `R2_PREFIX` |
| -------------- | --------- | ----------- |
| `dev` | `dev` | `dev/` |
| `stg` | `stg` | `stg/` |
| `prod` | `prod` | `prod/` |
| PR preview (optional) | `preview` | `stg/` (shared prefix — set explicit `R2_PREFIX` if you add `preview/`) |

## Key reference

### Tier

| Key | Required | Notes |
| --- | -------- | ----- |
| `APP_ENV` | yes (deploy) | `dev` \| `stg` \| `preview` \| `prod` |
| `NODE_ENV` | optional in Doppler | Compose sets `production` on api/web |

### Auth (Better Auth on API)

| Key | Required | Notes |
| --- | -------- | ----- |
| `BETTER_AUTH_SECRET` | yes | Min 32 chars; unique per tier |
| `BETTER_AUTH_URL` | yes | Public API base, e.g. `https://api-paadel-app-dev.dioilham.com` |
| `OAUTH_GITHUB_CLIENT_ID` | stg/prod | Use `OAUTH_GITHUB_*` — **not** `GITHUB_*` (GitHub Actions reserved prefix) |
| `OAUTH_GITHUB_CLIENT_SECRET` | stg/prod | Mask in Doppler |
| `OAUTH_GITHUB_ENABLED` | dev only | Must be `true` to enable GitHub OAuth when `APP_ENV=dev` |

GitHub OAuth callback: `{BETTER_AUTH_URL}/api/auth/callback/github`

### Web (Next.js — **build time**)

| Key | Required | Notes |
| --- | -------- | ----- |
| `NEXT_PUBLIC_APP_URL` | yes | Web origin |
| `NEXT_PUBLIC_API_URL` | yes | API origin (auth client base URL) |
| `NEXT_PUBLIC_OAUTH_GITHUB_ENABLED` | no | `true` \| `false` — hides GitHub button; must match server intent |

Next.js inlines `NEXT_PUBLIC_*` at **Docker build**. Pass them as **build args** (see `docker-compose.deploy.yml`), not only runtime env.

### API

| Key | Required | Notes |
| --- | -------- | ----- |
| `API_CORS_ORIGIN` | yes | Web origin (must match `NEXT_PUBLIC_APP_URL`) |

`API_HOST` and `API_PORT` are hardcoded in compose (`0.0.0.0` / `3001`) — not needed in Doppler.

### Database (compose deploy)

| Key | Required | Notes |
| --- | -------- | ----- |
| `POSTGRES_PASSWORD` | yes | Compose builds `DB_URL` internally |

Compose also fixes: user `paadel`, database name `paadel`, host `postgres`. Tables live in PostgreSQL schema `public` (Drizzle default).

Local dev: set full `DB_URL` in `.env` instead of `POSTGRES_PASSWORD`.

### Cache

| Key | Required | Notes |
| --- | -------- | ----- |
| `REDIS_URL` | local only | Compose sets `redis://redis:6379` for deploy |

### Email / storage / observability

| Key | Required | Notes |
| --- | -------- | ----- |
| `RESEND_API_KEY` | optional | Mask in Doppler |
| `EMAIL_FROM` | yes | e.g. `Paadel <noreply@paadel.app>` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | optional | See ADR 0003 |
| `R2_BUCKET_NAME` | optional | Default `bucket---paadel-app` |
| `R2_PREFIX` | yes (deploy) | Must match tier |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | optional | |

### Tooling only (do not set in Doppler for runtime)

| Key | Used by |
| --- | ------- |
| `ENV_SKIP_VALIDATION` | CI, migrate job, Docker build |
| `CI` | GitHub Actions |

## OAuth behavior (`packages/env/src/features.ts`)

| `APP_ENV` | GitHub OAuth on API when |
| --------- | ------------------------ |
| `dev` | Creds present **and** `OAUTH_GITHUB_ENABLED=true` |
| `stg`, `preview`, `prod` | Creds present |
| `stg`, `prod` | Startup **fails** if creds missing (unless validation skipped) |

Align web UI: set `NEXT_PUBLIC_OAUTH_GITHUB_ENABLED=true` when GitHub login should appear.

## Per-tier URL alignment

These three must match for auth and CORS:

```text
NEXT_PUBLIC_APP_URL  = API_CORS_ORIGIN  = web origin
BETTER_AUTH_URL      = NEXT_PUBLIC_API_URL = API origin
```

## Doppler → GitHub Actions sync

Safe to sync `OAUTH_GITHUB_*` (no `GITHUB_` prefix). Mask secrets in Doppler so they become GitHub Actions **Secrets**. CI only needs `ENV_SKIP_VALIDATION=true` (already in workflow) unless you add integration tests with real services.

## Compose files

| File | Purpose |
| ---- | ------- |
| `docker-compose.yml` | Local Postgres + Redis only |
| `docker-compose.deploy.yml` | Full stack for Coolify (canonical deploy) |

## Doppler: where secrets go

Doppler is the **source of truth** for values. How they reach each runtime differs:

| Target | Typical setup | Used for |
| ------ | ------------- | -------- |
| **GitHub Actions** | Doppler UI → sync to repo (what you configured) | CI jobs (`ENV_SKIP_VALIDATION`, future integration tests) |
| **Coolify (VPS deploy)** | Coolify env UI fed from Doppler (copy, CLI, or Coolify↔Doppler integration) | `docker compose -f docker-compose.deploy.yml` at deploy |
| **Local dev** | Root `.env` or `doppler run -- bun dev` | Host-run API/web against local compose DB |

GitHub Actions sync does **not** inject env into Coolify containers automatically — that is a separate path. Compose `${VAR}` placeholders expect vars in the **shell/env where compose runs** (Coolify deploy), not from GitHub unless your deploy pipeline explicitly passes them.

## Rename map (legacy → current)

| Old | New |
| --- | --- |
| `DATABASE_URL` | `DB_URL` (local) / compose-built URL (deploy) |
| `CORS_ORIGIN` | `API_CORS_ORIGIN` |
| `GITHUB_CLIENT_ID` | `OAUTH_GITHUB_CLIENT_ID` |
| `GITHUB_CLIENT_SECRET` | `OAUTH_GITHUB_CLIENT_SECRET` |
| `SKIP_ENV_VALIDATION` | `ENV_SKIP_VALIDATION` |
