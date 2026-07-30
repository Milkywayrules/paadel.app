# Single R2 bucket with environment prefixes for MVP1–2

Object storage uses one Cloudflare R2 bucket with prefixes `dev/`, `stg/`, and `prod/` enforced via `packages/env`. Separate buckets per environment are deferred until post–MVP-n.

Prefix enforcement in env validation reduces operational overhead for a solo/small team while prod data still lives under a distinct prefix. Migration to 2- or 3-bucket layout will require a dedicated ADR before cutover. Env keys: `R2_PREFIX`, `APP_ENV`.
