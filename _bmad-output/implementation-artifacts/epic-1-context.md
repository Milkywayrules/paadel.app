# Epic 1 Context: MVP1 completion and verification

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Ship the player match-invite loop on dev/stg with tests, infra smoke, and deploy verification. This epic closes MVP1 by hardening the vertical slice already built (API, web UI, deploy stack) with durable audit storage, infrastructure smoke checks, automated API tests, live dev verification, and a CI pipeline.

## Stories

- Story 1.1: Monorepo scaffold and env guards
- Story 1.2: Match and invite API vertical slice
- Story 1.3: Web create, accept, and history UI
- Story 1.4: Docker and Coolify deploy stack
- Story 1.5: Persist audit log to PostgreSQL
- Story 1.6: R2 prefix smoke integration
- Story 1.7: WebSocket handshake smoke
- Story 1.8: API integration tests
- Story 1.9: Dev deploy verification
- Story 1.10: CI pipeline

## Requirements & Constraints

Planning artifacts were unavailable; only epics-file context was used.

- Complete the end-to-end player match-invite loop (create match, share invite link, accept/decline, list/history) on dev and staging.
- Replace in-memory audit logging with durable persistence for create, invite, accept, and join actions.
- Prove infrastructure integrations via smoke checks: PostgreSQL audit writes, R2 upload/read with environment prefix enforcement (`dev/`), and a baseline WebSocket handshake.
- Add API integration test coverage for match create, invite, accept, and list flows.
- Verify the live dev deployment (health, auth signup, full match flow) at `paadel-app-dev.dioilham.com`.
- CI on pull requests must run typecheck, lint, and build.

## Technical Decisions

- Turborepo monorepo with shared packages, Biome, and Lefthook; env guards at startup.
- Elysia API routes for match and invite operations; Mantine web shell for create, invite accept, and matches list.
- Docker/Coolify deploy stack (Dockerfile, docker-compose, deploy compose).
- Audit log backed by PostgreSQL (replacing in-memory store).
- R2 storage uses a single bucket with per-environment path prefixes.
- WebSocket baseline route uses the shared `packages/ws-protocol`; smoke exercised via `scripts/smoke.sh`.
- GitHub Actions for PR checks (typecheck, lint, build).

## UX & Interaction Patterns

- Core player flows: create a match, share an invite link, accept or decline an invite, view match history.
- Web app provides the create flow, dedicated invite page, and matches list within the Mantine app shell.

## Cross-Story Dependencies

- Stories 1.1–1.4 (scaffold, API slice, web UI, deploy stack) are done and form the foundation for all remaining work.
- Stories 1.5–1.7 (audit persistence, R2 smoke, WebSocket smoke) can proceed in parallel once the deploy stack exists; they gate confidence in infra before full verification.
- Story 1.8 (API integration tests) depends on the API vertical slice (1.2) and benefits from durable audit (1.5) for realistic persistence.
- Story 1.9 (dev deploy verification) depends on deploy stack (1.4) and the working match-invite loop (1.2, 1.3).
- Story 1.10 (CI pipeline) applies repo-wide and should pass once build/lint/typecheck succeed across completed packages.
