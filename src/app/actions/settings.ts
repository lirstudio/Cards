"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
  previousState: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean } | null> {
  void previousState;
  void formData;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "לא מחובר" };

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const callback = new URL("/auth/callback", site);
  callback.searchParams.set("next", "/reset-password");
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: callback.toString(),
  });

  if (error) return { error: error.message };
  return { ok: true };
}
