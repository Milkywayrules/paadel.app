import { describe, expect, test } from "bun:test";
import { defaultR2PrefixForAppEnv, isOAuthGithubEnabled } from "./features.js";
import type { ServerEnv } from "./server.js";

function mockEnv(overrides: Partial<ServerEnv> = {}): ServerEnv {
  return {
    API_CORS_ORIGIN: "http://localhost:3000",
    API_HOST: "0.0.0.0",
    API_PORT: 3001,
    APP_ENV: "dev",
    BETTER_AUTH_SECRET: "x".repeat(32),
    BETTER_AUTH_URL: "http://localhost:3001",
    DB_URL: "postgresql://paadel:paadel@localhost:5432/paadel",
    EMAIL_FROM: "Paadel <noreply@paadel.app>",
    NODE_ENV: "development",
    OAUTH_GITHUB_ENABLED: false,
    REDIS_URL: "redis://localhost:6379",
    ...overrides,
  } as ServerEnv;
}

describe("isOAuthGithubEnabled", () => {
  test("returns false when credentials are missing", () => {
    expect(isOAuthGithubEnabled(mockEnv())).toBe(false);
  });

  test("returns false in dev when OAUTH_GITHUB_ENABLED is not true", () => {
    expect(
      isOAuthGithubEnabled(
        mockEnv({
          OAUTH_GITHUB_CLIENT_ID: "id",
          OAUTH_GITHUB_CLIENT_SECRET: "secret",
          OAUTH_GITHUB_ENABLED: false,
        })
      )
    ).toBe(false);
  });

  test("returns true in dev when creds exist and OAUTH_GITHUB_ENABLED is true", () => {
    expect(
      isOAuthGithubEnabled(
        mockEnv({
          OAUTH_GITHUB_CLIENT_ID: "id",
          OAUTH_GITHUB_CLIENT_SECRET: "secret",
          OAUTH_GITHUB_ENABLED: true,
        })
      )
    ).toBe(true);
  });

  test("returns true in stg when credentials exist", () => {
    expect(
      isOAuthGithubEnabled(
        mockEnv({
          APP_ENV: "stg",
          OAUTH_GITHUB_CLIENT_ID: "id",
          OAUTH_GITHUB_CLIENT_SECRET: "secret",
        })
      )
    ).toBe(true);
  });

  test("returns true in preview when credentials exist", () => {
    expect(
      isOAuthGithubEnabled(
        mockEnv({
          APP_ENV: "preview",
          OAUTH_GITHUB_CLIENT_ID: "id",
          OAUTH_GITHUB_CLIENT_SECRET: "secret",
        })
      )
    ).toBe(true);
  });
});

describe("defaultR2PrefixForAppEnv", () => {
  test("maps tiers to bucket prefixes", () => {
    expect(defaultR2PrefixForAppEnv("dev")).toBe("dev/");
    expect(defaultR2PrefixForAppEnv("stg")).toBe("stg/");
    expect(defaultR2PrefixForAppEnv("prod")).toBe("prod/");
    expect(defaultR2PrefixForAppEnv("preview")).toBe("stg/");
  });
});
