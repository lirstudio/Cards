"use client";

import { useEffect, useRef, useState } from "react";
import { LC_SECTION_PX } from "@/lib/landing/section-shell";
import {
  landingSectionDomId,
  LANDING_SECTION_ANCHOR_CLASS,
} from "@/lib/landing/page-nav";

export type StatHighlightItem = { value: string; label?: string };

function parseStatValue(raw: string) {
  const trimmed = raw.trim();
  const m = trimmed.match(/^([^0-9]*)(\d+(?:[.,]\d+)?)([^0-9]*)$/);
  if (!m) return null;
  const [, prefix, numPart, suffix] = m;
  const normalized = numPart.replace(",", ".");
  const target = parseFloat(normalized);
  if (!Number.isFinite(target)) return null;
  const decimals = normalized.includes(".") ? (normalized.split(".")[1]?.length ?? 0) : 0;
  return { prefix, suffix, target, decimals };
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function formatAnimated(prefix: string, suffix: string, current: number, decimals: number) {
  const body =
    decimals > 0 ? current.toFixed(decimals) : String(Math.round(current));
  return `${prefix}${body}${suffix}`;
}

function AnimatedStatValue({
  value,
  headingColor,
  reducedMotion,
  runAnimation,
  relaxedIntersection,
}: {
  value: string;
  headingColor: string;
  reducedMotion: boolean;
  runAnimation: boolean;
  /** Thumbnail previews: lower intersection threshold so count-up starts reliably. */
  relaxedIntersection?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(() => {
    if (!runAnimation) return value;
    const p = parseStatValue(value);
    if (!p) return value;
    return formatAnimated(p.prefix, p.suffix, 0, p.decimals);
  });

  useEffect(() => {
    const parsed = parseStatValue(value);
    if (!parsed || !runAnimation || reducedMotion) {
      setText(value);
      return;
    }

    setText(formatAnimated(parsed.prefix, parsed.suffix, 0, parsed.decimals));

    const el = containerRef.current;
    if (!el) return;

    let rafId = 0;
    const durationMs = 1800;
    let observer: IntersectionObserver | null = null;

    const startAnimation = () => {
      const start = performance.now();
      const from = 0;
      const to = parsed.target;

      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = easeOutCubic(t);
        const current = from + (to - from) * eased;
        setText(formatAnimated(parsed.prefix, parsed.suffix, current, parsed.decimals));
        if (t < 1) {
          rafId = requestAnimationFrame(frame);
        } else {
          setText(value);
        }
      };
      rafId = requestAnimationFrame(frame);
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer?.disconnect();
        observer = null;
        startAnimation();
      },
      relaxedIntersection
        ? { threshold: 0, rootMargin: "0px 0px 40% 0px" }
        : { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [value, runAnimation, reducedMotion, relaxedIntersection]);

  return (
    <div
      ref={containerRef}
      className="text-4xl font-bold tabular-nums tracking-tight md:text-5xl"
      style={{ color: headingColor }}
    >
      {text}
    </div>
  );
}

export function StatsHighlightRow({
  stats,
  headingColor,
  labelColor,
  sectionPaddingClass,
  embedded,
  editorPreview,
  dir,
  disableCountUp = false,
  allowCountUpInEmbeddedPreview = false,
  sectionId,
}: {
  stats: StatHighlightItem[];
  headingColor: string;
  labelColor: string;
  /** מ־variant (py-8, py-12, …) או undefined לברירת מחדל */
  sectionPaddingClass?: string;
  embedded: boolean;
  editorPreview: boolean;
  dir?: string;
  disableCountUp?: boolean;
  allowCountUpInEmbeddedPreview?: boolean;
  sectionId: string;
}) {
  const sectionPad =
    sectionPaddingClass ?? (embedded ? "py-3 @md:py-4" : "py-16 @md:py-20");

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const runAnimation =
    !disableCountUp &&
    (!(editorPreview && embedded) || allowCountUpInEmbeddedPreview);

  return (
    <section
      id={landingSectionDomId(sectionId)}
      className={`${sectionPad} ${embedded ? "px-1 sm:px-2" : `${LC_SECTION_PX} ${LANDING_SECTION_ANCHOR_CLASS}`} ${embedded ? "" : "lc-landing-section box-border w-full min-w-0 max-w-full"}`}
      dir={dir ?? "rtl"}
    >
      <div
        className={
          embedded ? "mx-auto w-full min-w-0 max-w-none" : "mx-auto min-w-0 max-w-5xl"
        }
      >
        <div
          className={
            embedded
              ? "grid grid-cols-1 gap-5 @min-[640px]:grid-cols-3 @min-[640px]:gap-4 @md:gap-6"
              : "grid grid-cols-1 gap-12 @min-[640px]:grid-cols-3 @min-[640px]:gap-8 @md:gap-12 @min-[1024px]:gap-16"
          }
        >
          {stats.map((s, i) => {
            const label = s.label?.trim();
            return (
              <div
                key={`${s.value}-${i}`}
                className="flex flex-col items-center text-center motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:scale-[1.04]"
              >
                <AnimatedStatValue
                  value={s.value}
                  headingColor={headingColor}
                  reducedMotion={reducedMotion}
                  runAnimation={runAnimation}
                  relaxedIntersection={allowCountUpInEmbeddedPreview}
                />
                {label ? (
                  <p
                    className="mt-4 max-w-[260px] text-base leading-relaxed md:text-[1.05rem]"
                    style={{ color: labelColor }}
                  >
                    {label}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
