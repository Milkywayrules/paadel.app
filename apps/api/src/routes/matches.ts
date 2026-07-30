import { createDrizzleAuditLog } from "@paadel/audit-log";
import { db, invites, matches, matchParticipants } from "@paadel/db";
import {
  createMatchInputSchema,
  matchIdSchema,
  skillBandHintSchema,
} from "@paadel/domain";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  listMatchesForPlayer,
  serializeMatch,
  syncMatchStatus,
} from "../lib/players.js";
import { createInviteToken, inviteExpiresAt } from "../lib/tokens.js";
import {
  getAuthedPlayer,
  requireAuth,
  sessionPlugin,
} from "../plugins/session.js";

const auditLog = createDrizzleAuditLog(db);

export const matchRoutes = sessionPlugin.group("/matches", (app) =>
  app
    .get(
      "/",
      async (context) => {
        const denied = requireAuth(context);
        if (denied) {
          return denied;
        }

        const authed = getAuthedPlayer(context);
        if (!authed) {
          context.set.status = 401;
          return { error: "Unauthorized" };
        }

        const rows = await listMatchesForPlayer(authed.player.id);
        const data = await Promise.all(
          rows.map(async (row) => serializeMatch(row.id))
        );

        return {
          data: data.filter(Boolean).sort((a, b) => {
            const aTime =
              a?.scheduledAt?.getTime() ?? a?.createdAt.getTime() ?? 0;
            const bTime =
              b?.scheduledAt?.getTime() ?? b?.createdAt.getTime() ?? 0;
            return bTime - aTime;
          }),
        };
      },
      {
        detail: {
          summary: "List matches for the current player",
        },
      }
    )
    .get(
      "/:id",
      async (context) => {
        const denied = requireAuth(context);
        if (denied) {
          return denied;
        }

        const authed = getAuthedPlayer(context);
        if (!authed) {
          context.set.status = 401;
          return { error: "Unauthorized" };
        }

        const id = matchIdSchema.safeParse(context.params.id);
        if (!id.success) {
          context.set.status = 400;
          return { error: "Invalid match id" };
        }

        const match = await serializeMatch(id.data);
        if (!match) {
          context.set.status = 404;
          return { error: "Match not found" };
        }

        const isParticipant = match.participants.some(
          (participant) => participant.playerId === authed.player.id
        );

        if (!isParticipant) {
          context.set.status = 403;
          return { error: "Forbidden" };
        }

        return { data: match };
      },
      {
        detail: {
          summary: "Get match by id",
        },
      }
    )
    .post(
      "/",
      async (context) => {
        const denied = requireAuth(context);
        if (denied) {
          return denied;
        }

        const authed = getAuthedPlayer(context);
        if (!authed) {
          context.set.status = 401;
          return { error: "Unauthorized" };
        }

        const parsed = createMatchInputSchema.safeParse(context.body);
        if (!parsed.success) {
          context.set.status = 400;
          return {
            error: "Invalid match payload",
            issues: parsed.error.issues,
          };
        }

        const now = new Date();
        const [created] = await db
          .insert(matches)
          .values({
            createdBy: authed.player.userId,
            hostPlayerId: authed.player.id,
            locationLabel: parsed.data.locationLabel ?? null,
            maxPlayers: parsed.data.maxPlayers,
            scheduledAt: parsed.data.scheduledAt ?? null,
            skillBandHint: parsed.data.skillBandHint ?? null,
            status: "open",
            title: parsed.data.title,
            updatedBy: authed.player.userId,
          })
          .returning();

        if (!created) {
          context.set.status = 500;
          return { error: "Failed to create match" };
        }

        await db.insert(matchParticipants).values({
          createdBy: authed.player.userId,
          joinedAt: now,
          matchId: created.id,
          playerId: authed.player.id,
          role: "host",
          updatedBy: authed.player.userId,
        });

        await auditLog.record({
          action: "match.created",
          actorId: authed.player.id,
          metadata: { title: created.title },
          organizationId: null,
          resourceId: created.id,
          resourceType: "match",
        });

        const data = await serializeMatch(created.id);
        context.set.status = 201;
        return { data };
      },
      {
        body: z.object({
          locationLabel: z.string().max(200).optional(),
          maxPlayers: z.number().int().min(2).max(8).optional(),
          scheduledAt: z.string().datetime().nullable().optional(),
          skillBandHint: skillBandHintSchema.optional(),
          title: z.string().min(1).max(200),
        }),
        detail: {
          summary: "Create match",
        },
      }
    )
    .post(
      "/:id/invites",
      async (context) => {
        const denied = requireAuth(context);
        if (denied) {
          return denied;
        }

        const authed = getAuthedPlayer(context);
        if (!authed) {
          context.set.status = 401;
          return { error: "Unauthorized" };
        }

        const id = matchIdSchema.safeParse(context.params.id);
        if (!id.success) {
          context.set.status = 400;
          return { error: "Invalid match id" };
        }

        const match = await db.query.matches.findFirst({
          where: eq(matches.id, id.data),
        });

        if (!match) {
          context.set.status = 404;
          return { error: "Match not found" };
        }

        if (match.hostPlayerId !== authed.player.id) {
          context.set.status = 403;
          return { error: "Only the host can create invites" };
        }

        const token = createInviteToken();
        const expiresAt = inviteExpiresAt();

        const [invite] = await db
          .insert(invites)
          .values({
            createdBy: authed.player.userId,
            expiresAt,
            inviterPlayerId: authed.player.id,
            matchId: match.id,
            status: "pending",
            token,
            updatedBy: authed.player.userId,
          })
          .returning();

        if (!invite) {
          context.set.status = 500;
          return { error: "Failed to create invite" };
        }

        await auditLog.record({
          action: "invite.sent",
          actorId: authed.player.id,
          metadata: { matchId: match.id },
          organizationId: null,
          resourceId: invite.id,
          resourceType: "invite",
        });

        context.set.status = 201;
        return {
          data: {
            expiresAt: invite.expiresAt,
            id: invite.id,
            inviteUrlPath: `/invite/${invite.token}`,
            status: invite.status,
            token: invite.token,
          },
        };
      },
      {
        detail: {
          summary: "Create invite link for a match",
        },
      }
    )
    .post(
      "/:id/complete",
      async (context) => {
        const denied = requireAuth(context);
        if (denied) {
          return denied;
        }

        const authed = getAuthedPlayer(context);
        if (!authed) {
          context.set.status = 401;
          return { error: "Unauthorized" };
        }

        const id = matchIdSchema.safeParse(context.params.id);
        if (!id.success) {
          context.set.status = 400;
          return { error: "Invalid match id" };
        }

        const match = await db.query.matches.findFirst({
          where: eq(matches.id, id.data),
        });

        if (!match) {
          context.set.status = 404;
          return { error: "Match not found" };
        }

        if (match.hostPlayerId !== authed.player.id) {
          context.set.status = 403;
          return { error: "Only the host can complete a match" };
        }

        const [updated] = await db
          .update(matches)
          .set({ status: "completed", updatedAt: new Date() })
          .where(eq(matches.id, match.id))
          .returning();

        if (!updated) {
          context.set.status = 500;
          return { error: "Failed to update match" };
        }

        const data = await serializeMatch(updated.id);
        return { data };
      },
      {
        detail: {
          summary: "Mark match as completed",
        },
      }
    )
);

