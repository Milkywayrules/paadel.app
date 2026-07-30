import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://paadel:paadel@localhost:5432/paadel",
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: ["./src/schema/index.ts", "./src/schema/auth.ts"],
});
