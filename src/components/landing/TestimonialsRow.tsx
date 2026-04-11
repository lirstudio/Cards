"use client";

import Image from "next/image";
import { LC_SECTION_SHELL } from "@/lib/landing/section-shell";
import {
  landingSectionDomId,
  LANDING_SECTION_ANCHOR_CLASS,
} from "@/lib/landing/page-nav";
import { ManualHorizontalCarousel } from "./manual-horizontal-carousel";
import { imageSrcIsProvided } from "./image-placeholder";
import type { SectionStyleOverrides } from "@/types/admin";

export type TestimonialItem = {
  headline: string;
  body?: string;
  authorName: string;
  authorTitle?: string;
  authorImage?: string;
  /** 0 = ללא כוכבים; אם חסר — נחשב כ־5 (תאימות לאחור) */
  starRating?: number;
};

export type TestimonialsLayout = NonNullable<SectionStyleOverrides["testimonialsLayout"]>;

// ── shared defaults ────────────────────────────────────────────────────────────

/** רוחב כרטיס בקרוסלה — בלי cqw שלא עובד בלי @container (גרם לכרטיסים ברוחב 0 = „מסך שחור”) */
const PHOTO_CARD_W =
  "w-[min(280px,calc(100vw-2.5rem))] max-w-[85vw] shrink-0 sm:w-[min(280px,85vw)]";
const WIDE_SLIDE_W =
  "w-[min(900px,calc(100vw-2rem))] max-w-[min(900px,92vw)] shrink-0";

