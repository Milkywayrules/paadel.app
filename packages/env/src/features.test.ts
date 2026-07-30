import { describe, expect, test } from "bun:test";
import { defaultR2PrefixForAppEnv } from "./features.js";

describe("defaultR2PrefixForAppEnv", () => {
  test("maps tiers to bucket prefixes", () => {
    expect(defaultR2PrefixForAppEnv("dev")).toBe("dev/");
    expect(defaultR2PrefixForAppEnv("stg")).toBe("stg/");
    expect(defaultR2PrefixForAppEnv("prod")).toBe("prod/");
    expect(defaultR2PrefixForAppEnv("preview")).toBe("stg/");
  });
});
