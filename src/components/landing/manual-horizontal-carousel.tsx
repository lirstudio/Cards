"use client";

import {
  Children,
  isValidElement,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperClass, NavigationOptions } from "swiper/types";
import "swiper/css";
import "swiper/css/navigation";
import { he } from "@/lib/i18n/he";

/**
 * סדר שקפים 1→2→3 כמו ב-React. מנוע LTR: אנימציית הגלילה והגרירה הפוכות מ-Swiper ב-dir=rtl
 * (מתאים למי שרוצה "כמו אנגלית" לכיוון התזוזה). טקסט בתוך הכרטיסים נשאר RTL מההורה.
 */
const MIN_EXPANDED_SLIDES = 16;
const MAX_COPIES = 8;

function expandSlidesForLoop(baseSlides: ReactNode[]): ReactNode[] {
  const n = baseSlides.length;
  if (n <= 1) return baseSlides;
  const minTotal = Math.max(MIN_EXPANDED_SLIDES, n * 2);
  let copies = Math.min(MAX_COPIES, Math.max(1, Math.ceil(minTotal / n)));
  if (n > 30) copies = Math.min(copies, 2);
  const out: ReactNode[] = [];
  for (let c = 0; c < copies; c++) {
    for (let i = 0; i < n; i++) {
      out.push(baseSlides[i]);
    }
  }
  return out;
}

export function ManualHorizontalCarousel({
  children,
  spaceBetween = 20,
  className = "",
}: {
  children: ReactNode;
  spaceBetween?: number;
  className?: string;
}) {
  const baseSlides = useMemo(() => Children.toArray(children), [children]);
  const baseCount = baseSlides.length;
  const canLoop = baseCount > 1;

  const slides = useMemo(
    () => (canLoop ? expandSlidesForLoop(baseSlides) : baseSlides),
    [baseSlides, canLoop],
  );

  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  /** LTR: משמאל קודם, מימין הבא — כיוון אנימציה הפוך מ-rtl swiper */
  const onBeforeInit = (sw: SwiperClass) => {
    if (sw.params.navigation && typeof sw.params.navigation !== "boolean") {
      const navParams = sw.params.navigation as NavigationOptions;
      navParams.prevEl = prevRef.current;
      navParams.nextEl = nextRef.current;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {canLoop ? (
        <>
          <button
            ref={prevRef}
            type="button"
            aria-label={he.carouselPrevAria}
            className="absolute left-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(214,235,253,0.19)] bg-[#0a0a0a] text-[#f0f0f0] transition-[transform,background-color,box-shadow] duration-200 hover:bg-white/10 hover:shadow-[0_0_0_1px_rgba(214,235,253,0.22)] motion-safe:active:scale-95 @md:left-2"
          >
            <Chevron direction="prev" />
          </button>
          <button
            ref={nextRef}
            type="button"
            aria-label={he.carouselNextAria}
            className="absolute right-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(214,235,253,0.19)] bg-[#0a0a0a] text-[#f0f0f0] transition-[transform,background-color,box-shadow] duration-200 hover:bg-white/10 hover:shadow-[0_0_0_1px_rgba(214,235,253,0.22)] motion-safe:active:scale-95 @md:right-2"
          >
            <Chevron direction="next" />
          </button>
        </>
      ) : null}
      <Swiper
        modules={[Navigation]}
        dir="ltr"
        loop={canLoop}
        loopAdditionalSlides={baseCount}
        loopPreventsSliding={false}
        slidesPerView="auto"
        slidesPerGroup={1}
        spaceBetween={spaceBetween}
        speed={380}
        grabCursor
        watchOverflow={false}
        initialSlide={0}
        onBeforeInit={onBeforeInit}
        navigation={
          canLoop
            ? {
                prevEl: null,
                nextEl: null,
              }
            : false
        }
      >
        {slides.map((child, i) => {
          const cycle = Math.floor(i / Math.max(1, baseCount));
          const baseIdx = i % Math.max(1, baseCount);
          const key =
            isValidElement(child) && child.key != null
              ? `mhc-${cycle}-${String(child.key)}`
              : `mhc-${cycle}-${baseIdx}`;
          return (
            <SwiperSlide key={key} className="!h-auto !w-auto">
              {child}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

function Chevron({ direction }: { direction: "prev" | "next" }) {
  const flip = direction === "next";
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden
      className={flip ? "scale-x-[-1]" : ""}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
