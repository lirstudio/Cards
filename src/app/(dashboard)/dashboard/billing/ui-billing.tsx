"use client";

import { useActionState } from "react";
import { startStripeCheckout } from "@/app/actions/billing";
import { he } from "@/lib/i18n/he";

async function checkoutAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const slug = String(formData.get("planSlug") ?? "");
  const r = await startStripeCheckout(slug);
  return r ?? null;
}

export function BillingClient({
  plans,
  currentPlanSlug,
  stripeConfigured,
}: {
  plans: {
    slug: string;
    name: string;
    interval: string;
    maxPages: number;
    stripeReady: boolean;
  }[];
  currentPlanSlug: string;
  stripeConfigured: boolean;
}) {
  const [state, action] = useActionState(checkoutAction, null);

  const paid = plans.filter((p) => p.slug !== "free");

  return (
    <div className="mt-8 space-y-6">
      {state?.error ? (
        <p className="rounded-lg bg-[#ffc53d]/10 px-3 py-2 text-sm text-[#ffc53d]">{state.error}</p>
      ) : null}

      <ul className="space-y-4">
        {plans.map((p) => (
          <li
            key={p.slug}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[rgba(214,235,253,0.19)] p-4"
          >
            <div>
              <div className="font-semibold text-[#f0f0f0]">{p.name}</div>
              <div className="text-sm text-[#a1a4a5]">
                עד {p.maxPages} עמודים
                {p.interval !== "none" ? ` · ${p.interval}` : null}
              </div>
              {p.slug === currentPlanSlug ? (
                <div className="mt-1 text-xs font-medium text-[#11ff99]">התוכנית הנוכחית</div>
              ) : null}
              {!p.stripeReady && p.slug !== "free" ? (
                <div className="mt-1 text-xs text-[#ffc53d]">נדרש מזהה מחיר ב־Stripe</div>
              ) : null}
            </div>
            {p.slug !== "free" && p.stripeReady && stripeConfigured ? (
              <form action={action}>
                <input type="hidden" name="planSlug" value={p.slug} />
                <button
                  type="submit"
                  className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black hover:bg-white/90"
                >
                  הירשמו לתוכנית
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>

      {!stripeConfigured ? (
        <p className="text-sm text-[#a1a4a5]">{he.stripeNotConfigured}</p>
      ) : null}

      {paid.every((p) => !p.stripeReady) && stripeConfigured ? (
        <p className="text-sm text-[#a1a4a5]">
          עדכנו בטבלת <code className="rounded bg-white/10 px-1">subscription_plans</code> את עמודת{" "}
          <code className="rounded bg-white/10 px-1">stripe_price_id</code> למזהי המחיר האמיתיים מ־Stripe.
        </p>
      ) : null}
    </div>
  );
}
