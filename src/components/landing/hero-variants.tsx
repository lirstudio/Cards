"use client";

import Image from "next/image";
import { LC_SECTION_SHELL } from "@/lib/landing/section-shell";
import {
  landingSectionDomId,
  LANDING_SECTION_ANCHOR_CLASS,
  resolveHeaderCtaHref,
  type PageNavSectionRow,
} from "@/lib/landing/page-nav";
import { imageSrcIsProvided, LandingImagePlaceholder } from "./image-placeholder";

function pillClass() {
  return `lc-cta-interactive inline-flex max-w-full items-center justify-center break-words rounded-full px-6 py-3 text-center text-sm font-medium text-white hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35 sm:px-8 sm:text-base`;
}

export type HeroImageTextLayout = "default" | "stack_text_above" | "stack_image_above";

type BaseHeroProps = {
  primary: string;
  heading: string;
  body: string;
  embedded: boolean;
  sectionId: string;
  pageNavSections?: PageNavSectionRow[];
};

export type HeroEditorialSplitProps = BaseHeroProps & {
  eyebrow?: string;
  heroImage: string;
  headline: string;
  subheadline: string;
  heroCta: { label: string; href: string };
  layout: HeroImageTextLayout;
  __hidden?: string[];
};

const editorialFrame =
  "group relative overflow-hidden rounded-[2rem] shadow-[0_0_0_1px_rgba(176,199,217,0.16)] ring-1 ring-[rgba(176,199,217,0.14)] transition-[box-shadow,transform] duration-300 motion-safe:hover:shadow-[0_0_0_1px_rgba(214,235,253,0.2),0_28px_60px_-24px_rgba(0,0,0,0.55)] @md:rounded-[2.25rem]";

export function HeroEditorialSplit({
  eyebrow,
  heroImage,
  headline,
  subheadline,
  heroCta,
  primary,
  heading,
  body,
  embedded,
  sectionId,
  pageNavSections,
  layout,
  __hidden,
}: HeroEditorialSplitProps) {
  const heroSecId = landingSectionDomId(sectionId);
  const heroAnchor = LANDING_SECTION_ANCHOR_CLASS;
  const ctaHref = resolveHeaderCtaHref(heroCta.href, pageNavSections);
  const hidden = new Set(__hidden ?? []);

  const imageCol = (
    <div className="relative flex justify-center @min-[1024px]:justify-center">
      <div
        className={`${editorialFrame} aspect-[5/6] w-full max-w-[min(100%,420px)] @min-[1024px]:aspect-[4/5] @min-[1024px]:max-w-none @min-[1024px]:min-h-[min(72vh,520px)] @min-[1024px]:w-full`}
      >
        {imageSrcIsProvided(heroImage) ? (
          <Image
            src={heroImage}
            alt=""
            fill
            className="lc-media-hover-zoom object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized
          />
        ) : (
          <LandingImagePlaceholder className="lc-media-hover-zoom absolute inset-0 size-full" />
        )}
      </div>
    </div>
  );

  const textCol = (
    <div
      className={`min-w-0 space-y-5 text-center ${layout === "default" ? "@min-[1024px]:text-start" : ""} ${embedded ? "space-y-3" : ""}`}
    >
      {!hidden.has("eyebrow") && eyebrow?.trim() ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: primary }}>
          {eyebrow}
        </p>
      ) : null}
      {!hidden.has("headline") && (
        <h1
          className="break-words text-3xl font-extrabold leading-[1.08] tracking-tight md:text-4xl lg:text-[2.65rem]"
          style={{ color: heading }}
        >
          {headline}
        </h1>
      )}
      {!hidden.has("subheadline") && (
        <p className="text-lg leading-relaxed md:text-xl" style={{ color: body }}>
          {subheadline}
        </p>
      )}
      {!hidden.has("heroCta") && (
        <a
          href={ctaHref}
          className={`${pillClass()} px-10 py-4 text-base`}
          style={{ backgroundColor: primary }}
        >
          {heroCta.label}
        </a>
      )}
    </div>
  );

  if (layout === "default") {
    return (
      <section
        id={heroSecId}
        className={`${LC_SECTION_SHELL} ${heroAnchor} mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 @min-[1024px]:grid-cols-2 ${embedded ? "gap-6 py-5" : "py-12 @min-[1024px]:py-20"}`}
      >
        <div className="order-2 min-w-0 @min-[1024px]:order-1">{imageCol}</div>
        <div className="order-1 min-w-0 @min-[1024px]:order-2">{textCol}</div>
      </section>
    );
  }

  return (
    <section
      id={heroSecId}
      className={`${LC_SECTION_SHELL} ${heroAnchor} mx-auto flex max-w-6xl flex-col items-center gap-8 ${embedded ? "py-5" : "py-12 @min-[1024px]:py-20"}`}
    >
      {layout === "stack_text_above" ? (
        <>
          <div className="w-full min-w-0 max-w-3xl">{textCol}</div>
          <div className="w-full min-w-0">{imageCol}</div>
        </>
      ) : (
        <>
          <div className="w-full min-w-0">{imageCol}</div>
          <div className="w-full min-w-0 max-w-3xl">{textCol}</div>
        </>
      )}
    </section>
  );
}

