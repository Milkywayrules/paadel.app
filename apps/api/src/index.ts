import { serverEnv } from "@paadel/env/server";
import { createApp } from "./app.js";

const app = createApp().listen({
  hostname: serverEnv.API_HOST,
  port: serverEnv.API_PORT,
});

console.info(
  `paadel-api listening on http://${serverEnv.API_HOST}:${serverEnv.API_PORT} (docs: /docs)`
);

export type App = typeof app;
