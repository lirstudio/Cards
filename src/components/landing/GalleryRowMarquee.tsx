"use client";

import { useMemo } from "react";
import Image from "next/image";
import { LC_SECTION_SHELL } from "@/lib/landing/section-shell";
import {
  landingSectionDomId,
  LANDING_SECTION_ANCHOR_CLASS,
} from "@/lib/landing/page-nav";
import { useMarqueeLoopCopies } from "@/lib/landing/use-marquee-loop-copies";
import { imageSrcIsProvided, LandingImagePlaceholder } from "./image-placeholder";
import { ManualHorizontalCarousel } from "./manual-horizontal-carousel";

export type GalleryRowImage = { src: string; alt?: string };

const CELL_CLASS =
  "group relative aspect-[3/4] w-[38vw] max-w-[220px] overflow-hidden rounded-3xl shadow-[0_0_0_1px_rgba(176,199,217,0.12)] transition-[box-shadow] duration-300 hover:shadow-[0_0_0_1px_rgba(214,235,253,0.2),0_16px_40px_-24px_rgba(0,0,0,0.45)] @min-[640px]:w-44 @min-[1024px]:w-52";

function GalleryCell({ im }: { im: GalleryRowImage }) {
  return (
    <div className={CELL_CLASS}>
      {imageSrcIsProvided(im.src) ? (
        <Image
          src={im.src}
          alt={im.alt ?? ""}
          fill
          className="lc-media-hover-zoom object-cover"
          sizes="(max-width: 768px) 38vw, 208px"
          unoptimized
        />
      ) : (
        <LandingImagePlaceholder className="lc-media-hover-zoom absolute inset-0 size-full rounded-3xl" />
      )}
    </div>
  );
}

function GalleryCssMarquee({
  images,
  sid,
  anchor,
  paddingClass,
  marqueeReverse,
}: {
  images: GalleryRowImage[];
  sid: string;
  anchor: string;
  paddingClass: string;
  marqueeReverse?: boolean;
}) {
  const { clipRef, trackRef, copies } = useMarqueeLoopCopies(images.length, true);
  const loop = useMemo(() => {
    const out: GalleryRowImage[] = [];
    for (let c = 0; c < copies; c++) {
      out.push(...images);
    }
    return out;
  }, [images, copies]);

  const trackClass =
    "lc-marquee-x-track flex w-max items-stretch gap-4 @md:gap-5" +
    (marqueeReverse ? " lc-marquee-x-track--reverse" : "");

  return (
    <section id={sid} className={`${LC_SECTION_SHELL} ${anchor} ${paddingClass}`} dir="rtl">
      <div ref={clipRef} className="lc-marquee-x-clip overflow-x-hidden overflow-y-visible">
        <div ref={trackRef} className={trackClass}>
          {loop.map((im, i) => (
            <GalleryCell key={`gallery-slot-${i}-m${Math.floor(i / images.length)}`} im={im} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * שורת גלריה אינסופית — נדידה איטית מימין לשמאל (אותה מכניקה כמו המלצות: שכפול + translate -50%).
 */
export function GalleryRowMarquee({
  images,
  paddingClass = "py-12",
  noSectionAnimations = false,
  sectionId,
  marqueeAnimationDirection,
}: {
  images: GalleryRowImage[];
  paddingClass?: string;
  noSectionAnimations?: boolean;
  sectionId: string;
  marqueeAnimationDirection?: "reverse";
}) {
  if (images.length === 0) return null;

  const sid = landingSectionDomId(sectionId);
  const anchor = LANDING_SECTION_ANCHOR_CLASS;

  const cells = images.map((im, i) => <GalleryCell key={`gallery-slot-${i}`} im={im} />);

  if (noSectionAnimations) {
    return (
      <section
        id={sid}
        className={`${LC_SECTION_SHELL} ${anchor} ${paddingClass}`}
        dir="rtl"
      >
        <ManualHorizontalCarousel spaceBetween={20}>{cells}</ManualHorizontalCarousel>
      </section>
    );
  }

  return (
    <GalleryCssMarquee
      images={images}
      sid={sid}
      anchor={anchor}
      paddingClass={paddingClass}
      marqueeReverse={marqueeAnimationDirection === "reverse"}
    />
  );
}
