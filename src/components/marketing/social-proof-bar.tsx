"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 500, suffix: "+", label: "עמודים שנבנו" },
  { value: 12, suffix: "", label: "סוגי סקשנים" },
  { value: 98, suffix: "%", label: "שביעות רצון" },
  { value: 30, suffix: "שנ׳", label: "זמן בנייה ממוצע" },
];

function AnimatedCounter({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 1500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export function SocialProofBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="relative px-6 py-16 md:py-20">
      {/* Frost divider line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-4xl"
        style={{
          background:
            "linear-gradient(to left, transparent, rgba(214,235,253,0.19) 20%, rgba(214,235,253,0.19) 80%, transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-extrabold tracking-tight text-[#f0f0f0] md:text-4xl">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} inView={inView} />
            </div>
            <div className="mt-1 text-sm text-[#a1a4a5]">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-px max-w-4xl"
        style={{
          background:
            "linear-gradient(to left, transparent, rgba(214,235,253,0.19) 20%, rgba(214,235,253,0.19) 80%, transparent)",
        }}
      />
    </section>
  );
}
