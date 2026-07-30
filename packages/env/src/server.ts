import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const skipValidation =
  process.env.SKIP_ENV_VALIDATION === "true" || process.env.CI === "true";

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    API_HOST: z.string().default("0.0.0.0"),
    API_PORT: z.coerce.number().int().positive().default(3001),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    CORS_ORIGIN: z.string().url(),
    DATABASE_URL: z.string().url(),
    EMAIL_FROM: z.string().min(3),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
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

export type ServerEnv = typeof serverEnv;
