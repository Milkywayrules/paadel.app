# Epic 1 — MVP1 completion and verification

**Goal:** Ship the player match-invite loop on dev/stg with tests, infra smoke, and deploy verification.

## Story 1.1 — Monorepo scaffold and env guards

**Status:** done  
Core Turborepo monorepo, packages, biome/lefthook, env guards.

## Story 1.2 — Match and invite API vertical slice

**Status:** done  
Elysia routes for create match, invite link, accept/decline, list/history.

## Story 1.3 — Web create, accept, and history UI

**Status:** done  
Mantine app shell, create flow, invite page, matches list.

## Story 1.4 — Docker and Coolify deploy stack

**Status:** done  
Dockerfile, docker-compose.yaml, deploy compose; dev deploy in progress.

## Story 1.5 — Persist audit log to PostgreSQL

**Status:** done  
Replace in-memory audit log with durable DB writer; record create/invite/accept/join.

## Story 1.6 — R2 prefix smoke integration

**Status:** done  
Minimal upload/read helper with env prefix enforcement (`dev/`).

## Story 1.7 — WebSocket handshake smoke

**Status:** done  
Baseline WS route using `packages/ws-protocol`; smoke test in scripts/smoke.sh.

## Story 1.8 — API integration tests

**Status:** done  
Cover match create, invite, accept, list with test DB or harness.

## Story 1.9 — Dev deploy verification

**Status:** done  
Verify health, auth signup, match flow on `paadel-app-dev.dioilham.com`.

## Story 1.10 — CI pipeline

**Status:** done  
GitHub Actions: typecheck, lint, build on PR.
