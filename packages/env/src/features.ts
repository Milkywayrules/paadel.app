import type { ServerEnv } from "./server";

/** Deployment tier (Doppler config / Coolify target) — not Node runtime mode. */
export type AppEnv = ServerEnv["APP_ENV"];

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
