import { auth } from "@paadel/auth";
import { Elysia } from "elysia";
import {
  type AuthUser,
  ensurePlayerForUser,
  type getPlayerByUserId,
} from "../lib/players.js";

export interface SessionContext {
  player: NonNullable<Awaited<ReturnType<typeof getPlayerByUserId>>>;
  user: AuthUser;
}

export const sessionPlugin = new Elysia({ name: "session" }).derive(
  async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return { player: null, user: null };
    }

    const user: AuthUser = {
      email: session.user.email,
      id: session.user.id,
      image: session.user.image,
      name: session.user.name,
    };

    const player = await ensurePlayerForUser(user);
    return { player, user };
  }
);

export function requireAuth(context: {
  player?: SessionContext["player"] | null;
  set: { status?: number | string };
  user?: SessionContext["user"] | null;
}) {
  if (!(context.user && context.player)) {
    context.set.status = 401;
    return { error: "Unauthorized" } as const;
  }

  return null;
}

export function getAuthedPlayer(context: {
  player?: SessionContext["player"] | null;
  set: { status?: number | string };
  user?: SessionContext["user"] | null;
}): SessionContext | null {
  if (requireAuth(context)) {
    return null;
  }

  return {
    player: context.player as SessionContext["player"],
    user: context.user as SessionContext["user"],
  };
}
