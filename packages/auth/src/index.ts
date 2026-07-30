import { authSchema, db } from "@paadel/db";
import { serverEnv } from "@paadel/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  appName: "Paadel",
  baseURL: serverEnv.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: false,
    }),
  ],
  secret: serverEnv.BETTER_AUTH_SECRET,
  socialProviders: {
    ...(serverEnv.GITHUB_CLIENT_ID && serverEnv.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: serverEnv.GITHUB_CLIENT_ID,
            clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  trustedOrigins: [serverEnv.CORS_ORIGIN],
});

export type Auth = typeof auth;
