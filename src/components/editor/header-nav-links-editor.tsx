"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { he } from "@/lib/i18n/he";
import {
  resolveNavLinksForPage,
  type PageNavSectionRow,
} from "@/lib/landing/page-nav";

function reorderIds(ids: string[], fromIndex: number, toIndex: number): string[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return ids;
  const next = [...ids];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

export function HeaderNavLinksEditor({
  pageNavSections,
  draft,
  setDraft,
}: {
  pageNavSections: PageNavSectionRow[];
  draft: Record<string, unknown>;
  setDraft: Dispatch<SetStateAction<Record<string, unknown>>>;
}) {
  const excluded = draft.navExcludedSectionIds as string[] | undefined;
  const order = draft.navSectionOrder as string[] | undefined;

  const links = useMemo(
    () =>
      resolveNavLinksForPage(pageNavSections, {
        excludedSectionIds: excluded,
        sectionOrder: order,
      }),
    [pageNavSections, excluded, order],
  );

  const [dragId, setDragId] = useState<string | null>(null);

  const hasCustom =
    (excluded?.length ?? 0) > 0 || (order != null && order.length > 0);

  function removeSectionId(id: string) {
    setDraft((prev) => {
      const curLinks = resolveNavLinksForPage(pageNavSections, {
        excludedSectionIds: prev.navExcludedSectionIds as string[] | undefined,
        sectionOrder: prev.navSectionOrder as string[] | undefined,
      });
      const nextEx = [...((prev.navExcludedSectionIds as string[]) ?? []), id];
      const ids = curLinks.map((l) => l.sectionId).filter((x) => x !== id);
      return { ...prev, navExcludedSectionIds: nextEx, navSectionOrder: ids };
    });
  }

  function applyReorder(fromIndex: number, toIndex: number) {
    setDraft((prev) => {
      const curLinks = resolveNavLinksForPage(pageNavSections, {
        excludedSectionIds: prev.navExcludedSectionIds as string[] | undefined,
        sectionOrder: prev.navSectionOrder as string[] | undefined,
      });
      const ids = curLinks.map((l) => l.sectionId);
      return { ...prev, navSectionOrder: reorderIds(ids, fromIndex, toIndex) };
    });
  }

  function resetAuto() {
    setDraft((prev) => {
      const n = { ...prev };
      delete n.navExcludedSectionIds;
      delete n.navSectionOrder;
      return n;
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-neutral-800">{he.headerNavLinksTitle}</span>
        {hasCustom ? (
          <button
            type="button"
            className="text-xs font-medium text-[var(--lc-primary)] underline"
            onClick={resetAuto}
          >
            {he.headerNavResetAuto}
          </button>
        ) : null}
      </div>
      <p className="text-xs leading-relaxed text-neutral-500">{he.headerNavLinksHint}</p>
      <ul className="max-h-[min(320px,50vh)] space-y-1 overflow-y-auto rounded-lg border border-neutral-200/90 bg-neutral-50/50 p-1.5">
        {links.length === 0 ? (
          <li className="px-2 py-4 text-center text-xs text-neutral-500">{he.headerNavLinksEmpty}</li>
        ) : (
          links.map((l, index) => (
            <li
              key={l.sectionId}
              draggable
              onDragStart={() => setDragId(l.sectionId)}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId == null) return;
                const fromIndex = links.findIndex((x) => x.sectionId === dragId);
                if (fromIndex < 0) return;
                if (fromIndex !== index) {
                  applyReorder(fromIndex, index);
                }
                setDragId(null);
              }}
              className={`flex items-center gap-2 rounded-md border border-neutral-200/80 bg-white px-2 py-2 text-sm shadow-sm ${
                dragId === l.sectionId ? "opacity-55" : ""
              }`}
            >
              <span
                className="cursor-grab select-none text-neutral-400 tabular-nums active:cursor-grabbing"
                title={he.headerNavDragHint}
                aria-hidden
              >
                {"⋮⋮"}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-neutral-800">{l.label}</span>
              <button
                type="button"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50"
                aria-label={he.headerNavRemoveAria}
                onClick={() => removeSectionId(l.sectionId)}
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
