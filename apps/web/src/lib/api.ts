import type { MatchWithParticipants } from "@paadel/domain";
import { clientEnv } from "@paadel/env/client";

const apiBase = clientEnv.NEXT_PUBLIC_API_URL;

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed (${response.status})`);
  }
  return payload;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  return parseJson<T>(response);
}

export interface MatchListResponse {
  data: MatchWithParticipants[];
}

export interface MatchResponse {
  data: MatchWithParticipants;
}

export interface InviteCreateResponse {
  data: {
    expiresAt: string;
    id: string;
    inviteUrlPath: string;
    status: string;
    token: string;
  };
}

export interface InvitePreviewResponse {
  data: {
    invite: {
      expiresAt: string;
      id: string;
      status: string;
      token: string;
    };
    match: MatchWithParticipants;
  };
}

export function buildInviteUrl(token: string): string {
  return `${clientEnv.NEXT_PUBLIC_APP_URL}/invite/${token}`;
}
