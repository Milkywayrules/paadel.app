import { createDrizzleAuditLog } from "@paadel/audit-log";
import { db } from "@paadel/db";
import { sql } from "drizzle-orm";
import type { App } from "../app.js";

export interface SignedUpUser {
  cookie: string;
  email: string;
  name: string;
}

export interface ApiResponse<T = unknown> {
  json: T;
  status: number;
}

function collectSetCookie(headers: Headers): string {
  const setCookies =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : [headers.get("set-cookie")].filter((value): value is string =>
          Boolean(value)
        );

  return setCookies
    .map((entry) => entry.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

export async function resetDb(): Promise<void> {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("resetDb is only allowed when NODE_ENV=test");
  }

  await db.execute(
    sql`
      TRUNCATE TABLE
        audit_events,
        invites,
        match_participants,
        matches,
        players,
        organizations,
        session,
        account,
        verification,
        member,
        invitation,
        organization,
        "user"
      CASCADE
    `
  );
}

export async function signupUser(
  app: App,
  input: { email: string; name: string; password: string }
): Promise<SignedUpUser> {
  const response = await app.handle(
    new Request("http://localhost/api/auth/sign-up/email", {
      body: JSON.stringify({
        email: input.email,
        name: input.name,
        password: input.password,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
  );

  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      `sign-up failed (${response.status}): ${JSON.stringify(json)}`
    );
  }

  const cookie = collectSetCookie(response.headers);
  if (!cookie) {
    throw new Error("sign-up did not return a session cookie");
  }

  return {
    cookie,
    email: input.email,
    name: input.name,
  };
}

export async function apiRequest<T = unknown>(
  app: App,
  path: string,
  options: {
    body?: unknown;
    cookie?: string;
    method?: string;
  } = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {};
  if (options.cookie) {
    headers.cookie = options.cookie;
  }
  if (options.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  const response = await app.handle(
    new Request(`http://localhost${path}`, {
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      headers,
      method: options.method ?? "GET",
    })
  );

  const text = await response.text();
  let json: T;
  if (text) {
    try {
      json = JSON.parse(text) as T;
    } catch {
      json = text as T;
    }
  } else {
    json = null as T;
  }

  return {
    json,
    status: response.status,
  };
}

export async function listAuditActions(
  resourceType: string,
  resourceId: string
): Promise<string[]> {
  const auditLog = createDrizzleAuditLog(db);
  const entries = await auditLog.listByResource(resourceType, resourceId);
  return entries.map((entry) => entry.action);
}
