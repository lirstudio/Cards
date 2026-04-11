"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function IconSignup() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  );
}

function IconDesign() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1.06 1.06 0 0 1 1.5 0l1.5 1.5a1.06 1.06 0 0 1 0 1.5L12 15l-4 1 1-4Z" />
    </svg>
  );
}

function IconRocket() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

const STEPS = [
  {
    num: "1",
    title: "הרשמה",
    description: "צרו חשבון בחינם תוך שניות — אימייל וסיסמה, בלי כרטיס אשראי.",
    icon: <IconSignup />,
  },
  {
    num: "2",
    title: "עיצוב",
    description: "בחרו תבנית, הוסיפו סקשנים מהספרייה וערכו תוכן בעורך הויזואלי.",
    icon: <IconDesign />,
  },
  {
    num: "3",
    title: "פרסום",
    description: "לחצו ״פרסם״ וקבלו כתובת ציבורית — העמוד שלכם באוויר.",
    icon: <IconRocket />,
  },
] as const;

const stepVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="relative px-6 py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex rounded-full border border-[rgba(214,235,253,0.19)] px-3 py-1 text-xs font-medium text-[#a1a4a5]">
            שלושה צעדים
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#f0f0f0] md:text-5xl">
            איך זה עובד
          </h2>
          <p className="mt-4 text-lg text-[#a1a4a5]">
            שלושה צעדים פשוטים לעמוד נחיתה מקצועי
          </p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3 md:gap-6">
          {/* Connecting gradient line (desktop only) */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-16 right-[16.67%] left-[16.67%] hidden h-px md:block"
            style={{
              background:
                "linear-gradient(to left, transparent, rgba(59,158,255,0.3) 30%, rgba(59,158,255,0.3) 70%, transparent)",
            }}
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={stepVariant}
              className="relative flex flex-col items-center rounded-2xl border border-[rgba(214,235,253,0.19)] bg-white/[0.02] p-8 text-center transition-colors hover:bg-white/[0.04]"
            >
              <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(214,235,253,0.19)] bg-[#3b9eff]/[0.08] text-[#3b9eff]">
                {step.icon}
              </div>
              <div className="mb-2 text-xs font-medium text-[#3b9eff]">
                שלב {step.num}
              </div>
              <h3 className="text-lg font-semibold text-[#f0f0f0]">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#a1a4a5]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
