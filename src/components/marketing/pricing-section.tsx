"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface PlanCard {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
}

const PLANS: PlanCard[] = [
  {
    name: "חינם",
    price: "₪0",
    period: "לתמיד",
    description: "מושלם להתחלה — בנו עד 5 עמודים בלי עלות.",
    features: [
      "עד 5 עמודי נחיתה",
      "עורך ויזואלי מלא",
      "ספריית סקשנים",
      "טפסי לידים",
      "כתובת ציבורית ייחודית",
      "עיצוב רספונסיבי",
    ],
    cta: "התחילו בחינם",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "מקצועי",
    price: "₪49",
    period: "לחודש",
    description: "לעסקים שרוצים יותר עמודים ויכולות מתקדמות.",
    features: [
      "עד 25 עמודי נחיתה",
      "הכל מהתוכנית החינמית",
      "תבניות פרימיום",
      "ערכות צבעים מותאמות",
      "תמיכה בעדיפות",
      "ללא מגבלת טפסים",
    ],
    cta: "שדרגו עכשיו",
    href: "/signup",
    highlighted: true,
  },
];

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#11ff99]">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" className="px-6 py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex rounded-full border border-[rgba(214,235,253,0.19)] px-3 py-1 text-xs font-medium text-[#a1a4a5]">
            תמחור
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#f0f0f0] md:text-5xl">
            תמחור פשוט, בלי הפתעות
          </h2>
          <p className="mt-4 text-lg text-[#a1a4a5]">
            התחילו בחינם, שדרגו כשתהיו מוכנים.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariant}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-[#3b9eff]/40 bg-[#3b9eff]/[0.04]"
                  : "border-[rgba(214,235,253,0.19)] bg-white/[0.02]"
              }`}
              style={
                plan.highlighted
                  ? { boxShadow: "0 0 0 1px rgba(59,158,255,0.2), 0 24px 60px -16px rgba(59,158,255,0.1)" }
                  : { boxShadow: "0 0 0 1px rgba(176,199,217,0.145)" }
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#3b9eff] px-3 py-0.5 text-xs font-semibold text-white">
                  מומלץ
                </div>
              )}

              <h3 className="text-lg font-semibold text-[#f0f0f0]">
                {plan.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-[#f0f0f0]">
                  {plan.price}
                </span>
                <span className="text-sm text-[#a1a4a5]">{plan.period}</span>
              </div>
              <p className="mt-3 text-sm text-[#a1a4a5]">
                {plan.description}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#f0f0f0]">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-white text-black hover:bg-white/90"
                    : "border border-[rgba(214,235,253,0.19)] text-[#f0f0f0] hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
