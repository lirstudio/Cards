"use client";

import { LC_SECTION_SHELL } from "@/lib/landing/section-shell";
import {
  landingSectionDomId,
  LANDING_SECTION_ANCHOR_CLASS,
} from "@/lib/landing/page-nav";
import { ManualHorizontalCarousel } from "./manual-horizontal-carousel";

export type TestimonialItem = {
  headline: string;
  body?: string;
  authorName: string;
  authorTitle?: string;
};

function TestimonialCard({ t }: { t: TestimonialItem }) {
  return (
    <article
      className="lc-testimonial-card w-[min(320px,calc(100vw-2.5rem))] shrink-0 rounded-3xl bg-white p-5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.12)] sm:w-[min(320px,90vw)] sm:p-8 md:min-w-[300px]"
    >
      <h3 className="mb-3 break-words text-base font-bold text-neutral-900 sm:text-lg">
        {t.headline}
      </h3>
      {t.body ? (
        <p className="mb-6 text-sm leading-relaxed text-neutral-600">{t.body}</p>
      ) : null}
      <div className="mt-auto flex items-end justify-between gap-4 border-t border-neutral-100 pt-4">
        <div>
          <div className="font-semibold text-neutral-900">{t.authorName}</div>
          {t.authorTitle ? (
            <div className="text-sm text-neutral-500">{t.authorTitle}</div>
          ) : null}
        </div>
        <span className="text-2xl text-neutral-800" aria-hidden>
          💬
        </span>
      </div>
    </article>
  );
}

/**
 * מרקיי אופקי כמו הגלריה — שכפול הפריטים, מסלול LTR + translate -50% (globals: .lc-marquee-x-track).
 */
export function TestimonialsRow({
  items,
  noSectionAnimations = false,
  sectionId,
}: {
  items: TestimonialItem[];
  /** נשאר בחתימה לתאימות לקריאה מ־SectionRenderer */
  editorPreview?: boolean;
  noSectionAnimations?: boolean;
  sectionId: string;
}) {
  if (items.length === 0) return null;

  const sid = landingSectionDomId(sectionId);
  const anchor = LANDING_SECTION_ANCHOR_CLASS;

  if (noSectionAnimations) {
    const cards = items.map((t, i) => (
      <TestimonialCard key={`${t.headline}-${t.authorName}-${i}`} t={t} />
    ));
    return (
      <section
        id={sid}
        className={`${LC_SECTION_SHELL} ${anchor} bg-[#f3f4f6] py-12 pb-4 sm:py-16`}
        dir="rtl"
      >
        <ManualHorizontalCarousel gapClassName="gap-6">{cards}</ManualHorizontalCarousel>
      </section>
    );
  }

  const loop = [...items, ...items];

  return (
    <section
      id={sid}
      className={`${LC_SECTION_SHELL} ${anchor} bg-[#f3f4f6] py-12 pb-4 sm:py-16`}
      dir="rtl"
    >
      <div className="lc-marquee-x-clip overflow-x-hidden overflow-y-visible" dir="ltr">
        <div className="lc-marquee-x-track flex w-max items-stretch gap-6">
          {loop.map((t, i) => (
            <TestimonialCard key={`${t.headline}-${t.authorName}-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
