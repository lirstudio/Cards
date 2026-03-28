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
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{state.error}</p>
      ) : null}

      <ul className="space-y-4">
        {plans.map((p) => (
          <li
            key={p.slug}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4"
          >
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-neutral-600">
                עד {p.maxPages} עמודים
                {p.interval !== "none" ? ` · ${p.interval}` : null}
              </div>
              {p.slug === currentPlanSlug ? (
                <div className="mt-1 text-xs font-medium text-green-700">התוכנית הנוכחית</div>
              ) : null}
              {!p.stripeReady && p.slug !== "free" ? (
                <div className="mt-1 text-xs text-amber-700">נדרש מזהה מחיר ב־Stripe</div>
              ) : null}
            </div>
            {p.slug !== "free" && p.stripeReady && stripeConfigured ? (
              <form action={action}>
                <input type="hidden" name="planSlug" value={p.slug} />
                <button
                  type="submit"
                  className="rounded-full bg-[var(--lc-primary)] px-5 py-2 text-sm font-medium text-white"
                >
                  הירשמו לתוכנית
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>

      {!stripeConfigured ? (
        <p className="text-sm text-neutral-500">{he.stripeNotConfigured}</p>
      ) : null}

      {paid.every((p) => !p.stripeReady) && stripeConfigured ? (
        <p className="text-sm text-neutral-500">
          עדכנו בטבלת <code className="rounded bg-neutral-100 px-1">subscription_plans</code> את עמודת{" "}
          <code className="rounded bg-neutral-100 px-1">stripe_price_id</code> למזהי המחיר האמיתיים מ־Stripe.
        </p>
      ) : null}
    </div>
  );
}
