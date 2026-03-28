"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { he } from "@/lib/i18n/he";

const DRAG_THRESHOLD_PX = 6;

export function ManualHorizontalCarousel({
  children,
  gapClassName,
  className = "",
}: {
  children: ReactNode;
  gapClassName: string;
  /** מחלקות למעטפת היחסית (רקע/פדינג של הסקשן מגיעים מבחוץ) */
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
    moved: boolean;
  } | null>(null);

  const [canScroll, setCanScroll] = useState(false);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScroll(el.scrollWidth > el.clientWidth + 1);
  }, []);

  useEffect(() => {
    measure();
    const el = scrollerRef.current;
    const track = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    if (track) ro.observe(track);
    return () => ro.disconnect();
  }, [measure]);

  const scrollStep = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return Math.min(280, typeof window !== "undefined" ? window.innerWidth * 0.72 : 280);
    return Math.max(200, Math.floor(el.clientWidth * 0.72));
  }, []);

  const scrollPrev = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: -scrollStep(), behavior: "smooth" });
  }, [scrollStep]);

  const scrollNext = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: scrollStep(), behavior: "smooth" });
  }, [scrollStep]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: false,
    };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    el.style.cursor = "grabbing";
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const state = dragRef.current;
    const el = scrollerRef.current;
    if (!state || !el || e.pointerId !== state.pointerId) return;
    const dx = e.clientX - state.startX;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX) {
      state.moved = true;
      el.scrollLeft = state.startScroll - dx;
      e.preventDefault();
    }
  }, []);

  const endDrag = useCallback((e: React.PointerEvent) => {
    const state = dragRef.current;
    const el = scrollerRef.current;
    if (!state || e.pointerId !== state.pointerId) return;
    dragRef.current = null;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      el.style.cursor = "";
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      {canScroll ? (
        <>
          <button
            type="button"
            aria-label={he.carouselPrevAria}
            className="absolute left-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200/80 bg-white/95 text-neutral-800 shadow-md transition hover:bg-white md:left-2"
            onClick={scrollPrev}
          >
            <Chevron direction="prev" />
          </button>
          <button
            type="button"
            aria-label={he.carouselNextAria}
            className="absolute right-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200/80 bg-white/95 text-neutral-800 shadow-md transition hover:bg-white md:right-2"
            onClick={scrollNext}
          >
            <Chevron direction="next" />
          </button>
        </>
      ) : null}
      <div
        ref={scrollerRef}
        dir="ltr"
        onScroll={measure}
        className="max-w-full snap-x snap-mandatory overflow-x-auto overflow-y-visible scroll-smooth [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(e) => {
          if (dragRef.current?.pointerId === e.pointerId) endDrag(e);
        }}
        style={{ cursor: "grab", touchAction: "pan-x" }}
      >
        <div ref={trackRef} className={`flex w-max items-stretch ${gapClassName}`}>
          {mapSnapChildren(children)}
        </div>
      </div>
    </div>
  );
}

function mapSnapChildren(children: ReactNode) {
  return Children.map(children, (child, i) => {
    if (child === null || child === undefined) return child;
    return (
      <div key={i} className="shrink-0 snap-start">
        {child}
      </div>
    );
  });
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
