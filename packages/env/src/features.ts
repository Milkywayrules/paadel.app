import type { ServerEnv } from "./server";

/** Deployment tier (Doppler config / Coolify target) — not Node runtime mode. */
export type AppEnv = ServerEnv["APP_ENV"];

export function isOAuthGithubEnabled(env: ServerEnv): boolean {
  const hasCreds =
    Boolean(env.OAUTH_GITHUB_CLIENT_ID) &&
    Boolean(env.OAUTH_GITHUB_CLIENT_SECRET);

  if (!hasCreds) {
    return false;
  }

  if (env.APP_ENV === "dev") {
    return env.OAUTH_GITHUB_ENABLED === true;
  }

  return true;
}

export function defaultR2PrefixForAppEnv(appEnv: AppEnv): string {
  switch (appEnv) {
    case "prod":
      return "prod/";
    case "stg":
      return "stg/";
    case "preview":
      return "stg/";
    default:
      return "dev/";
  }
}
