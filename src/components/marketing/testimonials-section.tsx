"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "בניתי עמוד נחיתה לסדנה תוך שעה — בלי מעצב ובלי מתכנת. קיבלתי 40 נרשמים ביום הראשון.",
    name: "מיכל כהן",
    role: "מנחת סדנאות",
    initials: "מכ",
  },
  {
    quote: "העורך הויזואלי חוסך לי שעות. הלקוחות שלי מקבלים עמוד מקצועי בעברית, עם טופס לידים שעובד מהרגע הראשון.",
    name: "אבי לוי",
    role: "יועץ שיווק דיגיטלי",
    initials: "אל",
  },
  {
    quote: "ניסיתי הכל — Wix, WordPress, Elementor. Cards זו הפעם הראשונה שהצלחתי לגמור עמוד נחיתה בלי להתעצבן.",
    name: "רונית שמעוני",
    role: "בעלת עסק קטן",
    initials: "רש",
  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="px-6 py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex rounded-full border border-[rgba(214,235,253,0.19)] px-3 py-1 text-xs font-medium text-[#a1a4a5]">
            המלצות
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#f0f0f0] md:text-5xl">
            מה אומרים עלינו
          </h2>
          <p className="mt-4 text-lg text-[#a1a4a5]">
            עסקים קטנים ויוצרי תוכן כבר בונים עם Cards
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={t.name}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariant}
              className="flex flex-col rounded-2xl border border-[rgba(214,235,253,0.19)] bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.05]"
            >
              {/* Star row */}
              <div className="mb-4 flex gap-0.5 text-[#ffc53d]">
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg key={si} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <p className="mb-6 flex-1 text-sm leading-relaxed text-[#f0f0f0]">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 border-t border-[rgba(214,235,253,0.19)] pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3b9eff]/15 text-xs font-bold text-[#3b9eff]">
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#f0f0f0]">
                    {t.name}
                  </div>
                  <div className="text-xs text-[#464a4d]">{t.role}</div>
                </div>
              </div>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
