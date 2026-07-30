import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const skipValidation =
  process.env.ENV_SKIP_VALIDATION === "true" || process.env.CI === "true";

const appEnvSchema = z.enum(["dev", "stg", "preview", "prod"]);

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    API_CORS_ORIGIN: z.string().url(),
    API_HOST: z.string().default("0.0.0.0"),
    API_PORT: z.coerce.number().int().positive().default(3001),
    APP_ENV: appEnvSchema.default("dev"),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    DB_URL: z.string().url(),
    EMAIL_FROM: z.string().min(3),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    OAUTH_GITHUB_CLIENT_ID: z.string().optional(),
    OAUTH_GITHUB_CLIENT_SECRET: z.string().optional(),
    OAUTH_GITHUB_ENABLED: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),
    R2_PREFIX: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    REDIS_URL: z.string().url(),
    RESEND_API_KEY: z.string().optional(),
  },
  skipValidation,
});

if (
  !skipValidation &&
  (serverEnv.APP_ENV === "prod" || serverEnv.APP_ENV === "stg") &&
  !(serverEnv.OAUTH_GITHUB_CLIENT_ID && serverEnv.OAUTH_GITHUB_CLIENT_SECRET)
) {
  throw new Error(
    "OAUTH_GITHUB_CLIENT_ID and OAUTH_GITHUB_CLIENT_SECRET are required when APP_ENV is prod or stg"
  );
}

export type ServerEnv = typeof serverEnv;
