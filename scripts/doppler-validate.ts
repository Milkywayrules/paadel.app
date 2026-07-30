#!/usr/bin/env bun
/**
 * Validates Doppler config keys against packages/env manifest (config-as-code).
 * Values are SoT in Doppler — this only checks key presence / forbidden keys.
 */
import { spawnSync } from "node:child_process";

import {
  DOPPLER_CONFIG_TO_APP_ENV,
  type DopplerConfigSlug,
  forbiddenKeysForConfig,
  requiredKeysForConfig,
} from "@paadel/env/manifest";

const PROJECT = process.env.DOPPLER_PROJECT ?? "paadel-app";
const config = (process.env.DOPPLER_CONFIG ?? "dev") as DopplerConfigSlug;

if (!(config in DOPPLER_CONFIG_TO_APP_ENV)) {
  console.error(`unknown Doppler config: ${config}`);
  process.exit(1);
}

const result = spawnSync(
  "doppler",
  ["secrets", "--only-names", "--json", "-p", PROJECT, "-c", config],
  { encoding: "utf8" }
);

if (result.status !== 0) {
  console.error(
    result.stderr || "doppler secrets failed — run bun run doppler:setup"
  );
  process.exit(1);
}

const present = new Set(
  Object.keys(JSON.parse(result.stdout) as Record<string, unknown>)
);
const required = requiredKeysForConfig(config);
const forbidden = forbiddenKeysForConfig(config);
const expectedAppEnv = DOPPLER_CONFIG_TO_APP_ENV[config];

let failed = false;

for (const key of required) {
  if (!present.has(key)) {
    console.error(`missing required key in Doppler ${config}: ${key}`);
    failed = true;
  }
}

for (const key of forbidden) {
  if (present.has(key)) {
    console.error(`forbidden key in Doppler ${config}: ${key}`);
    failed = true;
  }
}

if (present.has("APP_ENV")) {
  const appEnvResult = spawnSync(
    "doppler",
    ["secrets", "get", "APP_ENV", "--plain", "-p", PROJECT, "-c", config],
    { encoding: "utf8" }
  );
  if (appEnvResult.status === 0) {
    const value = appEnvResult.stdout.trim();
    if (value !== expectedAppEnv) {
      console.error(
        `APP_ENV mismatch in Doppler ${config}: got "${value}", expected "${expectedAppEnv}"`
      );
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `Doppler ${PROJECT}/${config} keys OK (${present.size} secrets, APP_ENV=${expectedAppEnv})`
);
