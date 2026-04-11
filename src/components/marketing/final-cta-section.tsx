"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function FinalCtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="relative px-6 py-28 md:py-36">
      {/* Gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(59,158,255,0.1)_0%,transparent_70%)] blur-3xl" />
      </div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[rgba(214,235,253,0.19)] bg-white/[0.02]"
        style={{ boxShadow: "0 0 0 1px rgba(176,199,217,0.145), 0 40px 80px -20px rgba(0,0,0,0.4)" }}
      >
        <div className="flex flex-col items-center md:flex-row">
          {/* 3D icon */}
          <div className="hidden shrink-0 md:block md:w-80">
            <Image
              src="/marketing/builder-icon-3d.png"
              alt=""
              width={800}
              height={800}
              className="w-full"
              aria-hidden
            />
          </div>

          {/* Text + CTAs */}
          <div className="flex-1 p-10 text-center md:p-12 md:text-right">
            <h2 className="text-3xl font-bold tracking-tight text-[#f0f0f0] md:text-4xl">
              מוכנים לבנות את עמוד הנחיתה
              <br className="hidden sm:block" />
              הבא שלכם?
            </h2>
            <p className="mt-4 text-lg text-[#a1a4a5]">
              הצטרפו בחינם ובנו עמוד מקצועי תוך דקות — בלי קוד, בלי מעצב.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <Link
                href="/signup"
                className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              >
                התחילו עכשיו בחינם
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-[rgba(214,235,253,0.19)] px-8 py-3.5 text-sm font-medium text-[#f0f0f0] transition-colors hover:bg-white/10"
              >
                התחברות
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
