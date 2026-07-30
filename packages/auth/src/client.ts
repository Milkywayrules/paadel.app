import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export function createPaadelAuthClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [organizationClient()],
  });
}

export type PaadelAuthClient = ReturnType<typeof createPaadelAuthClient>;
