import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { he } from "@/lib/i18n/he";
import { ProfileForm } from "./ui-profile-form";

export default async function SettingsProfilePage() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div>
      <h1 className="text-2xl font-bold">{he.settingsProfile}</h1>
      <p className="mt-2 text-sm text-neutral-600">השם מוצג באזור האישי ובמסכי המערכת.</p>
      <ProfileForm initialName={(profile?.display_name as string) ?? ""} />
    </div>
  );
}
