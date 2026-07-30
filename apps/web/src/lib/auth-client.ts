"use client";

import { createPaadelAuthClient } from "@paadel/auth/client";
import { clientEnv } from "@paadel/env/client";

export const authClient = createPaadelAuthClient(clientEnv.NEXT_PUBLIC_API_URL);
