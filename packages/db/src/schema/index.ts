import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const auditColumns = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdBy: text("created_by"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  updatedBy: text("updated_by"),
};

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ...auditColumns,
});

export const players = pgTable("players", {
  displayName: text("display_name").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  userId: text("user_id").notNull().unique(),
  ...auditColumns,
});

export const matches = pgTable("matches", {
  hostPlayerId: uuid("host_player_id")
    .notNull()
    .references(() => players.id),
  id: uuid("id").primaryKey().defaultRandom(),
  maxPlayers: integer("max_players").notNull().default(4),
  organizationId: uuid("organization_id").references(() => organizations.id),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  status: text("status").notNull().default("draft"),
  title: text("title").notNull(),
  ...auditColumns,
});

export const invites = pgTable("invites", {
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  inviteeEmail: text("invitee_email"),
  inviteePlayerId: uuid("invitee_player_id").references(() => players.id),
  inviterPlayerId: uuid("inviter_player_id")
    .notNull()
    .references(() => players.id),
  matchId: uuid("match_id")
    .notNull()
    .references(() => matches.id),
  status: text("status").notNull().default("pending"),
  token: text("token").notNull().unique(),
  ...auditColumns,
});
