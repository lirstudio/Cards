"use client";

import { ScaledSectionPreviewLayer } from "@/components/editor/scaled-section-preview-layer";
import { SectionRenderer } from "@/components/landing/SectionRenderer";
import { getDefaultContent } from "@/lib/sections/defaults";
import type { SectionKey } from "@/lib/sections/schemas";
import type { PageTheme } from "@/types/landing";
import type { SectionStyleOverrides } from "@/types/admin";

const THUMB_THEME = {
  primary: "#3b9eff",
  background: "#000000",
  heading: "#f0f0f0",
  body: "#a1a4a5",
} satisfies PageTheme;

/** Scaled-down default render for library thumbnails (pointer-events disabled). */
export function SectionTypePreview({ sectionKey }: { sectionKey: SectionKey }) {
  const content = getDefaultContent(sectionKey);
  return (
    <div
      className="pointer-events-none relative h-[148px] w-full overflow-hidden rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5"
      aria-hidden
    >
      <ScaledSectionPreviewLayer scale={0.36} canvasWidthClass="w-[min(820px,200vw)]">
        <SectionRenderer
          sectionKey={sectionKey}
          content={content}
          visible
          theme={THUMB_THEME}
          landingPageId="palette"
          sectionId={`palette-${sectionKey}`}
          editorPreview
          embedded
        />
      </ScaledSectionPreviewLayer>
    </div>
  );
}

/** ממוזער לבחירת כרטיס עיצוב במודאל הוספה — ערכת צבעים כמו בעמוד. */
export function SectionVariantPreviewThumb({
  sectionKey,
  theme,
  variantStyleOverrides,
}: {
  sectionKey: SectionKey;
  theme: PageTheme;
  variantStyleOverrides?: SectionStyleOverrides;
}) {
  const content = getDefaultContent(sectionKey);
  return (
    <div
      className="pointer-events-none relative h-[132px] w-full overflow-hidden rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5"
      aria-hidden
    >
      <ScaledSectionPreviewLayer scale={0.32} canvasWidthClass="w-[min(820px,200vw)]">
        <SectionRenderer
          sectionKey={sectionKey}
          content={content}
          visible
          theme={theme}
          landingPageId="variant-thumb"
          sectionId={`variant-thumb-${sectionKey}`}
          editorPreview
          embedded={
            sectionKey === "hero_image_split" ||
            sectionKey === "stats_highlight_row" ||
            sectionKey === "site_header_nav"
          }
          variantStyleOverrides={variantStyleOverrides}
        />
      </ScaledSectionPreviewLayer>
    </div>
  );
}
