# Paadel.app — Tech Stack (canonical snapshot)

> **Precedence:** This file wins over chat for stack disputes. When updating, follow precedence order below — never silently override higher tiers.

## Precedence order (highest wins)

1. **King's draft** — orchestrator prompt + locked thread decisions (`.dump/paadel-phase0-orchestrator-prompt.md`)
2. **`knowledge-base-of-king-the-user/docs/personal/tech-stack.md`** — merge where draft is silent
3. **`knowledge-base-of-king-the-user/docs/verasic-labs/tech-stack.md`** — gap-fill reference ONLY; never override 1 or 2

## Locked overrides (draft wins over personal doc)

| Area                        | Choice              | Notes                                                                                    |
| --------------------------- | ------------------- | ---------------------------------------------------------------------------------------- |
| UI                          | **Mantine only**    | Primary component system via `packages/ui`. Do **not** adopt shadcn/Tailwind as primary. |
| Forms                       | **react-hook-form** | With Zod resolver                                                                        |
| Client state                | **zustand**         | Only when needed — not by default everywhere                                             |
| Verasic Laravel/Vue/Flutter | Reference only      | Not product stack                                                                        |

## Full stack

| Layer                     | Choice                                                                                                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime / package manager | **Bun** (local dev; optimize dev/stg/prod consistently)                                                                                                                                              |
| Monorepo                  | **Turborepo**                                                                                                                                                                                        |
| Language                  | **Strict TypeScript**                                                                                                                                                                                |
| Web                       | **Next.js App Router**, **client-first** — app features via client components + TanStack Query → Elysia API; **no Server Actions / RSC data fetching** for app features                              |
| Data fetching / URL state | **TanStack Query**, **nuqs**                                                                                                                                                                         |
| API                       | **Elysia** (compiled) + Zod everywhere + **Scalar** + **OpenTelemetry**                                                                                                                              |
| Validation / types        | **Zod** — infer types from Zod; avoid hand-written interfaces where Zod applies                                                                                                                      |
| Logging                   | **evlog** drain                                                                                                                                                                                      |
| DB                        | **PostgreSQL** + **Drizzle ORM** (audit fields on tables)                                                                                                                                            |
| Cache / pubsub            | **Redis**                                                                                                                                                                                            |
| Realtime                  | **WebSocket** (+ `packages/ws-protocol`)                                                                                                                                                             |
| UI                        | **Mantine** via **`packages/ui`**                                                                                                                                                                    |
| Auth                      | **Better Auth** — email/password + GitHub OAuth; multi-tenant schema prep                                                                                                                            |
| Env guard                 | **@t3-oss/env-nextjs** (or t3-env pattern) as **`packages/env`**                                                                                                                                     |
| Email                     | **Resend** + **React Email** → **`packages/email`**                                                                                                                                                  |
| Object storage            | **Cloudflare R2** — bucket `bucket---paadel-app` with env prefixes (`dev/`, `stg/`, `prod/`); enforce prefix via env config. Post–MVP-n: migrate toward separate buckets — record ADR when migrating |
| Secrets                   | **Doppler** (SoT for values) — `doppler.yaml`, `packages/env` manifest + Zod schema, `bun run doppler:validate` |
| Hosting                   | **Coolify** + **Docker Compose** on Contabo VPS (Ubuntu 22)                                                                                                                                          |
| DNS                       | **Cloudflare** (orange cloud)                                                                                                                                                                        |
| Lint / format             | **Biome** + **ultracite** (strict)                                                                                                                                                                   |
| Git hooks                 | **lefthook**                                                                                                                                                                                         |

## Secrets (Doppler SoT)

- **Values:** Doppler configs `dev` | `stg` | `prd` (runtime `APP_ENV=prod` for `prd`)
- **Shape:** `packages/env` Zod schema + `packages/env/src/manifest.ts`
- **Local dev:** `bun run doppler:setup` → `bun run dev`
- **Validate:** `bun run doppler:validate` (also in CI when `DOPPLER_TOKEN` is set)
- **Deploy:** Coolify injects Doppler env → `docker compose -f docker-compose.deploy.yml`
- **`.env` cache (optional):** `doppler secrets download --no-file --format env > .env`

## Monorepo packages

```
apps/web
apps/api
packages/db
packages/auth
packages/env
packages/email
packages/ui
packages/domain
packages/config
packages/ws-protocol
packages/audit-log   # activity / audit trail (name TBD at scaffold)
```

Skeleton is a starting point — extend only when justified; keep strict dependency graph.

## Product constraints affecting stack

| Constraint             | Implication                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| MVP1–2 audience        | Players only — no active org/club UX                                                |
| Client-first Next.js   | No Server Actions / RSC data fetching for app features                              |
| Public `/`             | Minimal placeholder or redirect — no SEO/marketing build-out until MVP3+            |
| Multi-tenant prep      | `organizationId` / tenant columns + Better Auth org capability at schema level only |
| Fail-fast              | Every stack layer must pass smoke check before feature work                         |
| AI-agent-readable code | Production-grade, explicit layers, high cohesion over coupling                      |

## Explicit non-goals (MVP1–2 stack scope)

- shadcn/Tailwind as primary UI
- Active organization/tenant UX
- Separate R2 buckets per env (deferred post–MVP-n)
- BMAD / harness setup blocking MVP1

## Geography

- **Product:** global English
- **Competitor research lens:** global scan (include Southeast Asia where relevant)

## Last updated

2026-07-30 — Phase 0 snapshot from orchestrator prompt.
