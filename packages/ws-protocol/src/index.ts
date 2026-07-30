import { inviteIdSchema, matchIdSchema, playerIdSchema } from "@paadel/domain";
import { z } from "zod";

export const wsEnvelopeSchema = z.object({
  payload: z.unknown(),
  requestId: z.string().uuid().optional(),
  timestamp: z.coerce.date().optional(),
  type: z.string(),
});

export const pingMessageSchema = wsEnvelopeSchema.extend({
  payload: z.object({}).optional(),
  type: z.literal("ping"),
});

export const pongMessageSchema = wsEnvelopeSchema.extend({
  payload: z.object({}).optional(),
  type: z.literal("pong"),
});

export const matchUpdatedMessageSchema = wsEnvelopeSchema.extend({
  payload: z.object({
    matchId: matchIdSchema,
    status: z.string(),
  }),
  type: z.literal("match.updated"),
});

export const inviteUpdatedMessageSchema = wsEnvelopeSchema.extend({
  payload: z.object({
    inviteId: inviteIdSchema,
    matchId: matchIdSchema,
    status: z.string(),
  }),
  type: z.literal("invite.updated"),
});

export const playerPresenceMessageSchema = wsEnvelopeSchema.extend({
  payload: z.object({
    online: z.boolean(),
    playerId: playerIdSchema,
  }),
  type: z.literal("player.presence"),
});

export const wsMessageSchema = z.discriminatedUnion("type", [
  pingMessageSchema,
  pongMessageSchema,
  matchUpdatedMessageSchema,
  inviteUpdatedMessageSchema,
  playerPresenceMessageSchema,
]);

export type WsEnvelope = z.infer<typeof wsEnvelopeSchema>;
export type WsMessage = z.infer<typeof wsMessageSchema>;

export function parseWsMessage(raw: unknown): WsMessage {
  return wsMessageSchema.parse(raw);
}
