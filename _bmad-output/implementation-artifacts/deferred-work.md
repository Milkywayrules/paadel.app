# Deferred work ledger — paadel.app

### DW-1: Audit log is in-memory only

origin: MVP1 gap audit, 2026-07-30
location: packages/audit-log/src/index.ts
severity: high
reason: createAuditLog() returns InMemoryAuditLog; audit entries are lost on API restart and MVP1 requires durable audit for key actions.
status: open

### DW-2: No automated tests

origin: MVP1 gap audit, 2026-07-30
location: apps/api
severity: high
reason: zero test files in repo; MVP1 verification requires API integration coverage at minimum.
status: open

### DW-3: R2 upload smoke not implemented

origin: phase D fail-fast checklist, 2026-07-30
location: packages/
severity: medium
reason: R2 env vars exist in Doppler but no upload helper or smoke check wired.
status: open

### DW-4: WebSocket smoke not implemented

origin: phase D fail-fast checklist, 2026-07-30
location: packages/ws-protocol
severity: medium
reason: ws-protocol package exists but API has no WS route and smoke.sh skips handshake test.
status: open

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
status: open
