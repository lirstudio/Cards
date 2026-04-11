import Image from "next/image";
import { LC_SECTION_SHELL } from "@/lib/landing/section-shell";
import { landingSectionDomId, LANDING_SECTION_ANCHOR_CLASS } from "@/lib/landing/page-nav";
import { imageSrcIsProvided, LandingImagePlaceholder } from "./image-placeholder";
import type { GalleryRowImage } from "./GalleryRowMarquee";

function GalleryImageCell({
  im,
  className,
  sizes,
}: {
  im: GalleryRowImage;
  className: string;
  sizes: string;
}) {
  return (
    <div className={`group relative overflow-hidden ${className}`}>
      {imageSrcIsProvided(im.src) ? (
        <Image
          src={im.src}
          alt={im.alt ?? ""}
          fill
          className="lc-media-hover-zoom object-cover"
          sizes={sizes}
          unoptimized
        />
      ) : (
        <LandingImagePlaceholder className="lc-media-hover-zoom absolute inset-0 size-full" />
      )}
    </div>
  );
}

export function GalleryGridEvenSection({
  title,
  subtitle,
  images,
  sectionId,
  headingColor,
  bodyColor,
  paddingClass = "py-12 sm:py-16",
}: {
  title: string;
  subtitle?: string;
  images: GalleryRowImage[];
  sectionId: string;
  headingColor: string;
  bodyColor: string;
  paddingClass?: string;
}) {
  const list = images.length > 0 ? images : [{ src: "", alt: "" }];
  return (
    <section
      id={landingSectionDomId(sectionId)}
      className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} ${paddingClass}`}
      dir="rtl"
    >
      <div className="mx-auto min-w-0 max-w-6xl">
        <div className="mb-8 text-center sm:mb-10">
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
            style={{ color: headingColor }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm sm:text-base" style={{ color: bodyColor }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3 @md:gap-4 @lg:grid-cols-3">
          {list.map((im, i) => (
            <GalleryImageCell
              key={`g-grid-${i}`}
              im={im}
              className="aspect-square rounded-2xl shadow-[0_0_0_1px_rgba(176,199,217,0.14)] ring-1 ring-[rgba(176,199,217,0.12)] transition-[box-shadow] duration-300 @md:rounded-[1.35rem] motion-safe:group-hover:shadow-[0_0_0_1px_rgba(214,235,253,0.18),0_20px_48px_-28px_rgba(0,0,0,0.45)]"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function GallerySpotlightSection({
  title,
  subtitle,
  images,
  sectionId,
  headingColor,
  bodyColor,
  paddingClass = "py-12 sm:py-16",
}: {
  title: string;
  subtitle?: string;
  images: GalleryRowImage[];
  sectionId: string;
  headingColor: string;
  bodyColor: string;
  paddingClass?: string;
}) {
  const hero = images[0] ?? { src: "", alt: "" };
  const rest = images.slice(1);
  const gridFour = rest.slice(0, 4);
  while (gridFour.length < 4) {
    gridFour.push({ src: "", alt: "" });
  }
  return (
    <section
      id={landingSectionDomId(sectionId)}
      className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} ${paddingClass}`}
      dir="rtl"
    >
      <div className="mx-auto min-w-0 max-w-6xl">
        <div className="mb-8 text-center sm:mb-10">
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
            style={{ color: headingColor }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm sm:text-base" style={{ color: bodyColor }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @lg:gap-5">
          <GalleryImageCell
            im={hero}
            className="min-h-[280px] rounded-[1.5rem] shadow-[0_0_0_1px_rgba(176,199,217,0.14)] ring-1 ring-[rgba(176,199,217,0.12)] @lg:min-h-[420px] @lg:rounded-[1.75rem]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="grid grid-cols-2 gap-3 @md:gap-4">
            {gridFour.map((im, i) => (
              <GalleryImageCell
                key={`g-spot-${i}`}
                im={im}
                className="aspect-[4/3] rounded-xl shadow-[0_0_0_1px_rgba(176,199,217,0.14)] ring-1 ring-[rgba(176,199,217,0.12)] @md:rounded-2xl"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function GalleryBentoSection({
  title,
  subtitle,
  images,
  sectionId,
  headingColor,
  bodyColor,
  paddingClass = "py-12 sm:py-16",
}: {
  title: string;
  subtitle?: string;
  images: GalleryRowImage[];
  sectionId: string;
  headingColor: string;
  bodyColor: string;
  paddingClass?: string;
}) {
  const a = images[0] ?? { src: "", alt: "" };
  const b = images[1] ?? { src: "", alt: "" };
  const c = images[2] ?? { src: "", alt: "" };
  const d = images[3] ?? { src: "", alt: "" };
  const e = images[4] ?? { src: "", alt: "" };
  const f = images[5] ?? { src: "", alt: "" };
  return (
    <section
      id={landingSectionDomId(sectionId)}
      className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} ${paddingClass}`}
      dir="rtl"
    >
      <div className="mx-auto min-w-0 max-w-6xl">
        <div className="mb-8 text-center sm:mb-10">
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
            style={{ color: headingColor }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm sm:text-base" style={{ color: bodyColor }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @md:grid-cols-4 @md:grid-rows-3 @md:gap-4 @md:h-[min(120vw,620px)] @lg:h-[min(100vw,640px)]">
          <GalleryImageCell
            im={a}
            className="@sm:col-span-2 @md:col-span-2 @md:row-span-2 @md:row-start-1 @md:col-start-1 min-h-[220px] rounded-2xl shadow-[0_0_0_1px_rgba(176,199,217,0.14)] ring-1 ring-[rgba(176,199,217,0.12)] @md:min-h-0 @md:rounded-[1.5rem]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <GalleryImageCell
            im={b}
            className="min-h-[160px] rounded-xl shadow-[0_0_0_1px_rgba(176,199,217,0.14)] ring-1 ring-[rgba(176,199,217,0.12)] @md:col-start-3 @md:row-start-1 @md:min-h-0 @md:rounded-2xl"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <GalleryImageCell
            im={c}
            className="min-h-[160px] rounded-xl shadow-[0_0_0_1px_rgba(176,199,217,0.14)] ring-1 ring-[rgba(176,199,217,0.12)] @md:col-start-4 @md:row-start-1 @md:min-h-0 @md:rounded-2xl"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <GalleryImageCell
            im={e}
            className="min-h-[140px] rounded-xl shadow-[0_0_0_1px_rgba(176,199,217,0.14)] ring-1 ring-[rgba(176,199,217,0.12)] @md:col-start-3 @md:row-start-2 @md:min-h-0 @md:rounded-2xl"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <GalleryImageCell
            im={f}
            className="min-h-[140px] rounded-xl shadow-[0_0_0_1px_rgba(176,199,217,0.14)] ring-1 ring-[rgba(176,199,217,0.12)] @md:col-start-4 @md:row-start-2 @md:min-h-0 @md:rounded-2xl"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <GalleryImageCell
            im={d}
            className="@sm:col-span-2 @md:col-span-4 @md:col-start-1 @md:row-start-3 min-h-[140px] rounded-xl shadow-[0_0_0_1px_rgba(176,199,217,0.14)] ring-1 ring-[rgba(176,199,217,0.12)] @md:min-h-0 @md:rounded-2xl"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
