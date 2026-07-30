import { serverEnv } from "@paadel/env/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  authAccounts,
  authMembers,
  authOrganizations,
  authSessions,
  authUsers,
  authVerifications,
} from "./schema/auth.js";
import { invites, matches, organizations, players } from "./schema/index.js";

const schema = {
  authAccounts,
  authMembers,
  authOrganizations,
  authSessions,
  authUsers,
  authVerifications,
  invites,
  matches,
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
