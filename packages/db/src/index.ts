import { serverEnv } from "@paadel/env/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { authSchema } from "./schema/auth.js";
import {
  auditEvents,
  invites,
  matches,
  matchParticipants,
  organizations,
  players,
} from "./schema/index.js";

const schema = {
  ...authSchema,
  auditEvents,
  invites,
  matches,
  matchParticipants,
  organizations,
  players,
};

const queryClient = postgres(serverEnv.DATABASE_URL, {
  connect_timeout: 10,
  idle_timeout: 20,
  max: 10,
});

export const db = drizzle(queryClient, { schema });
export type Database = typeof db;

export * from "./schema/auth.js";
export { authSchema } from "./schema/auth.js";
export {
  auditEvents,
  invites,
  matches,
  matchParticipants,
  organizations,
  players,
} from "./schema/index.js";
