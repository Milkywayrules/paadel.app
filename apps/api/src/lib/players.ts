import { db, matches, matchParticipants, players } from "@paadel/db";
import { eq, inArray } from "drizzle-orm";

export interface AuthUser {
  email: string;
  id: string;
  image?: string | null;
  name: string;
}

export async function ensurePlayerForUser(user: AuthUser) {
  const existing = await db.query.players.findFirst({
    where: eq(players.userId, user.id),
  });

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(players)
    .values({
      createdBy: user.id,
      displayName: user.name || user.email.split("@")[0] || "Player",
      updatedBy: user.id,
      userId: user.id,
    })
    .returning();

  return created;
}

export async function getPlayerByUserId(userId: string) {
  return await db.query.players.findFirst({
    where: eq(players.userId, userId),
  });
}

export async function listMatchesForPlayer(playerId: string) {
  const participantRows = await db
    .select({ matchId: matchParticipants.matchId })
    .from(matchParticipants)
    .where(eq(matchParticipants.playerId, playerId));

  if (participantRows.length === 0) {
    return [];
  }

  const matchIds = participantRows.map((row) => row.matchId);
  return db.select().from(matches).where(inArray(matches.id, matchIds));
}

export async function countParticipants(matchId: string) {
  const rows = await db
    .select({ id: matchParticipants.id })
    .from(matchParticipants)
    .where(eq(matchParticipants.matchId, matchId));

  return rows.length;
}

export async function getMatchParticipantsWithNames(matchId: string) {
  return await db
    .select({
      displayName: players.displayName,
      joinedAt: matchParticipants.joinedAt,
      matchId: matchParticipants.matchId,
      playerId: matchParticipants.playerId,
      role: matchParticipants.role,
    })
    .from(matchParticipants)
    .innerJoin(players, eq(matchParticipants.playerId, players.id))
    .where(eq(matchParticipants.matchId, matchId));
}

export async function syncMatchStatus(matchId: string) {
  const match = await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
  });

  if (!match || match.status === "completed" || match.status === "cancelled") {
    return match;
  }

  const participantCount = await countParticipants(matchId);
  let nextStatus = match.status;

  if (participantCount >= 2 && match.status === "open") {
    nextStatus = "confirmed";
  }

  if (participantCount >= match.maxPlayers && match.status !== "confirmed") {
    nextStatus = "confirmed";
  }

  if (nextStatus === match.status) {
    return match;
  }

  const [updated] = await db
    .update(matches)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(matches.id, matchId))
    .returning();

  return updated;
}

export async function serializeMatch(matchId: string) {
  const match = await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
  });

  if (!match) {
    return null;
  }

  const participants = await getMatchParticipantsWithNames(matchId);

  return {
    ...match,
    participantCount: participants.length,
    participants,
  };
}