/** אבאטר עיגולי פשוט כשאין תמונה */
function AvatarFallback({ name, tone = "dark" }: { name: string; tone?: "dark" | "light" }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  if (tone === "light") {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-white/15 text-sm font-bold text-[#a1a4a5]">
        {initials || "?"}
      </div>
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
      {initials || "?"}
    </div>
  );
}

function normalizedStarCount(t: TestimonialItem): number {
  const n = t.starRating;
  if (n === undefined || n === null || Number.isNaN(n)) return 5;
  return Math.min(5, Math.max(0, Math.round(Number(n))));
}

/** כוכבים זהובים — 0 = לא מציגים */
function Stars({ count }: { count: number }) {
  if (count <= 0) return null;
  const n = Math.min(5, Math.max(1, count));
  return (
    <div className="flex gap-0.5" aria-label={`${n} מתוך 5 כוכבים`} role="img">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// ── design 1: marquee ─────────────────────────────────────────────────────────
// כרטיסים לבנים עם מרקיי אוטומטי (עיצוב ברירת מחדל)

function MarqueeCard({ t }: { t: TestimonialItem }) {
  return (
    <article className="lc-testimonial-card flex h-full min-h-0 w-[min(320px,calc(100vw-2.5rem))] max-w-[90vw] shrink-0 flex-col rounded-3xl bg-white/5 p-5 text-start shadow-[0_0_0_1px_rgba(176,199,217,0.145)] @sm:w-[min(320px,85vw)] @sm:p-8 @md:min-w-[300px]">
      <h3 className="mb-3 break-words text-base font-bold text-[#f0f0f0] @sm:text-lg">
        {t.headline}
      </h3>
      {t.body ? (
        <p className="mb-6 text-sm leading-relaxed text-[#a1a4a5]">{t.body}</p>
      ) : null}
      <div className="mt-auto flex items-end justify-between gap-4 border-t border-[rgba(214,235,253,0.19)] pt-4">
        <div>
          <div className="font-semibold text-[#f0f0f0]">{t.authorName}</div>
          {t.authorTitle ? (
            <div className="text-sm text-[#464a4d]">{t.authorTitle}</div>
          ) : null}
        </div>
        {imageSrcIsProvided(t.authorImage) ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
            <Image src={t.authorImage!} alt={t.authorName} fill className="object-cover" unoptimized />
          </div>
        ) : (
          <span className="text-2xl text-[#464a4d]" aria-hidden>💬</span>
        )}
      </div>
    </article>
  );
}

// ── design 2: photo_cards ─────────────────────────────────────────────────────
// כרטיסי פורטרט גדולים עם gradient כהה וטקסט מעל

function PhotoCard({ t }: { t: TestimonialItem }) {
  return (
    <article
      className={`relative aspect-[3/4] ${PHOTO_CARD_W} overflow-hidden rounded-3xl text-start ring-1 ring-white/10`}
    >
      {imageSrcIsProvided(t.authorImage) ? (
        <Image
          src={t.authorImage!}
          alt={t.authorName}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-neutral-600 via-neutral-700 to-neutral-900"
          aria-hidden
        />
      )}
      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      {/* content */}
      <div className="absolute inset-x-0 bottom-0 p-5 @sm:p-6">
        <Stars count={normalizedStarCount(t)} />
        <p className="mt-2 text-sm font-medium leading-relaxed text-white/90 @sm:text-base">
          {t.headline}
        </p>
        {t.body ? (
          <p className="mt-1 text-xs leading-relaxed text-white/70">{t.body}</p>
        ) : null}
        <div className="mt-3 border-t border-white/20 pt-3">
          <div className="font-semibold text-white">{t.authorName}</div>
          {t.authorTitle ? (
            <div className="text-xs text-white/60">{t.authorTitle}</div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

// ── design 3: star_cards ──────────────────────────────────────────────────────
// כרטיסים כהים עם 5 כוכבי זהב, ציטוט, avatar עגול

function StarCard({ t }: { t: TestimonialItem }) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-[rgba(214,235,253,0.19)] bg-white/5 p-6 text-start shadow-[0_0_0_1px_rgba(176,199,217,0.145)] @sm:p-7">
      <Stars count={normalizedStarCount(t)} />
      <p className="mt-4 flex-1 text-sm leading-relaxed text-[#a1a4a5] @sm:text-base">
        {t.headline}
        {t.body ? ` ${t.body}` : ""}
      </p>
      <div className="mt-5 flex items-center gap-3 border-t border-[rgba(214,235,253,0.19)] pt-4">
        <div className="min-w-0 flex-1 text-start">
          <div className="text-sm font-semibold text-[#f0f0f0]">{t.authorName}</div>
          {t.authorTitle ? (
            <div className="text-xs text-[#464a4d]">{t.authorTitle}</div>
          ) : null}
        </div>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-[rgba(214,235,253,0.19)]">
          {imageSrcIsProvided(t.authorImage) ? (
            <Image
              src={t.authorImage!}
              alt={t.authorName}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <AvatarFallback name={t.authorName} tone="light" />
          )}
        </div>
      </div>
    </article>
  );
}

// ── design 4: quote_side ──────────────────────────────────────────────────────
// כרטיס רחב: ציטוט גדול בצד ימין (RTL), תמונה בצד שמאל

function QuoteSideCard({ t }: { t: TestimonialItem }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-[rgba(214,235,253,0.19)] bg-white/5 shadow-[0_0_0_1px_rgba(176,199,217,0.145)] @lg:flex-row">
      {/* text side (right in RTL) */}
      <div className="flex flex-1 flex-col justify-center p-8 text-start @md:p-10">
        <span className="mb-4 block text-6xl leading-none text-[rgba(214,235,253,0.19)] font-serif" aria-hidden>
          &ldquo;
        </span>
        <h3 className="text-xl font-bold leading-snug text-[#f0f0f0] @md:text-2xl">
          {t.headline}
        </h3>
        {t.body ? (
          <p className="mt-4 text-base leading-relaxed text-[#a1a4a5]">{t.body}</p>
        ) : null}
        <div className="mt-6 flex items-center gap-3">
          <div className="min-w-0 flex-1 text-start">
            <div className="font-semibold text-[#f0f0f0]">{t.authorName}</div>
            {t.authorTitle ? (
              <div className="text-sm text-[#464a4d]">{t.authorTitle}</div>
            ) : null}
          </div>
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-[rgba(214,235,253,0.19)]">
            {imageSrcIsProvided(t.authorImage) ? (
              <Image
                src={t.authorImage!}
                alt={t.authorName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <AvatarFallback name={t.authorName} tone="light" />
            )}
          </div>
        </div>
      </div>
      {/* image side (left in RTL) */}
      {imageSrcIsProvided(t.authorImage) ? (
        <div className="relative h-56 w-full shrink-0 @lg:h-auto @lg:w-[320px] xl:@lg:w-[360px]">
          <Image
            src={t.authorImage!}
            alt={t.authorName}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div
          className="relative h-48 w-full shrink-0 bg-white/5 @lg:h-auto @lg:min-h-[280px] @lg:w-[280px]"
          aria-hidden
        />
      )}
    </article>
  );
}

// ── design 5: cinematic ───────────────────────────────────────────────────────
// בנר קולנועי רחב, תמונת רקע + gradient + ציטוט מרכזי

function CinematicCard({ t }: { t: TestimonialItem }) {
  return (
    <article className="relative min-h-[340px] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 @md:min-h-[420px]">
      {imageSrcIsProvided(t.authorImage) ? (
        <Image
          src={t.authorImage!}
          alt={t.authorName}
          fill
          className="object-cover object-center"
          unoptimized
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-neutral-600 via-neutral-800 to-neutral-950"
          aria-hidden
        />
      )}
      {/* overlay: בלי תמונה שקיפות גבוהה יותר כדי שהטקסט יישאר קריא */}
      <div
        className={`absolute inset-0 ${imageSrcIsProvided(t.authorImage) ? "bg-black/55" : "bg-black/35"}`}
      />
      {/* centered content */}
      <div className="relative flex h-full flex-col items-center justify-center px-6 py-12 text-center @md:px-16">
        <p className="max-w-2xl text-xl font-light italic leading-relaxed text-white @md:text-3xl">
          &ldquo;{t.headline}{t.body ? ` — ${t.body}` : ""}&rdquo;
        </p>
        <div className="mt-6 flex flex-col items-center gap-1">
          <div className="h-px w-12 bg-white/40" />
          <div className="mt-3 font-semibold text-white">{t.authorName}</div>
          {t.authorTitle ? (
            <div className="text-sm text-white/60">{t.authorTitle}</div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

// ── main export ───────────────────────────────────────────────────────────────

export function TestimonialsRow({
  items,
  noSectionAnimations = false,
  sectionId,
  layout = "marquee",
  sectionPadClass = "py-12 sm:py-16",
}: {
  items: TestimonialItem[];
  noSectionAnimations?: boolean;
  sectionId: string;
  layout?: TestimonialsLayout;
  sectionPadClass?: string;
}) {
  if (items.length === 0) return null;

  const sid = landingSectionDomId(sectionId);
  const anchor = LANDING_SECTION_ANCHOR_CLASS;
  const sectionShell = `${LC_SECTION_SHELL} ${anchor} ${sectionPadClass}`;

  // ── photo_cards ──────────────────────────────────────────────────────────
  if (layout === "photo_cards") {
    const cards = items.map((t, i) => (
      <PhotoCard key={`${t.authorName}-${i}`} t={t} />
    ));
    return (
      <section
        id={sid}
        className={`${sectionShell} @container pb-4`}
        dir="rtl"
      >
        <ManualHorizontalCarousel gapClassName="gap-5">{cards}</ManualHorizontalCarousel>
      </section>
    );
  }

  // ── star_cards ───────────────────────────────────────────────────────────
  if (layout === "star_cards") {
    return (
      <section id={sid} className={`${sectionShell} @container`} dir="rtl">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 @sm:grid-cols-2 @lg:grid-cols-3">
          {items.map((t, i) => (
            <StarCard key={`${t.authorName}-${i}`} t={t} />
          ))}
        </div>
      </section>
    );
  }

  // ── quote_side ───────────────────────────────────────────────────────────
  if (layout === "quote_side") {
    const slides = items.map((t, i) => (
      <div key={`${t.authorName}-${i}`} className={WIDE_SLIDE_W}>
        <QuoteSideCard t={t} />
      </div>
    ));
    return (
      <section
        id={sid}
        className={`${sectionShell} @container pb-4`}
        dir="rtl"
      >
        <ManualHorizontalCarousel gapClassName="gap-6">{slides}</ManualHorizontalCarousel>
      </section>
    );
  }

  // ── cinematic ────────────────────────────────────────────────────────────
  if (layout === "cinematic") {
    const slides = items.map((t, i) => (
      <div key={`${t.authorName}-${i}`} className={WIDE_SLIDE_W}>
        <CinematicCard t={t} />
      </div>
    ));
    return (
      <section
        id={sid}
        className={`${sectionShell} @container pb-4`}
        dir="rtl"
      >
        <ManualHorizontalCarousel gapClassName="gap-6">{slides}</ManualHorizontalCarousel>
      </section>
    );
  }

  // ── marquee (default) ─────────────────────────────────────────────────────
  if (noSectionAnimations) {
    const cards = items.map((t, i) => (
      <MarqueeCard key={`${t.authorName}-${i}`} t={t} />
    ));
    return (
      <section id={sid} className={`${sectionShell} pb-4`} dir="rtl">
        <ManualHorizontalCarousel gapClassName="gap-6">{cards}</ManualHorizontalCarousel>
      </section>
    );
  }

  const loop = [...items, ...items];

  return (
    <section id={sid} className={`${sectionShell} pb-4`} dir="rtl">
      <div className="lc-marquee-x-clip overflow-x-hidden overflow-y-visible">
        <div className="lc-marquee-x-track flex w-max items-stretch gap-6">
          {loop.map((t, i) => (
            <MarqueeCard key={`${t.authorName}-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
