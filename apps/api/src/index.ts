import { createApp } from "./app.js";
import { API_HOST, API_PORT } from "./constants.js";

const app = createApp().listen({
  hostname: API_HOST,
  port: API_PORT,
});

console.info(
  `paadel-api listening on http://${API_HOST}:${API_PORT} (docs: /docs)`
);

export type App = typeof app;
