"use client";

import { useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef } from "react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "האם צריך ידע טכני?",
    a: "ממש לא. העורך הויזואלי מאפשר לבנות עמוד שלם בגרירה ולחיצה — בלי שורת קוד אחת.",
  },
  {
    q: "כמה עמודים אפשר ליצור בחינם?",
    a: "בתוכנית החינמית ניתן ליצור עד 5 עמודי נחיתה, עם גישה מלאה לעורך ולספריית הסקשנים.",
  },
  {
    q: "האם העמודים מותאמים למובייל?",
    a: "כל העמודים שנבנים ב-Cards רספונסיביים באופן אוטומטי ונראים מצוין בכל גודל מסך.",
  },
  {
    q: "איך מקבלים את הלידים מהטפסים?",
    a: "כל שליחת טופס נשמרת במערכת. בעתיד נוסיף התראות במייל ואינטגרציות נוספות.",
  },
  {
    q: "אפשר לחבר דומיין מותאם אישית?",
    a: "כרגע כל העמודים מוגשים תחת הדומיין הראשי עם slug ייחודי. תמיכה בדומיינים מותאמים תגיע בקרוב.",
  },
  {
    q: "איך משדרגים לתוכנית המקצועית?",
    a: "לאחר ההרשמה, גשו לדף המנוי בהגדרות ובחרו בתוכנית המקצועית — התשלום מתבצע באופן מאובטח דרך Stripe.",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-[#a1a4a5] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function FaqSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="px-6 py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex rounded-full border border-[rgba(214,235,253,0.19)] px-3 py-1 text-xs font-medium text-[#a1a4a5]">
            FAQ
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#f0f0f0] md:text-5xl">
            שאלות נפוצות
          </h2>
          <p className="mt-4 text-lg text-[#a1a4a5]">
            לא מצאתם תשובה? דברו איתנו.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="divide-y divide-[rgba(214,235,253,0.19)] rounded-2xl border border-[rgba(214,235,253,0.19)]"
        >
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right transition-colors hover:bg-white/[0.03]"
                >
                  <span className="text-sm font-medium text-[#f0f0f0]">
                    {item.q}
                  </span>
                  <ChevronIcon open={isOpen} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-[#a1a4a5]">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
