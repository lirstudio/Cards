"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

/* ── Inline SVG icons (24x24 stroke) ── */

function IconEditor() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1.06 1.06 0 0 1 1.5 0l1.5 1.5a1.06 1.06 0 0 1 0 1.5L12 15l-4 1 1-4Z" />
    </svg>
  );
}

function IconSections() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="6" rx="1" />
      <rect x="3" y="12" width="8" height="9" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
    </svg>
  );
}

function IconTemplates() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconForms() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
    </svg>
  );
}

function IconTheme() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="13.5" r="2.5" />
      <circle cx="17.5" cy="13.5" r="2.5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10" />
    </svg>
  );
}

function IconPublish() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  );
}

function IconMobile() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function IconAnalytics() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m7 16 4-8 4 5 5-6" />
    </svg>
  );
}

const FEATURES: Feature[] = [
  {
    icon: <IconEditor />,
    title: "עורך ויזואלי",
    description: "גררו סקשנים, ערכו תוכן וצפו בתוצאה בזמן אמת — ללא שורת קוד.",
  },
  {
    icon: <IconSections />,
    title: "ספריית סקשנים",
    description: "Hero, המלצות, FAQ, גלריה, טפסים ועוד — בחרו עיצוב מהספרייה והתאימו.",
  },
  {
    icon: <IconTemplates />,
    title: "תבניות מוכנות",
    description: "התחילו מתבנית מעוצבת ושנו לפי הצורך — חוסכים שעות עבודה.",
  },
  {
    icon: <IconForms />,
    title: "טפסי לידים",
    description: "טפסי יצירת קשר מובנים בכל עמוד. הלידים נשמרים ומחכים לכם.",
  },
  {
    icon: <IconTheme />,
    title: "ערכות צבעים",
    description: "צבע ראשי, רקע, כותרות וטקסט — התאימו כל עמוד למותג שלכם.",
  },
  {
    icon: <IconPublish />,
    title: "פרסום מיידי",
    description: "פרסמו בלחיצה וקבלו כתובת ציבורית ייחודית תחת דומיין אחד.",
  },
  {
    icon: <IconMobile />,
    title: "מובייל ראשון",
    description: "כל העמודים רספונסיביים מקצה לקצה — נראים מושלם בכל מסך.",
  },
  {
    icon: <IconAnalytics />,
    title: "ניהול מתקדם",
    description: "לוח בקרה מלא, סטטיסטיקות שליחות טפסים וניהול משתמשים.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative px-6 py-28 md:py-36">
      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex rounded-full border border-[rgba(214,235,253,0.19)] px-3 py-1 text-xs font-medium text-[#a1a4a5]">
            יכולות
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#f0f0f0] md:text-5xl">
            כל מה שצריך לעמוד נחיתה מושלם
          </h2>
          <p className="mt-4 text-lg text-[#a1a4a5]">
            כלים מקצועיים, עיצוב מרהיב ופרסום מהיר — הכל במקום אחד.
          </p>
        </motion.div>

        {/* Feature cards — top row 4 */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.slice(0, 4).map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
              className="group rounded-2xl border border-[rgba(214,235,253,0.19)] bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.06]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(214,235,253,0.19)] text-[#3b9eff]">
                {f.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#f0f0f0]">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#a1a4a5]">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Sections library visual — full-width cinematic banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="relative my-8 overflow-hidden rounded-2xl border border-[rgba(214,235,253,0.19)]"
          style={{ boxShadow: "0 0 0 1px rgba(176,199,217,0.145)" }}
        >
          <Image
            src="/marketing/sections-library.png"
            alt="ספריית סקשנים — Hero, המלצות, FAQ, גלריה, טפסים ועוד"
            width={1920}
            height={900}
            className="w-full"
          />
          {/* Overlay text */}
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 md:p-12">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-[rgba(214,235,253,0.19)] bg-black/60 px-3 py-1 text-xs font-medium text-[#a1a4a5] backdrop-blur-sm">
                ספריית סקשנים
              </div>
              <h3 className="text-xl font-bold text-[#f0f0f0] md:text-2xl">
                סקשנים מעוצבים, מוכנים לשימוש
              </h3>
              <p className="mt-1 max-w-lg text-sm text-[#a1a4a5]">
                Hero, שירותים, המלצות, גלריה, FAQ, טופס יצירת קשר — כל בלוק מעוצב ומוכן. פשוט בחרו והתאימו.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature cards — bottom row 4 */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.slice(4).map((f, i) => (
            <motion.div
              key={f.title}
              custom={i + 4}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={cardVariants}
              className="group rounded-2xl border border-[rgba(214,235,253,0.19)] bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.06]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(214,235,253,0.19)] text-[#3b9eff]">
                {f.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#f0f0f0]">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#a1a4a5]">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
