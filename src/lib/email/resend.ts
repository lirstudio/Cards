import { Resend } from "resend";

/** Resend client — server-only. Throws if RESEND_API_KEY is missing. */
export function createResendClient(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("Missing RESEND_API_KEY");
  return new Resend(key);
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL?.trim() ?? "onboarding@resend.dev";
