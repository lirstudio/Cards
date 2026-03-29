"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { SectionRenderer } from "@/components/landing/SectionRenderer";
import { he } from "@/lib/i18n/he";
import type { PageTheme } from "@/types/landing";
import type { SectionStyleOverrides } from "@/types/admin";
import type { PageNavSectionRow } from "@/lib/landing/page-nav";

export type FullscreenPreviewRow = {
  id: string;
  section_key: string;
  content: Record<string, unknown>;
  visible: boolean;
  variantId?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  pageId: string;
  theme: PageTheme;
  pageBackground: string;
  rows: FullscreenPreviewRow[];
  getVariantOverridesForSectionId: (sectionId: string) => SectionStyleOverrides | undefined;
  pageNavSections: PageNavSectionRow[];
};

export function FullscreenLandingPreview({
  open,
  onClose,
  pageId,
  theme,
  pageBackground,
  rows,
  getVariantOverridesForSectionId,
  pageNavSections,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex flex-col bg-neutral-950/35 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lc-fullscreen-preview-title"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/15 bg-neutral-900/88 px-4 py-3 text-white shadow-lg shadow-black/20 backdrop-blur-md supports-[backdrop-filter]:bg-neutral-900/72">
        <h2 id="lc-fullscreen-preview-title" className="text-sm font-semibold tracking-tight">
          {he.fullscreenPreviewTitle}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-neutral-900 shadow ring-1 ring-black/10 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {he.backToEditor}
        </button>
      </header>
      <div
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        style={{ backgroundColor: pageBackground }}
      >
        <div id="lc-page-top" className="lc-page-root min-h-full w-full">
          {rows.map((s) => (
            <SectionRenderer
              key={s.id}
              sectionKey={s.section_key}
              content={s.content}
              visible={s.visible}
              theme={theme}
              landingPageId={pageId}
              sectionId={s.id}
              editorPreview={false}
              embedded={false}
              variantStyleOverrides={getVariantOverridesForSectionId(s.id)}
              pageNavSections={pageNavSections}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
