import { createAuditLog } from "@paadel/audit-log";
import {
  createMatchInputSchema,
  matchIdSchema,
  matchSchema,
} from "@paadel/domain";
import { Elysia } from "elysia";
import { z } from "zod";

const auditLog = createAuditLog();

const sampleMatches = [
  matchSchema.parse({
    createdAt: new Date(),
    hostPlayerId: "00000000-0000-4000-8000-000000000010",
    id: "00000000-0000-4000-8000-000000000001",
    maxPlayers: 4,
    organizationId: null,
    scheduledAt: new Date("2026-08-02T09:00:00.000Z"),
    status: "open",
    title: "Saturday morning doubles",
    updatedAt: new Date(),
  }),
];

export const matchRoutes = new Elysia({ prefix: "/matches", tags: ["matches"] })
  .get(
    "/",
    () => ({
      data: sampleMatches,
    }),
    {
      detail: {
        description: "Returns sample matches until DB wiring lands in MVP1.",
        summary: "List matches",
      },
    }
  )
  .get(
    "/:id",
    ({ params, set }) => {
      const id = matchIdSchema.safeParse(params.id);
      if (!id.success) {
        set.status = 400;
        return { error: "Invalid match id" };
      }

      const match = sampleMatches.find((item) => item.id === id.data);
      if (!match) {
        set.status = 404;
        return { error: "Match not found" };
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
    async ({ body, set }) => {
      const parsed = createMatchInputSchema.safeParse(body);
      if (!parsed.success) {
        set.status = 400;
        return { error: "Invalid match payload", issues: parsed.error.issues };
      }

      const now = new Date();
      const created = matchSchema.parse({
        createdAt: now,
        hostPlayerId: "00000000-0000-4000-8000-000000000010",
        id: crypto.randomUUID(),
        maxPlayers: parsed.data.maxPlayers,
        organizationId: null,
        scheduledAt: parsed.data.scheduledAt ?? null,
        status: "draft",
        title: parsed.data.title,
        updatedAt: now,
      });

      sampleMatches.push(created);
      await auditLog.record({
        action: "match.created",
        actorId: created.hostPlayerId,
        metadata: { title: created.title },
        organizationId: null,
        resourceId: created.id,
        resourceType: "match",
      });

      set.status = 201;
      return { data: created };
    },
    {
      body: z.object({
        maxPlayers: z.number().int().optional(),
        scheduledAt: z.string().datetime().nullable().optional(),
        title: z.string(),
      }),
      detail: {
        summary: "Create match (stub)",
      },
    }
  );
