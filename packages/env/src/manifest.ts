/**
 * Config-as-code manifest: key shape lives in git; values live in Doppler (SoT).
 * Used by `bun run doppler:validate` — not for runtime secret reads.
 */

/** Doppler config slug → runtime APP_ENV (config `prd` maps to APP_ENV=prod). */
export const DOPPLER_CONFIG_TO_APP_ENV = {
  dev: "dev",
  prd: "prod",
  stg: "stg",
} as const;

export type DopplerConfigSlug = keyof typeof DOPPLER_CONFIG_TO_APP_ENV;

/** Keys every runtime tier config must have in Doppler (values are SoT there). */
export const DOPPLER_RUNTIME_KEYS = [
  "APP_ENV",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "API_CORS_ORIGIN",
  "EMAIL_FROM",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_API_URL",
  "OAUTH_GITHUB_CLIENT_ID",
  "OAUTH_GITHUB_CLIENT_SECRET",
  "RESEND_API_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PREFIX",
] as const;

/** Deploy configs: compose builds DB from this; do not set DB_URL in Doppler. */
export const DOPPLER_DEPLOY_KEYS = ["POSTGRES_PASSWORD"] as const;

/**
 * Host-local dev (doppler run on machine): infra URLs in Doppler dev/dev_personal.
 * Deploy ignores these — compose wires DB_URL / REDIS_URL internally.
 */
export const DOPPLER_LOCAL_HOST_KEYS = ["DB_URL", "REDIS_URL"] as const;

/** Optional keys — tracing is opt-in per tier; everything else is required. */
export const DOPPLER_OPTIONAL_KEYS = [
  "NODE_ENV",
  "OTEL_EXPORTER_OTLP_ENDPOINT",
] as const;

/** Never store in Doppler app configs. */
export const FORBIDDEN_DOPPLER_KEYS = [
  "DOPPLER_TOKEN",
  "ENV_SKIP_VALIDATION",
  "CI",
] as const;

/** Built by compose at deploy — must not be SoT in Doppler for stg/prd. */
export const COMPOSE_WIRED_AT_DEPLOY = ["DB_URL", "REDIS_URL"] as const;

export function requiredKeysForConfig(
  config: DopplerConfigSlug
): readonly string[] {
  const base = [...DOPPLER_RUNTIME_KEYS];
  if (config === "dev") {
    return [...base, ...DOPPLER_DEPLOY_KEYS, ...DOPPLER_LOCAL_HOST_KEYS];
  }
  return [...base, ...DOPPLER_DEPLOY_KEYS];
}

export function forbiddenKeysForConfig(
  config: DopplerConfigSlug
): readonly string[] {
  const base = [...FORBIDDEN_DOPPLER_KEYS];
  if (config === "stg" || config === "prd") {
    return [...base, ...DOPPLER_LOCAL_HOST_KEYS];
  }
  return base;
}
