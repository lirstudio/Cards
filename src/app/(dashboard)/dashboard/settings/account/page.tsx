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
      <h1 className="text-2xl font-bold text-[#f0f0f0]">{he.settingsAccount}</h1>
      <p className="mt-2 text-sm text-[#a1a4a5]">
        כתובת האימייל משמשת להתחברות. לא ניתן לשנות אותה מהממשק הזה — נדרש שירות Supabase Auth.
      </p>
      <div className="mt-6 rounded-2xl border border-[rgba(214,235,253,0.19)] p-4">
        <div className="text-sm font-medium text-[#a1a4a5]">{he.email}</div>
        <div className="mt-1 font-medium text-[#f0f0f0]" dir="ltr">
          {user?.email ?? "—"}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="font-semibold text-[#f0f0f0]">איפוס סיסמה</h2>
        <p className="mt-1 text-sm text-[#a1a4a5]">
          יישלח מייל עם קישור לאיפוס הסיסמה לכתובת שלעיל.
        </p>
        <PasswordResetForm />
      </div>
    </div>
  );
}
