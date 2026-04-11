"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function ShowcaseSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative overflow-hidden px-6 py-28 md:py-36">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(59,158,255,0.08)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div ref={ref} className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 text-center"
        >
          <div className="mb-4 inline-flex rounded-full border border-[rgba(214,235,253,0.19)] px-3 py-1 text-xs font-medium text-[#a1a4a5]">
            עורך ויזואלי
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#f0f0f0] md:text-5xl">
            עורך שמרגיש כמו קסם
          </h2>
          <p className="mt-4 text-lg text-[#a1a4a5]">
            גררו סקשנים, ערכו תוכן וצפו בתצוגה מקדימה בזמן אמת
          </p>
        </motion.div>

        {/* Editor screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative mt-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -top-16 mx-auto max-w-3xl"
          >
            <div className="h-full w-full rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,158,255,0.12)_0%,transparent_60%)] blur-3xl" />
          </div>

          <div
            className="relative overflow-hidden rounded-2xl border border-[rgba(214,235,253,0.19)]"
            style={{ boxShadow: "0 0 0 1px rgba(176,199,217,0.145), 0 40px 100px -20px rgba(0,0,0,0.5)" }}
          >
            <Image
              src="/marketing/editor-showcase.png"
              alt="עורך ויזואלי — גררו סקשנים ובנו עמוד נחיתה"
              width={1920}
              height={1080}
              className="w-full"
            />
          </div>
        </motion.div>

        {/* Feature highlights below the screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="mt-12 grid gap-6 md:grid-cols-3"
        >
          {[
            { title: "גרירה ושחרור", desc: "סדרו סקשנים בגרירה — שנו את הסדר בשנייה" },
            { title: "תצוגה מקדימה חיה", desc: "כל שינוי נראה מיד — מובייל, טאבלט ודסקטופ" },
            { title: "פרסום בלחיצה", desc: "מטיוטה לעמוד חי בלחיצה אחת" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/[0.02] p-5 text-center"
            >
              <h4 className="text-sm font-semibold text-[#f0f0f0]">{item.title}</h4>
              <p className="mt-1 text-xs text-[#a1a4a5]">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
