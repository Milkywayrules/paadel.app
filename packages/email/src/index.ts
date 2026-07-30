import { serverEnv } from "@paadel/env/server";
import { Resend } from "resend";
import { WelcomeEmail } from "./templates/welcome.js";

export interface SendWelcomeEmailInput {
  appUrl: string;
  displayName: string;
  to: string;
}

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  resendClient ??= new Resend(serverEnv.RESEND_API_KEY);
  return resendClient;
}

export async function sendWelcomeEmail(
  input: SendWelcomeEmailInput
): Promise<{ id: string }> {
  const result = await getResendClient().emails.send({
    from: serverEnv.EMAIL_FROM,
    react: WelcomeEmail({
      appUrl: input.appUrl,
      displayName: input.displayName,
    }),
    subject: "Welcome to Paadel",
    to: input.to,
  });

  if (result.error) {
    throw new Error(`Failed to send welcome email: ${result.error.message}`);
  }

  return { id: result.data?.id ?? "unknown" };
}

export { WelcomeEmail } from "./templates/welcome.js";
