"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

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

export async function signUpWithEmail(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "");
  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${site}/dashboard`,
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

export async function requestPasswordResetPublic(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "יש להזין כתובת אימייל" };
  const supabase = await createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const cookieStore = await cookies();
  cookieStore.set("password_recovery", "1", {
    maxAge: 600,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${site}/auth/callback?next=/auth/update-password`,
  });
  return { success: true };
}

export async function updatePassword(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 6) return { error: "הסיסמה חייבת להכיל לפחות 6 תווים" };
  if (password !== confirm) return { error: "הסיסמאות אינן תואמות" };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
