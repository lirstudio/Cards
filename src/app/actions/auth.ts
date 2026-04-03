"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { he } from "@/lib/i18n/he";
import { resolvePublicOrigin } from "@/lib/public-site-url";
import { formatAuthEmailError } from "@/lib/supabase-auth-errors";

export async function signInWithEmail(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "אימייל או סיסמה שגויים" };
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function requestPasswordReset(
  _prev: { error?: string; ok?: boolean; warnNoExplicitSiteUrl?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean; warnNoExplicitSiteUrl?: boolean } | null> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "נא להזין כתובת אימייל" };

  // If Resend + Service Role Key are configured, bypass Supabase mailer entirely
  // (avoids rate limits and custom SMTP dependency).
  const hasResend = Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );

  if (hasResend) {
    const { sendPasswordResetEmail } = await import("@/lib/email/send-password-reset");
    const err = await sendPasswordResetEmail(email);
    if (err) return { error: err };
    return { ok: true, warnNoExplicitSiteUrl: false };
  }

  // Fallback: Supabase built-in mailer (subject to rate limits)
  const supabase = await createClient();
  const { origin, usedEnvOverride } = await resolvePublicOrigin();
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", "/reset-password");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callback.toString(),
  });
  if (error) return { error: formatAuthEmailError(error.message) };
  return {
    ok: true,
    warnNoExplicitSiteUrl: !usedEnvOverride,
  };
}

export async function updatePasswordAfterReset(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  if (password.length < 6) return { error: he.passwordTooShort };
  if (password !== confirm) return { error: he.passwordsDoNotMatch };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUpWithEmail(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "");
  const supabase = await createClient();
  const { origin } = await resolvePublicOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/dashboard`,
      data: { display_name: displayName },
    },
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
