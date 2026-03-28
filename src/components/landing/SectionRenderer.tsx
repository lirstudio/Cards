"use client";

import Image from "next/image";
import type { SectionKey } from "@/lib/sections/schemas";
import {
  LEGACY_NAV_HERO_STATS_KEY,
  isLegacyNavHeroStatsKey,
  parseSectionContent,
  safeParseLegacyNavHeroStats,
  sectionSchemas,
} from "@/lib/sections/schemas";
import type { PageTheme } from "@/types/landing";
import type { SectionStyleOverrides } from "@/types/admin";
import { FaqAccordion } from "./FaqAccordion";
import { ContactSplit } from "./ContactSplit";
import { GalleryRowMarquee } from "./GalleryRowMarquee";
import { TestimonialsRow } from "./TestimonialsRow";
import { StatsHighlightRow } from "./StatsHighlightRow";
import { imageSrcIsProvided, LandingImagePlaceholder } from "./image-placeholder";
import { submitLandingLead } from "@/app/actions/forms";
import { LC_SECTION_PX, LC_SECTION_SHELL } from "@/lib/landing/section-shell";
import {
  buildNavLinksFromPage,
  landingSectionDomId,
  LANDING_SECTION_ANCHOR_CLASS,
  resolveHeaderCtaHref,
  resolveNavLinksForPage,
  type BuiltNavLink,
  type PageNavSectionRow,
} from "@/lib/landing/page-nav";
import type { z } from "zod";

const PADDING_MAP: Record<string, string> = {
  sm: "py-8",
  md: "py-12",
  lg: "py-16",
  xl: "py-24",
};

function pillClass() {
  return `inline-flex max-w-full items-center justify-center break-words rounded-full px-6 py-3 text-center text-sm font-medium text-white transition hover:opacity-95 sm:px-8 sm:text-base`;
}

function imageTextLayoutMode(vo: SectionStyleOverrides) {
  const l = vo.imageTextLayout;
  if (l === "stack_text_above" || l === "stack_image_above") return l;
  return "default" as const;
}

/** תמונה עם object-cover: בפריסה דו-עמודתית גובה התמונה נמתח לגובה עמודת הטקסט (items-stretch). */
function BioSectionCoverImage({
  src,
  layoutMode,
}: {
  src: string;
  layoutMode: ReturnType<typeof imageTextLayoutMode>;
}) {
  const frame =
    "relative overflow-hidden rounded-[2rem] shadow-[0_22px_55px_-20px_rgba(0,0,0,0.2)] ring-1 ring-neutral-900/[0.06] md:rounded-[2.25rem]";
  if (layoutMode !== "default") {
    return (
      <div className={`${frame} aspect-[4/3] w-full max-h-[min(72vh,560px)] md:aspect-[16/11]`}>
        {imageSrcIsProvided(src) ? (
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        ) : (
          <LandingImagePlaceholder className="absolute inset-0 size-full" />
        )}
      </div>
    );
  }
  return (
    <div
      className={`${frame} w-full max-lg:aspect-[5/6] max-lg:max-h-[min(92vw,460px)] lg:h-full lg:min-h-[280px]`}
    >
      {imageSrcIsProvided(src) ? (
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          unoptimized
        />
      ) : (
        <LandingImagePlaceholder className="absolute inset-0 size-full" />
      )}
    </div>
  );
}

