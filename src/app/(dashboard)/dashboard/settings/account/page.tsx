import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { he } from "@/lib/i18n/he";
import { PasswordResetForm } from "./ui-password-form";

export default async function SettingsAccountPage() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-2xl font-bold">{he.settingsAccount}</h1>
      <p className="mt-2 text-sm text-neutral-600">
        כתובת האימייל משמשת להתחברות. לא ניתן לשנות אותה מהממשק הזה — נדרש שירות Supabase Auth.
      </p>
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="text-sm font-medium text-neutral-500">{he.email}</div>
        <div className="mt-1 font-medium" dir="ltr">
          {user?.email ?? "—"}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="font-semibold">איפוס סיסמה</h2>
        <p className="mt-1 text-sm text-neutral-600">
          יישלח מייל עם קישור לאיפוס הסיסמה לכתובת שלעיל.
        </p>
        <PasswordResetForm />
      </div>
    </div>
  );
}
