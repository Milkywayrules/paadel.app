import type { Database } from "@paadel/db";
import { auditEvents } from "@paadel/db";
import { and, eq } from "drizzle-orm";
import {
  type AuditEntry,
  type AuditLogWriter,
  auditEntrySchema,
  type RecordAuditInput,
} from "./index.js";

export class DrizzleAuditLog implements AuditLogWriter {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async record(input: RecordAuditInput): Promise<AuditEntry> {
    const [row] = await this.db
      .insert(auditEvents)
      .values({
        action: input.action,
        actorId: input.actorId,
        metadata: JSON.stringify(input.metadata ?? {}),
        occurredAt: input.occurredAt ?? new Date(),
        organizationId: input.organizationId,
        resourceId: input.resourceId,
        resourceType: input.resourceType,
      })
      .returning();

    if (!row) {
      throw new Error("Failed to persist audit event");
    }

    return auditEntrySchema.parse({
      action: row.action,
      actorId: row.actorId,
      id: row.id,
      metadata: JSON.parse(row.metadata),
      occurredAt: row.occurredAt,
      organizationId: row.organizationId,
      resourceId: row.resourceId,
      resourceType: row.resourceType,
    });
  }

  async listByResource(
    resourceType: string,
    resourceId: string
  ): Promise<AuditEntry[]> {
    const rows = await this.db
      .select()
      .from(auditEvents)
      .where(
        and(
          eq(auditEvents.resourceType, resourceType),
          eq(auditEvents.resourceId, resourceId)
        )
      );

    return rows.map((row) =>
      auditEntrySchema.parse({
        action: row.action,
        actorId: row.actorId,
        id: row.id,
        metadata: JSON.parse(row.metadata),
        occurredAt: row.occurredAt,
        organizationId: row.organizationId,
        resourceId: row.resourceId,
        resourceType: row.resourceType,
      })
    );
  }
}

export function createDrizzleAuditLog(db: Database): AuditLogWriter {
  return new DrizzleAuditLog(db);
}
