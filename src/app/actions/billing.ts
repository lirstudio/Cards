"use server";

import Stripe from "stripe";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { he } from "@/lib/i18n/he";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function startStripeCheckout(
  planSlug: string,
): Promise<{ error: string } | null> {
  const stripe = getStripe();
  if (!stripe) return { error: he.stripeNotConfigured };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: he.stripeNotConfigured };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "לא מחובר" };

  const admin = createAdminClient();
  const { data: plan } = await admin
    .from("subscription_plans")
    .select("id,stripe_price_id")
    .eq("slug", planSlug)
    .maybeSingle();

  if (!plan?.stripe_price_id) {
    return { error: he.stripeNotConfigured };
  }

  const { data: profile } = await admin.from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();

  let customerId = profile?.stripe_customer_id as string | null | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: `${site}/dashboard/billing?success=1`,
    cancel_url: `${site}/dashboard/billing`,
    metadata: {
      supabase_user_id: user.id,
      plan_slug: planSlug,
    },
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        plan_slug: planSlug,
      },
    },
  });

  if (session.url) redirect(session.url);
  return { error: "לא נוצר קישור תשלום" };
}
