# Deferred work ledger — paadel.app

### DW-1: Audit log is in-memory only

origin: MVP1 gap audit, 2026-07-30
location: packages/audit-log/src/index.ts
severity: high
reason: createAuditLog() returns InMemoryAuditLog; audit entries are lost on API restart and MVP1 requires durable audit for key actions.
status: done 2026-07-30
resolution: DrizzleAuditLog wired in API routes; audit_events table persisted via story 1.5

### DW-2: No automated tests

origin: MVP1 gap audit, 2026-07-30
location: apps/api
severity: high
reason: zero test files in repo; MVP1 verification requires API integration coverage at minimum.
status: done 2026-07-30
resolution: health contract test + match-invite integration suite (`test:integration`); CI runs unit tests via turbo

### DW-3: R2 upload smoke not implemented

origin: phase D fail-fast checklist, 2026-07-30
location: packages/
severity: medium
reason: R2 env vars exist in Doppler but no upload helper or smoke check wired.
status: done 2026-07-30
resolution: `GET /health/r2` smoke via `apps/api/src/lib/r2.ts`; prefix enforced via `R2_PREFIX` / `APP_ENV`

### DW-4: WebSocket smoke not implemented

origin: phase D fail-fast checklist, 2026-07-30
location: packages/ws-protocol
severity: medium
reason: ws-protocol package exists but API has no WS route and smoke.sh skips handshake test.
status: done 2026-07-30
resolution: baseline WS route in API; smoke.sh exercises handshake (story 1.7)

### DW-5: Dev deploy not yet verified live

origin: Coolify deploy wait, 2026-07-30
location: docker-compose.yaml
severity: high
reason: api-paadel-app-dev and paadel-app-dev returned 503 during deploy; end-to-end dev verification pending.
status: done 2026-07-30
resolution: web 200 at paadel-app-dev.dioilham.com; api /health 200 at api-paadel-app-dev.dioilham.com; /login /signup /app 200; unauth /matches 401 as expected

### DW-6: Local Docker unavailable in WSL agent session

origin: smoke.sh run, 2026-07-30
location: scripts/smoke.sh
severity: medium
reason: docker CLI not found in WSL2 distro; Postgres/Redis/migrate smoke checks fail locally until Docker Desktop WSL integration is enabled.
status: done 2026-07-30
resolution: Docker Desktop WSL integration enabled; use `docker-compose.yml` (published ports) for local Postgres/Redis

### DW-7: CI pipeline was stub-only

origin: epic 1 story 1.10, 2026-07-30
location: .github/workflows/ci.yml
severity: medium
reason: lint/test jobs echoed stubs instead of running biome and turbo.
status: done 2026-07-30
resolution: workflow runs `bun run lint`, `typecheck`, `test`, `build`; aggregate `ci` job for branch protection

### DW-8: Env var naming drift (DB_URL, CORS, OAuth prefix)

origin: env hardening pass, 2026-07-30
location: packages/env
severity: low
reason: mixed legacy names (`DATABASE_URL`, `GITHUB_*`, `CORS_ORIGIN`) vs tier-aware schema.
status: done 2026-07-30
resolution: `APP_ENV` tier, `DB_URL`, `API_CORS_ORIGIN`, `OAUTH_GITHUB_*`; canonical schema in `packages/env`, local template in `.env.example`
