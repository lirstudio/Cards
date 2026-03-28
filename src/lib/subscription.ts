import type { SupabaseClient } from "@supabase/supabase-js";

export type Quota = {
  maxPages: number;
  currentCount: number;
  allowedTier: number;
  canCreate: boolean;
};

export async function getUserQuota(
  supabase: SupabaseClient,
  userId: string,
): Promise<Quota | null> {
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("plan_id, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (!sub?.plan_id || sub.status !== "active") return null;

  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("max_pages, allowed_template_tier")
    .eq("id", sub.plan_id)
    .maybeSingle();

  if (!plan) return null;

  const { count } = await supabase
    .from("landing_pages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const currentCount = count ?? 0;
  const maxPages = plan.max_pages;
  return {
    maxPages,
    currentCount,
    allowedTier: plan.allowed_template_tier,
    canCreate: currentCount < maxPages,
  };
}
