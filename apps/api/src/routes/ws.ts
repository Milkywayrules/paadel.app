import { parseWsMessage, pongMessageSchema } from "@paadel/ws-protocol";
import { Elysia } from "elysia";

export const wsRoutes = new Elysia().ws("/ws", {
  message(ws, message) {
    try {
      const parsed = parseWsMessage(message);
      if (parsed.type === "ping") {
        ws.send(
          pongMessageSchema.parse({
            payload: {},
            type: "pong",
          })
        );
      }
    } catch {
      ws.send({ error: "invalid message", type: "error" });
    }
  },
  open(ws) {
    ws.send({ payload: { service: "paadel-api" }, type: "connected" });
  },
});
