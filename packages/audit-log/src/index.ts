import { z } from "zod";

export const auditActionSchema = z.enum([
  "match.created",
  "match.updated",
  "match.cancelled",
  "invite.sent",
  "invite.accepted",
  "invite.declined",
  "player.joined",
  "player.left",
]);

export const auditEntrySchema = z.object({
  action: auditActionSchema,
  actorId: z.string().nullable(),
  id: z.string().uuid(),
  metadata: z.record(z.unknown()).default({}),
  occurredAt: z.coerce.date(),
  organizationId: z.string().uuid().nullable(),
  resourceId: z.string(),
  resourceType: z.string(),
});

export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditEntry = z.infer<typeof auditEntrySchema>;

export type RecordAuditInput = Omit<AuditEntry, "id" | "occurredAt"> & {
  occurredAt?: Date;
};

export interface AuditLogWriter {
  listByResource: (
    resourceType: string,
    resourceId: string
  ) => Promise<AuditEntry[]>;
  record: (entry: RecordAuditInput) => Promise<AuditEntry>;
}

export class InMemoryAuditLog implements AuditLogWriter {
  private readonly entries: AuditEntry[] = [];

  record(input: RecordAuditInput): Promise<AuditEntry> {
    const entry: AuditEntry = auditEntrySchema.parse({
      ...input,
      id: crypto.randomUUID(),
      occurredAt: input.occurredAt ?? new Date(),
    });
    this.entries.push(entry);
    return Promise.resolve(entry);
  }

  listByResource(
    resourceType: string,
    resourceId: string
  ): Promise<AuditEntry[]> {
    return Promise.resolve(
      this.entries.filter(
        (entry) =>
          entry.resourceType === resourceType && entry.resourceId === resourceId
      )
    );
  }
}

export function createAuditLog(): AuditLogWriter {
  return new InMemoryAuditLog();
}

export { createDrizzleAuditLog, DrizzleAuditLog } from "./drizzle.js";
