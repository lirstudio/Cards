import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { he } from "@/lib/i18n/he";
import { BillingClient } from "./ui-billing";

export default async function BillingPage() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("slug,name_he,billing_interval,max_pages,stripe_price_id")
    .in("slug", ["free", "pro_monthly", "pro_yearly"])
    .order("billing_interval", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentPlanSlug = "free";
  if (user) {
    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("plan_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (sub?.plan_id) {
      const { data: p } = await supabase
        .from("subscription_plans")
        .select("slug")
        .eq("id", sub.plan_id)
        .maybeSingle();
      if (p?.slug) currentPlanSlug = p.slug;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{he.billing}</h1>
      <p className="mt-2 text-neutral-600">
        שדרגו את המנוי כדי לפתוח מכסות גבוהות יותר ולחבר מחירי Stripe אמיתיים (הגדירו מזהי מחיר ב־Supabase
        וב־Stripe).
      </p>
      <BillingClient
        plans={(plans ?? []).map((p) => ({
          slug: p.slug,
          name: p.name_he,
          interval: p.billing_interval,
          maxPages: p.max_pages,
          stripeReady: Boolean(p.stripe_price_id),
        }))}
        currentPlanSlug={currentPlanSlug}
        stripeConfigured={Boolean(process.env.STRIPE_SECRET_KEY)}
      />
    </div>
  );
}
