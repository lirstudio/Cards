"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolvePublicOrigin } from "@/lib/public-site-url";
import { formatAuthEmailError } from "@/lib/supabase-auth-errors";

export async function updateProfileDisplayName(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean } | null> {
  const name = String(formData.get("displayName") ?? "").trim();
  if (!name) return { error: "נא למלא שם תצוגה" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "לא מחובר" };

  const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/settings", "layout");
  return { ok: true };
}

export async function requestPasswordReset(
  previousState: { error?: string; ok?: boolean; warnNoExplicitSiteUrl?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean; warnNoExplicitSiteUrl?: boolean } | null> {
  void previousState;
  void formData;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "לא מחובר" };

  const { origin, usedEnvOverride } = await resolvePublicOrigin();
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", "/reset-password");
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: callback.toString(),
  });

  if (error) return { error: formatAuthEmailError(error.message) };
  return { ok: true, warnNoExplicitSiteUrl: !usedEnvOverride };
}
