import type { SupabaseClient } from "@supabase/supabase-js";

/** Plan caps are seeded in supabase/migrations/20260328140000_init.sql (`subscription_plans.max_pages`). */

export type Quota = {
  maxPages: number;
  /** סה״כ עמודי נחיתה (טיוטה + מפורסם) — משמש לאכיפת יצירת עמוד חדש. */
  currentCount: number;
  /** עמודים במצב published — מוצג ב־KPI מול המכסה. */
  publishedCount: number;
  allowedTier: number;
  canCreate: boolean;
  /** אדמין: ללא תקרת max_pages ליצירת עמודים. */
  unlimited?: boolean;
};

export async function getUserQuota(
  supabase: SupabaseClient,
  userId: string,
): Promise<Quota | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";

  const [{ count: totalCount }, { count: publishedCount }] = await Promise.all([
    supabase.from("landing_pages").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("landing_pages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "published"),
  ]);

  const total = totalCount ?? 0;
  const published = publishedCount ?? 0;

  if (isAdmin) {
    let allowedTier = 999;
    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("plan_id, status")
      .eq("user_id", userId)
      .maybeSingle();
    if (sub?.plan_id && sub.status === "active") {
      const { data: planRow } = await supabase
        .from("subscription_plans")
        .select("allowed_template_tier")
        .eq("id", sub.plan_id)
        .maybeSingle();
      if (planRow) allowedTier = planRow.allowed_template_tier as number;
    }
    return {
      maxPages: 0,
      currentCount: total,
      publishedCount: published,
      allowedTier,
      canCreate: true,
      unlimited: true,
    };
  }

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

  const maxPages = plan.max_pages as number;
  return {
    maxPages,
    currentCount: total,
    publishedCount: published,
    allowedTier: plan.allowed_template_tier as number,
    canCreate: total < maxPages,
    unlimited: false,
  };
}
