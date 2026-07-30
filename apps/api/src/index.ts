import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { auth } from "@paadel/auth";
import { serverEnv } from "@paadel/env/server";
import { Elysia } from "elysia";
import { initLogger } from "evlog";
import { evlog } from "evlog/elysia";
import { r2SmokeCheck } from "./lib/r2.js";
import { inviteRoutes, matchRoutes } from "./routes/matches.js";
import { wsRoutes } from "./routes/ws.js";

initLogger({ env: { service: "paadel-api" } });

const app = new Elysia()
  .use(evlog())
  .use(
    cors({
      credentials: true,
      origin: serverEnv.CORS_ORIGIN,
    })
  )
  .use(
    opentelemetry({
      serviceName: "paadel-api",
    })
  )
  .use(
    openapi({
      documentation: {
        info: {
          description: "Elysia API for paadel.app — padel match management.",
          title: "Paadel API",
          version: "0.1.0",
        },
      },
      path: "/docs",
      provider: "scalar",
    })
  )
  .onError(({ error, log, set }) => {
    log?.error("request failed", { error: String(error) });
    set.status = set.status === 200 ? 500 : set.status;
    return {
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  })
  .get(
    "/health",
    ({ log }) => {
      log.info("health check");
      return {
        service: "paadel-api",
        status: "ok",
        timestamp: new Date().toISOString(),
      };
    },
    {
      detail: {
        summary: "Health check",
        tags: ["system"],
      },
    }
  )
  .get(
    "/health/r2",
    async ({ log }) => {
      const result = await r2SmokeCheck();
      if (!result.ok) {
        log.warn("r2 smoke skipped", { reason: result.reason });
        return { ok: false, reason: result.reason };
      }
      log.info("r2 smoke ok", { key: result.key });
      return { key: result.key, ok: true };
    },
    {
      detail: {
        summary: "R2 prefix smoke check",
        tags: ["system"],
      },
    }
  )
  .mount(auth.handler)
  .use(matchRoutes)
  .use(inviteRoutes)
  .use(wsRoutes)
  .listen({
    hostname: serverEnv.API_HOST,
    port: serverEnv.API_PORT,
  });

console.info(
  `paadel-api listening on http://${serverEnv.API_HOST}:${serverEnv.API_PORT} (docs: /docs)`
);

export type App = typeof app;
