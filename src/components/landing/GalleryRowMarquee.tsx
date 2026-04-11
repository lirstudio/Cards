import Image from "next/image";
import { LC_SECTION_SHELL } from "@/lib/landing/section-shell";
import {
  landingSectionDomId,
  LANDING_SECTION_ANCHOR_CLASS,
} from "@/lib/landing/page-nav";
import { imageSrcIsProvided, LandingImagePlaceholder } from "./image-placeholder";
import { ManualHorizontalCarousel } from "./manual-horizontal-carousel";

export type GalleryRowImage = { src: string; alt?: string };

/**
 * שורת גלריה אינסופית — נדידה איטית מימין לשמאל (מסלול LTR + translate שלילי).
 */
export function GalleryRowMarquee({
  images,
  paddingClass = "py-12",
  noSectionAnimations = false,
  sectionId,
}: {
  images: GalleryRowImage[];
  paddingClass?: string;
  noSectionAnimations?: boolean;
  sectionId: string;
}) {
  if (images.length === 0) return null;

  const sid = landingSectionDomId(sectionId);
  const anchor = LANDING_SECTION_ANCHOR_CLASS;

  const cellClass =
    "group relative aspect-[3/4] w-[38vw] max-w-[220px] overflow-hidden rounded-3xl shadow-[0_0_0_1px_rgba(176,199,217,0.12)] transition-[box-shadow] duration-300 hover:shadow-[0_0_0_1px_rgba(214,235,253,0.2),0_16px_40px_-24px_rgba(0,0,0,0.45)] @min-[640px]:w-44 @min-[1024px]:w-52";

  const cells = images.map((im, i) => (
    <div key={`gallery-slot-${i}`} className={cellClass}>
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
  ));

  if (noSectionAnimations) {
    return (
      <section
        id={sid}
        className={`${LC_SECTION_SHELL} ${anchor} ${paddingClass}`}
        dir="rtl"
      >
        <ManualHorizontalCarousel gapClassName="gap-4 @md:gap-5">{cells}</ManualHorizontalCarousel>
      </section>
    );
  }

  const loop = [...images, ...images];

  return (
    <section
      id={sid}
      className={`${LC_SECTION_SHELL} ${anchor} ${paddingClass}`}
      dir="rtl"
    >
      <div className="lc-marquee-x-clip overflow-x-hidden overflow-y-visible">
        <div className="lc-marquee-x-track flex w-max items-stretch gap-4 @md:gap-5">
          {loop.map((im, i) => (
            <div key={`gallery-slot-${i}`} className={cellClass}>
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
          ))}
        </div>
      </div>
    </section>
  );
}
