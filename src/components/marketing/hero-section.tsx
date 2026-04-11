"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-0 md:pt-40">
      {/* Gradient orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
      >
        <div className="h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(59,158,255,0.14)_0%,transparent_70%)] blur-3xl" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 right-1/4"
      >
        <div className="h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Text content */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            className="mb-6 inline-flex rounded-full border border-[rgba(214,235,253,0.19)] px-4 py-1.5 text-xs font-medium text-[#a1a4a5]"
          >
            <span className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#11ff99]" />
            פלטפורמת עמודי נחיתה מקצועית בעברית
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-4xl font-extrabold leading-[1.08] tracking-tight text-[#f0f0f0] sm:text-6xl md:text-7xl lg:text-8xl"
          >
            בנו עמודי נחיתה
            <br />
            <span className="bg-gradient-to-l from-[#3b9eff] via-[#a78bfa] to-[#3b9eff] bg-clip-text text-transparent">
              שמוכרים
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-6 max-w-2xl text-base leading-relaxed text-[#a1a4a5] sm:text-lg md:text-xl"
          >
            עורך ויזואלי, ספריית סקשנים מוכנה, טפסי לידים ופרסום מיידי —
            הכל תחת דומיין אחד, בעברית מלאה.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/signup"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
            >
              התחילו בחינם
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-[rgba(214,235,253,0.19)] px-8 py-3.5 text-sm font-medium text-[#f0f0f0] transition-colors hover:bg-white/10"
            >
              ראו איך זה עובד
            </a>
          </motion.div>
        </motion.div>

        {/* Hero product mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-16 md:mt-24"
        >
          {/* Glow behind image */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -top-10 mx-auto max-w-3xl"
          >
            <div className="h-full w-full rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,158,255,0.15)_0%,transparent_60%)] blur-3xl" />
          </div>

          <div
            className="relative overflow-hidden rounded-2xl border border-[rgba(214,235,253,0.19)]"
            style={{ boxShadow: "0 0 0 1px rgba(176,199,217,0.145), 0 40px 100px -20px rgba(0,0,0,0.6)" }}
          >
            <Image
              src="/marketing/hero-mockup.png"
              alt="Cards — בנו עמודי נחיתה מקצועיים"
              width={1920}
              height={1080}
              className="w-full"
              priority
            />
          </div>

          {/* Bottom gradient fade into next section */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-1 h-40 bg-gradient-to-t from-black to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
