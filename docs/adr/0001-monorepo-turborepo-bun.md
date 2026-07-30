# Turborepo + Bun monorepo with strict package layers

We use a Turborepo monorepo managed by Bun workspaces with apps (`web`, `api`) and shared packages (`domain`, `db`, `auth`, etc.). Apps may depend on packages; packages never depend on apps. Domain logic and Zod schemas live in `packages/domain` with no infrastructure imports.

This shape keeps MVP1 boundaries explicit for AI agents and humans, enables shared types between Elysia API and Next client, and matches the locked stack in `docs/tech-stack.md`. Alternatives (separate repos or a single Next full-stack app) were rejected because they would blur the client-first API split and complicate future mobile or club-admin clients.
