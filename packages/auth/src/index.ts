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
    github: {
      clientId: serverEnv.OAUTH_GITHUB_CLIENT_ID,
      clientSecret: serverEnv.OAUTH_GITHUB_CLIENT_SECRET,
    },
  },
  trustedOrigins: [serverEnv.API_CORS_ORIGIN],
});

export type Auth = typeof auth;
