import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { he } from "@/lib/i18n/he";

export default async function SettingsSubscriptionPage() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = profile?.role === "admin";

  let planName = "—";
  let maxPages: number | null = null;
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("plan_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (sub?.plan_id) {
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("name_he, max_pages")
      .eq("id", sub.plan_id)
      .maybeSingle();
    if (plan) {
      planName = plan.name_he as string;
      maxPages = plan.max_pages as number;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#f0f0f0]">{he.settingsSubscription}</h1>
      <div className="mt-6 space-y-3 rounded-2xl border border-[rgba(214,235,253,0.19)] p-6">
        <div>
          <span className="text-sm text-[#a1a4a5]">תוכנית</span>
          <div className="font-semibold text-[#f0f0f0]">{planName}</div>
        </div>
        {isAdmin || maxPages != null ? (
          <div>
            <span className="text-sm text-[#a1a4a5]">מכסת עמודים</span>
            <div className="font-semibold text-[#f0f0f0]">
              {isAdmin ? he.dashboardQuotaUnlimited : maxPages}
            </div>
          </div>
        ) : null}
        {sub?.status ? (
          <div>
            <span className="text-sm text-[#a1a4a5]">סטטוס</span>
            <div className="font-semibold text-[#f0f0f0]">{sub.status}</div>
          </div>
        ) : null}
      </div>
      <Link
        href="/dashboard/billing"
        className="mt-6 inline-flex rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-white/90"
      >
        {he.billing}
      </Link>
    </div>
  );
}
