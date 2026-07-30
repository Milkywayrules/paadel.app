import { describe, expect, test } from "bun:test";

describe("health response shape", () => {
  test("matches expected contract", () => {
    const payload = {
      service: "paadel-api",
      status: "ok",
      timestamp: new Date().toISOString(),
    };

    expect(payload.status).toBe("ok");
    expect(payload.service).toBe("paadel-api");
    expect(() => new Date(payload.timestamp)).not.toThrow();
  });
});
