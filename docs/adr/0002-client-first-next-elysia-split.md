# Client-first Next.js with separate Elysia API

Player-facing features are built as client components in `apps/web` using TanStack Query to call `apps/api` (Elysia). We do not use Server Actions or RSC data fetching for app features.

Better Auth session flows use the auth client + API mount pattern. This preserves a single HTTP API surface for future clients, keeps server/client boundaries obvious for agents, and avoids Next-specific lock-in on business logic. Server Components remain acceptable for static shells and layout only.
