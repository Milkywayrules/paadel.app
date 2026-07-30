import { z } from "zod";

export const playerIdSchema = z.string().uuid();
export const matchIdSchema = z.string().uuid();
export const inviteIdSchema = z.string().uuid();

export const skillBandHintSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "open",
]);

export const participantRoleSchema = z.enum(["host", "player"]);

export const playerSchema = z.object({
  createdAt: z.coerce.date(),
  displayName: z.string().min(1).max(120),
  id: playerIdSchema,
  organizationId: z.string().uuid().nullable(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
});

export const matchStatusSchema = z.enum([
  "draft",
  "open",
  "confirmed",
  "completed",
  "cancelled",
]);

export const matchSchema = z.object({
  createdAt: z.coerce.date(),
  hostPlayerId: playerIdSchema,
  id: matchIdSchema,
  locationLabel: z.string().max(200).nullable(),
  maxPlayers: z.number().int().min(2).max(8).default(4),
  organizationId: z.string().uuid().nullable(),
  scheduledAt: z.coerce.date().nullable(),
  skillBandHint: skillBandHintSchema.nullable(),
  status: matchStatusSchema,
  title: z.string().min(1).max(200),
  updatedAt: z.coerce.date(),
});

export const matchParticipantSchema = z.object({
  joinedAt: z.coerce.date(),
  matchId: matchIdSchema,
  playerId: playerIdSchema,
  role: participantRoleSchema,
});

export const createMatchInputSchema = z.object({
  locationLabel: z.string().max(200).optional(),
  maxPlayers: z.number().int().min(2).max(8).default(4),
  scheduledAt: z.coerce.date().nullable().optional(),
  skillBandHint: skillBandHintSchema.optional(),
  title: z.string().min(1).max(200),
});

export const inviteStatusSchema = z.enum([
  "pending",
  "accepted",
  "declined",
  "expired",
  "revoked",
]);

export const inviteSchema = z.object({
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  id: inviteIdSchema,
  inviteeEmail: z.string().email().nullable(),
  inviteePlayerId: playerIdSchema.nullable(),
  inviterPlayerId: playerIdSchema,
  matchId: matchIdSchema,
  status: inviteStatusSchema,
  token: z.string().min(16),
  updatedAt: z.coerce.date(),
});

export const createInviteInputSchema = z.object({
  inviteeEmail: z.string().email().optional(),
});

export const matchWithParticipantsSchema = matchSchema.extend({
  participantCount: z.number().int().nonnegative(),
  participants: z.array(
    matchParticipantSchema.extend({
      displayName: z.string(),
    })
  ),
});

export type Player = z.infer<typeof playerSchema>;
export type Match = z.infer<typeof matchSchema>;
export type MatchParticipant = z.infer<typeof matchParticipantSchema>;
export type Invite = z.infer<typeof inviteSchema>;
export type CreateMatchInput = z.infer<typeof createMatchInputSchema>;
export type CreateInviteInput = z.infer<typeof createInviteInputSchema>;
export type MatchStatus = z.infer<typeof matchStatusSchema>;
export type InviteStatus = z.infer<typeof inviteStatusSchema>;
export type MatchWithParticipants = z.infer<typeof matchWithParticipantsSchema>;