export function SectionRenderer({
  sectionKey,
  content,
  visible,
  theme,
  landingPageId,
  sectionId,
  editorPreview = false,
  embedded = false,
  variantStyleOverrides,
  pageNavSections,
}: {
  sectionKey: string;
  content: Record<string, unknown>;
  visible: boolean;
  theme: PageTheme;
  landingPageId: string;
  sectionId: string;
  /** When true, forms are non-interactive (editor / thumbnail preview). */
  editorPreview?: boolean;
  /** When true, hero section avoids full viewport height (stacked editor preview). */
  embedded?: boolean;
  /** Optional style overrides from a section variant. */
  variantStyleOverrides?: SectionStyleOverrides;
  /** כשמוגדר — קישורי התפריט נגזרים מסדר הסקשנים בעמוד. */
  pageNavSections?: PageNavSectionRow[];
}) {
  if (!visible) return null;

  const vo = variantStyleOverrides ?? {};
  const primary = vo.accentColor ?? theme.primary ?? "#0b43b4";
  const bg = vo.backgroundColor ?? theme.background ?? "#f8f9fa";
  const heading = vo.textColor ?? theme.heading ?? "#000000";
  const body = theme.body ?? "#4b5563";
  const siteLogoUrl = theme.siteLogoUrl?.trim();
  const noSectionAnimations = theme.noSectionAnimations === true;
  const paddingClass = vo.paddingY ? PADDING_MAP[vo.paddingY] : undefined;
  const dir = vo.layoutDirection ?? undefined;

  if (!(sectionKey in sectionSchemas) && !isLegacyNavHeroStatsKey(sectionKey)) {
    return null;
  }
  const key = sectionKey as SectionKey | typeof LEGACY_NAV_HERO_STATS_KEY;

  if (key === "faq_accordion") {
    return <FaqAccordion content={content} primary={primary} sectionId={sectionId} />;
  }
  if (key === "contact_split_footer") {
    return (
      <ContactSplit
        content={content}
        primary={primary}
        landingPageId={landingPageId}
        sectionId={sectionId}
        action={submitLandingLead}
        editorPreview={editorPreview}
        siteLogoUrl={theme.siteLogoUrl}
      />
    );
  }

  function renderSiteHeaderNav(c: {
    logoText: string;
    topBarLeft?: string;
    topBarRight?: string;
    navLinks: { label: string; href: string }[];
    headerCta: { label: string; href: string };
    navExcludedSectionIds?: string[];
    navSectionOrder?: string[];
  }) {
    const navLinksToRender: BuiltNavLink[] =
      pageNavSections != null
        ? resolveNavLinksForPage(pageNavSections, {
            excludedSectionIds: c.navExcludedSectionIds,
            sectionOrder: c.navSectionOrder,
          })
        : c.navLinks.map((l, i) => ({
            sectionId: `json-nav-${i}-${l.href}`,
            label: l.label,
            href: l.href,
          }));
    const ctaHref = resolveHeaderCtaHref(c.headerCta.href, pageNavSections);
    const headerNavListDir = (dir ?? "rtl") as "rtl" | "ltr";
    const barPad = embedded ? "px-3 py-2.5" : "px-4 py-3 md:px-6 md:py-3.5";
    const outerY = embedded ? "py-2" : "py-4 md:py-6";
    return (
      <header className={`mx-auto w-full max-w-6xl ${LC_SECTION_PX} ${outerY}`}>
        <nav
          className={`flex w-full flex-col gap-3 rounded-[1.25rem] bg-white shadow-[0_10px_40px_-12px_rgba(0,0,0,0.14)] ring-1 ring-neutral-900/[0.06] md:flex-row md:items-center md:gap-3 ${barPad}`}
        >
          <div className="flex w-full min-w-0 items-center justify-between gap-3 md:contents">
            <a
              href="#lc-page-top"
              className="relative z-10 flex shrink-0 items-center text-lg font-bold tracking-tight text-neutral-950 md:text-xl"
              style={siteLogoUrl ? undefined : { color: heading }}
            >
              {siteLogoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- URL משתמש חיצוני */}
                  <img
                    src={siteLogoUrl}
                    alt={c.logoText}
                    className="h-8 w-auto max-w-[180px] object-contain object-right md:h-9 md:max-w-[200px]"
                  />
                </>
              ) : (
                c.logoText
              )}
            </a>
            <a
              href={ctaHref}
              className="relative z-10 inline-flex shrink-0 items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-95 md:order-last"
              style={{ backgroundColor: primary }}
            >
              {c.headerCta.label}
            </a>
          </div>
          <ul
            dir={headerNavListDir}
            className={`relative z-0 flex min-w-0 flex-1 flex-row flex-nowrap items-center justify-start gap-x-4 overflow-x-auto overflow-y-visible py-0.5 text-sm font-medium [-ms-overflow-style:none] [scrollbar-width:none] md:order-2 md:gap-x-5 md:px-1 [&::-webkit-scrollbar]:hidden ${embedded ? "px-0" : "px-0.5"}`}
          >
            {navLinksToRender.map((l) => (
              <li key={l.sectionId} className="shrink-0">
                <a
                  href={l.href}
                  className="whitespace-nowrap transition hover:opacity-75"
                  style={{ color: heading }}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    );
  }

  function renderHeroImageSplit(c: {
    heroImage: string;
    headline: string;
    subheadline: string;
    heroCta: { label: string; href: string };
  }) {
    const heroSecId = landingSectionDomId(sectionId);
    const heroAnchor = LANDING_SECTION_ANCHOR_CLASS;
    const layout = imageTextLayoutMode(vo);
    const heroImageCol = (
      <div className="relative flex justify-center">
        <div
          className={`absolute rounded-full opacity-100 ${embedded ? "inset-4" : "inset-6"}`}
          style={{ backgroundColor: primary }}
        />
        <div className={`relative w-full max-w-[288px] sm:max-w-[320px] ${embedded ? "mt-3" : "mt-8"}`}>
          {imageSrcIsProvided(c.heroImage) ? (
            <Image
              src={c.heroImage}
              alt=""
              width={320}
              height={400}
              className="relative z-10 mx-auto rounded-b-[40%] object-cover object-top"
              unoptimized
            />
          ) : (
            <LandingImagePlaceholder className="relative z-10 mx-auto h-[400px] max-h-[min(85vh,400px)] w-full max-w-[320px] rounded-b-[40%]" />
          )}
        </div>
      </div>
    );
    const heroTextCol = (
      <div
        className={`min-w-0 text-center ${layout === "default" ? "lg:text-start" : ""} ${embedded ? "space-y-3" : "space-y-6"}`}
      >
        <h1
          className="break-words text-3xl font-extrabold leading-tight md:text-4xl"
          style={{ color: heading }}
        >
          {c.headline}
        </h1>
        <p className="text-lg leading-relaxed" style={{ color: body }}>
          {c.subheadline}
        </p>
        <a
          href={resolveHeaderCtaHref(c.heroCta.href, pageNavSections)}
          className={`${pillClass()} px-10 py-4 text-base`}
          style={{ backgroundColor: primary }}
        >
          {c.heroCta.label}
        </a>
      </div>
    );
    return layout === "default" ? (
      <section
        id={heroSecId}
        className={`${LC_SECTION_SHELL} ${heroAnchor} mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 ${embedded ? "gap-6 py-5" : "py-12 lg:py-20"}`}
      >
        <div className="order-2 min-w-0 lg:order-1">{heroImageCol}</div>
        <div className="order-1 min-w-0 lg:order-2">{heroTextCol}</div>
      </section>
    ) : (
      <section
        id={heroSecId}
        className={`${LC_SECTION_SHELL} ${heroAnchor} mx-auto flex max-w-6xl flex-col items-center gap-8 ${embedded ? "py-5" : "py-12 lg:py-20"}`}
      >
        {layout === "stack_text_above" ? (
          <>
            <div className="w-full min-w-0 max-w-3xl">{heroTextCol}</div>
            <div className="w-full min-w-0">{heroImageCol}</div>
          </>
        ) : (
          <>
            <div className="w-full min-w-0">{heroImageCol}</div>
            <div className="w-full min-w-0 max-w-3xl">{heroTextCol}</div>
          </>
        )}
      </section>
    );
  }

  if (key === "site_header_nav") {
    type C = z.infer<typeof sectionSchemas.site_header_nav>;
    const c = parseSectionContent("site_header_nav", content) as C;
    return (
      <section style={{ backgroundColor: bg }} dir={dir ?? "rtl"}>
        {renderSiteHeaderNav(c)}
      </section>
    );
  }

  if (key === "hero_image_split") {
    type C = z.infer<typeof sectionSchemas.hero_image_split>;
    const c = parseSectionContent("hero_image_split", content) as C;
    return (
      <div style={{ backgroundColor: bg }} dir={dir ?? "rtl"}>
        {renderHeroImageSplit(c)}
      </div>
    );
  }

  if (key === "stats_highlight_row") {
    type C = z.infer<typeof sectionSchemas.stats_highlight_row>;
    const c = parseSectionContent("stats_highlight_row", content) as C;
    return (
      <StatsHighlightRow
        stats={c.stats}
        headingColor={heading}
        labelColor={body}
        backgroundColor={bg}
        sectionPaddingClass={paddingClass}
        embedded={embedded}
        editorPreview={editorPreview}
        dir={dir ?? "rtl"}
        disableCountUp={noSectionAnimations}
        sectionId={sectionId}
      />
    );
  }

  if (key === LEGACY_NAV_HERO_STATS_KEY) {
    const parsed = safeParseLegacyNavHeroStats(content);
    if (!parsed.success) return null;
    const c = parsed.data;
    return (
      <div style={{ backgroundColor: bg }} dir={dir ?? "rtl"}>
        {renderHeroImageSplit(c)}
      </div>
    );
  }

  if (key === "about_bio_qa") {
    type C = z.infer<typeof sectionSchemas.about_bio_qa>;
    const c = parseSectionContent("about_bio_qa", content) as C;
    const layout = imageTextLayoutMode(vo);
    const sectionPad = paddingClass ?? "py-16";
    const imageCol = <BioSectionCoverImage src={c.image} layoutMode={layout} />;
    const textCol = (
      <div className="min-w-0 space-y-10 text-start md:space-y-12">
        {c.blocks.map((b) => (
          <div key={b.title}>
            <h2
              className="mb-3 break-words text-2xl font-bold tracking-tight md:text-[1.75rem]"
              style={{ color: heading }}
            >
              {b.title}
            </h2>
            <p
              className="break-words text-base leading-relaxed md:text-[1.0625rem]"
              style={{ color: body }}
            >
              {b.body}
            </p>
          </div>
        ))}
      </div>
    );
    const aboutBg = vo.backgroundColor ?? theme.background ?? "#f4f4f6";
    return (
      <section
        id={landingSectionDomId(sectionId)}
        className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} ${sectionPad}`}
        style={{ backgroundColor: aboutBg }}
        dir={dir ?? "rtl"}
      >
        <div
          className={
            layout === "default"
              ? "mx-auto grid min-w-0 max-w-6xl gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-14"
              : "mx-auto flex min-w-0 max-w-6xl flex-col gap-12"
          }
        >
          {layout === "stack_text_above" ? (
            <>
              {textCol}
              {imageCol}
            </>
          ) : layout === "stack_image_above" ? (
            <>
              {imageCol}
              {textCol}
            </>
          ) : (
            <>
              <div className="order-2 min-h-0 min-w-0 lg:order-1">{textCol}</div>
              <div className="order-1 h-full min-h-0 min-w-0 lg:order-2">{imageCol}</div>
            </>
          )}
        </div>
      </section>
    );
  }

  if (key === "split_three_qa_image") {
    type C = z.infer<typeof sectionSchemas.split_three_qa_image>;
    const c = parseSectionContent("split_three_qa_image", content) as C;
    const layout = imageTextLayoutMode(vo);
    const sectionPad = paddingClass ?? "py-14 md:py-20";
    const sectionBg = vo.backgroundColor ?? theme.background ?? "#f4f4f6";
    const textCol = (
      <div className="min-w-0 space-y-10 text-start md:space-y-12">
        {c.blocks.map((b) => (
          <div key={b.title}>
            <h2
              className="mb-3 break-words text-2xl font-bold tracking-tight md:text-[1.75rem]"
              style={{ color: heading }}
            >
              {b.title}
            </h2>
            <p
              className="break-words text-base leading-relaxed md:text-[1.0625rem]"
              style={{ color: body }}
            >
              {b.body}
            </p>
          </div>
        ))}
      </div>
    );
    const imageCol = <BioSectionCoverImage src={c.image} layoutMode={layout} />;
    const inner =
      layout === "stack_text_above" ? (
        <div className="flex min-w-0 flex-col gap-10 md:gap-12">
          {textCol}
          {imageCol}
        </div>
      ) : layout === "stack_image_above" ? (
        <div className="flex min-w-0 flex-col gap-10 md:gap-12">
          {imageCol}
          {textCol}
        </div>
      ) : (
        <div className="grid min-w-0 gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-14 xl:gap-16">
          <div className="order-2 min-h-0 min-w-0 lg:order-1">{textCol}</div>
          <div className="order-1 h-full min-h-0 min-w-0 lg:order-2">{imageCol}</div>
        </div>
      );
    return (
      <section
        id={landingSectionDomId(sectionId)}
        className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} ${sectionPad}`}
        style={{ backgroundColor: sectionBg }}
        dir={dir ?? "rtl"}
      >
        <div className="mx-auto min-w-0 max-w-6xl">{inner}</div>
      </section>
    );
  }

  if (key === "testimonials_row") {
    type C = z.infer<typeof sectionSchemas.testimonials_row>;
    const c = parseSectionContent("testimonials_row", content) as C;
    return (
      <TestimonialsRow
        items={c.items}
        editorPreview={editorPreview}
        noSectionAnimations={noSectionAnimations}
        sectionId={sectionId}
      />
    );
  }

  if (key === "center_richtext_cta") {
    type C = z.infer<typeof sectionSchemas.center_richtext_cta>;
    const c = parseSectionContent("center_richtext_cta", content) as C;
    return (
      <section
        id={landingSectionDomId(sectionId)}
        className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} py-12 sm:py-16`}
        style={{ backgroundColor: "#f5f5f5" }}
        dir="rtl"
      >
        <div className="mx-auto min-w-0 max-w-3xl text-center">
          <h2
            className="mb-6 break-words text-2xl font-bold sm:mb-8 sm:text-3xl md:text-4xl"
            style={{ color: heading }}
          >
            {c.title}
          </h2>
          <div
            className="mb-8 space-y-4 text-base leading-relaxed sm:mb-10 sm:space-y-5 sm:text-lg"
            style={{ color: body }}
          >
            {c.paragraphs.map((p, i) => (
              <p key={i} className="break-words">
                {p}
              </p>
            ))}
          </div>
          <a
            href={resolveHeaderCtaHref(c.cta.href, pageNavSections)}
            className={pillClass()}
            style={{ backgroundColor: primary }}
          >
            {c.cta.label}
          </a>
        </div>
      </section>
    );
  }

  if (key === "checklist_with_image") {
    type C = z.infer<typeof sectionSchemas.checklist_with_image>;
    const c = parseSectionContent("checklist_with_image", content) as C;
    const layout = imageTextLayoutMode(vo);
    const checklistCol = (
      <div className="min-w-0 text-start">
        <h2
          className="mb-6 break-words text-2xl font-bold sm:mb-8 sm:text-3xl md:text-4xl"
          style={{ color: heading }}
        >
          {c.title}
        </h2>
        <ul className="space-y-6">
          {c.items.map((item, i) => (
            <li key={i} className="flex gap-3 sm:gap-4">
              <span
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: primary }}
              >
                ✓
              </span>
              <div className="min-w-0">
                <div className="font-bold" style={{ color: heading }}>
                  {item.title}
                </div>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: body }}>
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
    /** פריסה דו־עמודתית: גובה התמונה = גובה עמודת הרשימה (items-stretch + fill + object-cover). */
    const imageColStretch = (
      <div
        className={`relative w-full overflow-hidden rounded-[2rem] shadow-[0_22px_55px_-20px_rgba(0,0,0,0.2)] ring-1 ring-neutral-900/[0.06] md:rounded-[2.25rem] max-lg:aspect-[5/6] max-lg:max-h-[min(92vw,460px)] lg:h-full lg:min-h-[280px]`}
      >
        {imageSrcIsProvided(c.image) ? (
          <Image
            src={c.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized
          />
        ) : (
          <LandingImagePlaceholder className="absolute inset-0 size-full" />
        )}
      </div>
    );
    /** ערימה אנכית: יחס גובה־רוחב קבוע */
    const imageColStack = (
      <div className="relative aspect-[4/3] w-full max-h-[min(72vh,560px)] overflow-hidden rounded-3xl shadow-xl md:aspect-[16/11]">
        {imageSrcIsProvided(c.image) ? (
          <Image
            src={c.image}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        ) : (
          <LandingImagePlaceholder className="absolute inset-0 size-full" />
        )}
      </div>
    );
    const sectionPad = paddingClass ?? "py-16";
    return (
      <section
        id={landingSectionDomId(sectionId)}
        className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} ${sectionPad}`}
        style={{ backgroundColor: bg }}
        dir={dir ?? "rtl"}
      >
        {layout === "stack_text_above" ? (
          <div className="mx-auto flex min-w-0 max-w-6xl flex-col gap-12">
            {checklistCol}
            {imageColStack}
          </div>
        ) : layout === "stack_image_above" ? (
          <div className="mx-auto flex min-w-0 max-w-6xl flex-col gap-12">
            {imageColStack}
            {checklistCol}
          </div>
        ) : (
          <div className="mx-auto grid min-w-0 max-w-6xl gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-14 xl:gap-16">
            <div className="order-2 min-h-0 min-w-0 lg:order-1">{checklistCol}</div>
            <div className="order-1 h-full min-h-0 lg:order-2">{imageColStretch}</div>
          </div>
        )}
      </section>
    );
  }

  if (key === "pricing_banner") {
    type C = z.infer<typeof sectionSchemas.pricing_banner>;
    const c = parseSectionContent("pricing_banner", content) as C;
    return (
      <section
        id={landingSectionDomId(sectionId)}
        className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} bg-[#f2f2f2] py-12 text-center sm:py-16`}
        dir="rtl"
      >
        <h2
          className="mx-auto mb-4 max-w-3xl break-words text-2xl font-bold sm:mb-6 sm:text-3xl md:text-4xl"
          style={{ color: heading }}
        >
          {c.headline}
        </h2>
        <p
          className="mx-auto mb-8 max-w-2xl text-base sm:mb-10 sm:text-lg"
          style={{ color: body }}
        >
          {c.body}
        </p>
        <a
          href={resolveHeaderCtaHref(c.cta.href, pageNavSections)}
          className={pillClass()}
          style={{ backgroundColor: primary }}
        >
          {c.cta.label}
        </a>
      </section>
    );
  }

  if (key === "services_grid") {
    type C = z.infer<typeof sectionSchemas.services_grid>;
    const c = parseSectionContent("services_grid", content) as C;
    return (
      <section
        id={landingSectionDomId(sectionId)}
        className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} py-12 sm:py-16 md:py-20`}
        style={{ backgroundColor: bg }}
        dir="rtl"
      >
        <div className="mx-auto min-w-0 max-w-5xl text-center">
          <div
            className="mx-auto mb-4 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border px-3 py-1 text-xs font-medium sm:px-4 sm:text-sm"
            style={{ borderColor: primary, color: primary }}
          >
            {c.badge}
          </div>
          <h2
            className="mb-8 break-words text-2xl font-bold sm:mb-10 sm:text-3xl md:mb-12 md:text-4xl"
            style={{ color: heading }}
          >
            {c.title}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {c.cards.map((card, i) => {
              const featured = card.featured;
              return (
                <div
                  key={i}
                  className={`min-w-0 rounded-3xl p-6 text-start shadow-sm sm:p-8 ${featured ? "text-white" : "bg-white"}`}
                  style={
                    featured ? { backgroundColor: primary } : { color: heading }
                  }
                >
                  {card.number ? (
                    <div
                      className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${featured ? "bg-white/20" : ""}`}
                      style={!featured ? { color: primary } : {}}
                    >
                      {card.number}
                    </div>
                  ) : null}
                  <h3 className="mb-3 break-words text-lg font-bold sm:text-xl">{card.title}</h3>
                  <p
                    className={`text-sm leading-relaxed ${featured ? "text-white/90" : "text-neutral-600"}`}
                  >
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (key === "gallery_row") {
    type C = z.infer<typeof sectionSchemas.gallery_row>;
    const c = parseSectionContent("gallery_row", content) as C;
    const galleryBg = vo.backgroundColor ?? theme.background ?? "#f5f5f5";
    const galleryPad = paddingClass ?? "py-12";
    return (
      <GalleryRowMarquee
        images={c.images}
        backgroundColor={galleryBg}
        paddingClass={galleryPad}
        noSectionAnimations={noSectionAnimations}
        sectionId={sectionId}
      />
    );
  }

  if (key === "how_it_works_blue") {
    type C = z.infer<typeof sectionSchemas.how_it_works_blue>;
    const c = parseSectionContent("how_it_works_blue", content) as C;
    return (
      <section
        id={landingSectionDomId(sectionId)}
        className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} py-12 sm:py-16`}
        dir="rtl"
      >
        <div
          className="mx-auto min-w-0 max-w-6xl rounded-2xl px-4 py-10 text-white sm:rounded-[2rem] sm:px-6 sm:py-12 md:px-10 md:py-14 lg:px-12"
          style={{ backgroundColor: primary }}
        >
          <div className="mb-8 text-center sm:mb-10">
            <div className="mx-auto mb-4 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-white/80 px-3 py-2 text-xs sm:px-4 sm:text-sm">
              {c.badge}
            </div>
            <h2 className="break-words text-2xl font-bold sm:text-3xl md:text-4xl">{c.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/90 sm:mt-4 sm:text-base">
              {c.intro}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            {c.steps.map((s, i) => (
              <article key={i} className="min-w-0 rounded-2xl bg-white p-5 text-start shadow-lg sm:p-6">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border-2 text-lg font-bold"
                  style={{ borderColor: primary, color: primary }}
                >
                  {i + 1}
                </div>
                <h3 className="mb-2 break-words font-bold text-black">{s.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return null;
}