export type HeroImmersiveBgProps = BaseHeroProps & {
  backgroundImage: string;
  headline: string;
  subheadline: string;
  heroCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  __hidden?: string[];
};

export function HeroImmersiveBg({
  backgroundImage,
  headline,
  subheadline,
  heroCta,
  secondaryCta,
  primary,
  heading,
  body,
  embedded,
  sectionId,
  pageNavSections,
  __hidden,
}: HeroImmersiveBgProps) {
  const heroSecId = landingSectionDomId(sectionId);
  const heroAnchor = LANDING_SECTION_ANCHOR_CLASS;
  const hidden = new Set(__hidden ?? []);
  const primaryHref = resolveHeaderCtaHref(heroCta.href, pageNavSections);
  const secondaryHref = resolveHeaderCtaHref(secondaryCta.href, pageNavSections);
  const minH = embedded ? "min-h-[200px]" : "min-h-[min(85vh,760px)]";

  return (
    <section
      id={heroSecId}
      className={`${heroAnchor} relative flex w-full flex-col overflow-hidden ${minH}`}
    >
      <div className="absolute inset-0">
        {imageSrcIsProvided(backgroundImage) ? (
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority={!embedded}
            unoptimized
          />
        ) : (
          <LandingImagePlaceholder className="absolute inset-0 size-full" />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/85"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(59,158,255,0.12),transparent_55%)]"
          aria-hidden
        />
      </div>
      <div
        className={`relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6 lg:px-8 ${embedded ? "py-8" : "py-20 @min-[1024px]:py-28"}`}
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {!hidden.has("headline") && (
            <h1
              className="break-words text-3xl font-extrabold leading-tight text-white drop-shadow-sm md:text-4xl lg:text-5xl"
              style={{ color: heading }}
            >
              {headline}
            </h1>
          )}
          {!hidden.has("subheadline") && (
            <p
              className="mx-auto max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl"
              style={{ color: body }}
            >
              {subheadline}
            </p>
          )}
          {(!hidden.has("heroCta") || !hidden.has("secondaryCta")) && (
            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row sm:gap-4">
              {!hidden.has("heroCta") && (
                <a
                  href={primaryHref}
                  className={`${pillClass()} px-10 py-4 text-base shadow-lg shadow-black/25`}
                  style={{ backgroundColor: primary }}
                >
                  {heroCta.label}
                </a>
              )}
              {!hidden.has("secondaryCta") && (
                <a
                  href={secondaryHref}
                  className="lc-cta-interactive inline-flex max-w-full items-center justify-center break-words rounded-full border-2 border-white/35 bg-white/5 px-8 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-sm hover:border-white/55 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35 sm:px-10 sm:text-base"
                >
                  {secondaryCta.label}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export type HeroShowcaseFloatProps = BaseHeroProps & {
  badge?: string;
  heroImage: string;
  headline: string;
  subheadline: string;
  heroCta: { label: string; href: string };
  layout: HeroImageTextLayout;
  __hidden?: string[];
};

export function HeroShowcaseFloat({
  badge,
  heroImage,
  headline,
  subheadline,
  heroCta,
  primary,
  heading,
  body,
  embedded,
  sectionId,
  pageNavSections,
  layout,
  __hidden,
}: HeroShowcaseFloatProps) {
  const heroSecId = landingSectionDomId(sectionId);
  const heroAnchor = LANDING_SECTION_ANCHOR_CLASS;
  const ctaHref = resolveHeaderCtaHref(heroCta.href, pageNavSections);
  const hidden = new Set(__hidden ?? []);

  const floatFrame =
    "relative overflow-hidden rounded-[1.75rem] shadow-[0_32px_64px_-28px_rgba(0,0,0,0.65),0_0_0_1px_rgba(214,235,253,0.12)] ring-1 ring-white/10 transition-[transform,box-shadow] duration-500 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_40px_80px_-32px_rgba(0,0,0,0.7)] @md:rounded-[2rem] motion-safe:lg:rotate-2";

  const imageCol = (
    <div className="relative flex justify-center pb-6 @min-[1024px]:pb-0 @min-[1024px]:pt-8">
           <div
        className={`${floatFrame} aspect-[4/5] w-full max-w-[min(100%,340px)] @min-[1024px]:-mt-6 @min-[1024px]:max-w-[400px]`}
      >
        {imageSrcIsProvided(heroImage) ? (
          <Image
            src={heroImage}
            alt=""
            fill
            className="lc-media-hover-zoom object-cover object-center"
            sizes="(max-width: 1024px) 90vw, 400px"
            unoptimized
          />
        ) : (
          <LandingImagePlaceholder className="lc-media-hover-zoom absolute inset-0 size-full" />
        )}
      </div>
    </div>
  );

  const textCol = (
    <div
      className={`min-w-0 space-y-5 text-center ${layout === "default" ? "@min-[1024px]:text-start" : ""} ${embedded ? "space-y-3" : ""}`}
    >
      {!hidden.has("badge") && badge?.trim() ? (
        <span
          className="inline-flex rounded-full px-4 py-1.5 text-xs font-semibold text-white/95 ring-1 ring-white/20"
          style={{ backgroundColor: `${primary}33` }}
        >
          {badge}
        </span>
      ) : null}
      {!hidden.has("headline") && (
        <h1
          className="break-words text-3xl font-extrabold leading-[1.05] tracking-tight md:text-4xl lg:text-[2.85rem]"
          style={{ color: heading }}
        >
          {headline}
        </h1>
      )}
      {!hidden.has("subheadline") && (
        <p className="max-w-xl text-lg leading-relaxed md:text-xl" style={{ color: body }}>
          {subheadline}
        </p>
      )}
      {!hidden.has("heroCta") && (
        <a
          href={ctaHref}
          className={`${pillClass()} px-10 py-4 text-base`}
          style={{ backgroundColor: primary }}
        >
          {heroCta.label}
        </a>
      )}
    </div>
  );

  if (layout === "default") {
    return (
      <section
        id={heroSecId}
        className={`${LC_SECTION_SHELL} ${heroAnchor} mx-auto max-w-6xl overflow-visible ${embedded ? "py-5" : "py-12 @min-[1024px]:py-20"}`}
      >
        <div className="grid grid-cols-1 items-center gap-10 overflow-visible @min-[1024px]:grid-cols-2 @min-[1024px]:gap-14">
          <div className="order-2 min-w-0 @min-[1024px]:order-1">{textCol}</div>
          <div className="order-1 min-w-0 overflow-visible @min-[1024px]:order-2">{imageCol}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={heroSecId}
      className={`${LC_SECTION_SHELL} ${heroAnchor} mx-auto max-w-6xl overflow-visible ${embedded ? "py-5" : "py-12 @min-[1024px]:py-20"}`}
    >
      <div className="flex flex-col items-center gap-8 overflow-visible">
        {layout === "stack_text_above" ? (
          <>
            <div className="w-full min-w-0 max-w-3xl">{textCol}</div>
            <div className="w-full min-w-0 overflow-visible">{imageCol}</div>
          </>
        ) : (
          <>
            <div className="w-full min-w-0 overflow-visible">{imageCol}</div>
            <div className="w-full min-w-0 max-w-3xl">{textCol}</div>
          </>
        )}
      </div>
    </section>
  );
}
