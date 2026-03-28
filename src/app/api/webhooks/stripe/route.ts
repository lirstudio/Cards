import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    return NextResponse.json({ error: "no webhook secret" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "no signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.supabase_user_id;
    const planSlug = session.metadata?.plan_slug;
    if (userId && planSlug) {
      const { data: plan } = await admin
        .from("subscription_plans")
        .select("id")
        .eq("slug", planSlug)
        .maybeSingle();
      if (plan) {
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;
        await admin.from("user_subscriptions").upsert(
          {
            user_id: userId,
            plan_id: plan.id,
            status: "active",
            stripe_subscription_id: subId,
            current_period_end: null,
          },
          { onConflict: "user_id" },
        );
      }
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.supabase_user_id;
    if (userId) {
      const status =
        sub.status === "active" || sub.status === "trialing"
          ? "active"
          : sub.status === "past_due"
            ? "past_due"
            : "canceled";
      const periodEndSec = (sub as unknown as { current_period_end?: number }).current_period_end;
      await admin
        .from("user_subscriptions")
        .update({
          status,
          stripe_subscription_id: sub.id,
          current_period_end: periodEndSec
            ? new Date(periodEndSec * 1000).toISOString()
            : null,
        })
        .eq("user_id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
