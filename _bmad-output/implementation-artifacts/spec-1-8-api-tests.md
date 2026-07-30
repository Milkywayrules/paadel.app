---
title: 'API integration tests for match-invite flow'
type: 'feature'
created: '2026-07-30'
status: 'awaiting-operator'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: '129c26fff624b6fbf81c2026b558a5e0a2557bcd'
final_revision: '7fb97ca'
operator_actions:
  - 'Start local PostgreSQL and Redis with `docker compose up -d` (or equivalent) so `DATABASE_URL` in `.env` is reachable.'
  - 'Apply database migrations with `bun run db:migrate` against the local database.'
  - 'Run `bun run --filter @paadel/api test:integration` and confirm all integration tests pass.'
context:
  - '{project-root}/apps/api/src/routes/matches.ts'
  - '{project-root}/packages/domain/src/index.ts'
warnings: []
---

<intent-contract>

## Intent

**Problem:** The match-invite API vertical slice has no automated integration coverage; regressions in create, invite, accept, and list flows would only surface via manual smoke or deploy checks.

**Approach:** Add Bun integration tests that exercise the Elysia app in-process against PostgreSQL, using Better Auth sign-up for session cookies and asserting HTTP status, response envelopes, participant state, and durable audit events.

## Boundaries & Constraints

**Always:** Use existing Bun test runner; keep `createApp()` factory separate from `.listen()`; truncate test tables between cases; mirror `{ data }` response shapes from production routes; assert audit actions `match.created`, `invite.sent`, `player.joined`, `invite.accepted` on the happy path.

**Block If:** Choosing a different test runner or mocking the database instead of integration tests against PostgreSQL.

**Never:** Add Vitest/Jest; import `index.ts` in tests (side-effect listen); commit secrets; wire CI services in this story (story 1.10 owns CI).

</intent-contract>

## Code Map

- `apps/api/src/index.ts` -- production entrypoint calling `createApp().listen()`
- `apps/api/src/app.ts` -- `createApp()` factory for in-process tests
- `apps/api/src/routes/matches.ts` -- match and invite route handlers under test
- `apps/api/src/plugins/session.ts` -- Better Auth session derive + `requireAuth`
- `packages/auth/src/index.ts` -- Better Auth instance mounted on API
- `packages/db/src/index.ts` -- Drizzle client and schema exports
- `packages/audit-log/src/drizzle.ts` -- `listByResource` for audit assertions
- `apps/api/src/health.test.ts` -- contract stub (non-integration)

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/src/app.ts` -- export `createApp()` with all routes except `.listen()` -- enables in-process `app.handle()` tests
- [x] `apps/api/src/index.ts` -- call `createApp().listen(...)` only -- preserve production entrypoint
- [x] `apps/api/src/test/preload.ts` -- load root `.env`, set `NODE_ENV=test` -- env before `@paadel/db` import
- [x] `apps/api/src/test/helpers.ts` -- `resetDb`, `signupUser`, `apiRequest`, audit query helpers -- shared test harness
- [x] `apps/api/src/integration/matches.flow.ts` -- happy path + auth/forbidden/conflict cases -- core story coverage
- [x] `apps/api/package.json` -- `test:integration` script with preload -- run integration suite separately from contract stub

**Acceptance Criteria:**
- Given a clean database and running PostgreSQL, when the integration suite runs, then create → invite → preview → accept → list completes with expected statuses and both players see the match
- Given an unauthenticated client, when `GET /matches` is called, then the response status is 401
- Given a non-host player, when `POST /matches/:id/invites` is called, then the response status is 403
- Given an expired invite token, when accept is attempted, then the response status is 410
- Given a full match, when another player accepts an invite, then the response status is 409
- Given a pending invite already accepted, when accept is called again, then the response status is 409
- Given the happy-path flow, when audit events are queried, then `match.created`, `invite.sent`, `player.joined`, and `invite.accepted` are recorded on the correct resources

## Spec Change Log

## Review Triage Log

### 2026-07-30 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 5: (high 0, medium 4, low 1)
- defer: 2: (high 1, medium 1, low 0)
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` moved integration suite to `integration/matches.flow.ts` so default `bun test` does not run destructive truncates
  - `[medium]` `[patch]` added `organizations` to `resetDb` truncate list and `NODE_ENV=test` guard
  - `[medium]` `[patch]` made `apiRequest` tolerate non-JSON error bodies
  - `[medium]` `[patch]` strengthened participant-count assertions and expired-invite preview check
  - `[low]` `[patch]` removed non-null assertions in audit helper usage

## Design Notes

Integration tests live in `src/integration/matches.flow.ts` (no `.test.ts` suffix) so only `test:integration` discovers them. `resetDb` truncates all application and auth tables with CASCADE when `NODE_ENV=test`.

## Verification

**Commands:**
- `bun run --filter @paadel/api typecheck` -- expected: zero errors (passed)
- `bun run --filter @paadel/api test` -- expected: health contract test passes (passed)
- `bun run --filter @paadel/api test:integration` -- expected: all integration tests pass (blocked: PostgreSQL not running on agent host; ECONNREFUSED on port 5432)

## Auto Run Result

Implemented API integration test harness for the match-invite vertical slice: `createApp()` factory, test preload/helpers, and a six-case integration suite covering create → invite → preview → accept → list plus 401/403/410/409 paths with audit assertions.

**Files changed:**
- `apps/api/src/app.ts` — Elysia app factory without `.listen()`
- `apps/api/src/index.ts` — slim production bootstrap
- `apps/api/src/test/preload.ts` — test env bootstrap from root `.env`
- `apps/api/src/test/helpers.ts` — DB reset, auth signup, HTTP helper, audit queries
- `apps/api/src/integration/matches.flow.ts` — integration test suite
- `apps/api/package.json` — split `test` vs `test:integration` scripts

**Review:** five patch fixes applied (isolation, truncate scope, JSON parsing, assertions, lint). Deferred: concurrent runs against shared DB without advisory lock; preload silent failure when `.env` missing.

**Verification:** typecheck and health test passed locally. Integration suite not executed end-to-end — local PostgreSQL unavailable in the agent environment.

**Residual risk:** operator must run integration tests against a migrated local database before marking story done; CI wiring remains in story 1.10.