export const inviteRoutes = sessionPlugin.group("/invites", (app) =>
  app
    .get(
      "/:token",
      async (context) => {
        const { token } = context.params;
        if (!token || token.length < 16) {
          context.set.status = 400;
          return { error: "Invalid invite token" };
        }

        const invite = await db.query.invites.findFirst({
          where: eq(invites.token, token),
        });

        if (!invite) {
          context.set.status = 404;
          return { error: "Invite not found" };
        }

        if (invite.expiresAt < new Date()) {
          context.set.status = 410;
          return { error: "Invite expired" };
        }

        const match = await serializeMatch(invite.matchId);
        if (!match) {
          context.set.status = 404;
          return { error: "Match not found" };
        }

        return {
          data: {
            invite: {
              expiresAt: invite.expiresAt,
              id: invite.id,
              status: invite.status,
              token: invite.token,
            },
            match,
          },
        };
      },
      {
        detail: {
          summary: "Preview invite by token",
        },
      }
    )
    .post(
      "/:token/accept",
      async (context) => {
        const denied = requireAuth(context);
        if (denied) {
          return denied;
        }

        const authed = getAuthedPlayer(context);
        if (!authed) {
          context.set.status = 401;
          return { error: "Unauthorized" };
        }

        const { token } = context.params;

        const invite = await db.query.invites.findFirst({
          where: eq(invites.token, token),
        });

        if (!invite) {
          context.set.status = 404;
          return { error: "Invite not found" };
        }

        if (invite.expiresAt < new Date()) {
          context.set.status = 410;
          return { error: "Invite expired" };
        }

        if (invite.status !== "pending") {
          context.set.status = 409;
          return { error: `Invite already ${invite.status}` };
        }

        const match = await db.query.matches.findFirst({
          where: eq(matches.id, invite.matchId),
        });

        if (!match) {
          context.set.status = 404;
          return { error: "Match not found" };
        }

        const existingParticipant = await db.query.matchParticipants.findFirst({
          where: and(
            eq(matchParticipants.matchId, match.id),
            eq(matchParticipants.playerId, authed.player.id)
          ),
        });

        if (!existingParticipant) {
          const participantCount = await db
            .select({ id: matchParticipants.id })
            .from(matchParticipants)
            .where(eq(matchParticipants.matchId, match.id));

          if (participantCount.length >= match.maxPlayers) {
            context.set.status = 409;
            return { error: "Match is full" };
          }

          await db.insert(matchParticipants).values({
            createdBy: authed.player.userId,
            joinedAt: new Date(),
            matchId: match.id,
            playerId: authed.player.id,
            role: "player",
            updatedBy: authed.player.userId,
          });

          await auditLog.record({
            action: "player.joined",
            actorId: authed.player.id,
            metadata: { matchId: match.id },
            organizationId: null,
            resourceId: match.id,
            resourceType: "match",
          });
        }

        await db
          .update(invites)
          .set({
            inviteePlayerId: authed.player.id,
            status: "accepted",
            updatedAt: new Date(),
          })
          .where(eq(invites.id, invite.id));

        await syncMatchStatus(match.id);

        await auditLog.record({
          action: "invite.accepted",
          actorId: authed.player.id,
          metadata: { matchId: match.id },
          organizationId: null,
          resourceId: invite.id,
          resourceType: "invite",
        });

        const data = await serializeMatch(match.id);
        return { data };
      },
      {
        detail: {
          summary: "Accept invite",
        },
      }
    )
    .post(
      "/:token/decline",
      async (context) => {
        const denied = requireAuth(context);
        if (denied) {
          return denied;
        }

        const authed = getAuthedPlayer(context);
        if (!authed) {
          context.set.status = 401;
          return { error: "Unauthorized" };
        }

        const { token } = context.params;

        const invite = await db.query.invites.findFirst({
          where: eq(invites.token, token),
        });

        if (!invite) {
          context.set.status = 404;
          return { error: "Invite not found" };
        }

        if (invite.status !== "pending") {
          context.set.status = 409;
          return { error: `Invite already ${invite.status}` };
        }

        await db
          .update(invites)
          .set({
            inviteePlayerId: authed.player.id,
            status: "declined",
            updatedAt: new Date(),
          })
          .where(eq(invites.id, invite.id));

        await auditLog.record({
          action: "invite.declined",
          actorId: authed.player.id,
          metadata: { matchId: invite.matchId },
          organizationId: null,
          resourceId: invite.id,
          resourceType: "invite",
        });

        return { data: { status: "declined" } };
      },
      {
        detail: {
          summary: "Decline invite",
        },
      }
    )
);
