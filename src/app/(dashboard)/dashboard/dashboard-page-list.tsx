"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteLandingPagesBulk } from "@/app/actions/pages";
import { he } from "@/lib/i18n/he";
import { CopyLinkButton } from "./copy-link-button";
import { DeleteLandingPageButton } from "./delete-landing-page-button";

export type DashboardPageCard = {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  updatedRelative: string;
  publishedShort: string | null;
  viewCount: number;
  submissionCount: number;
  pageUrl: string;
  pageLabel: string;
};

function MetricItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-bold tabular-nums text-[#f0f0f0]">
        {value.toLocaleString("he-IL")}
      </span>
      <span className="text-xs text-[#a1a4a5]">{label}</span>
    </div>
  );
}

export function DashboardPageList({ pages }: { pages: DashboardPageCard[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [pending, startTransition] = useTransition();
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const valid = new Set(pages.map((p) => p.id));
    setSelected((prev) => {
      const next = new Set([...prev].filter((id) => valid.has(id)));
      if (next.size === prev.size && [...prev].every((id) => next.has(id))) return prev;
      return next;
    });
  }, [pages]);

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = selected.size > 0 && selected.size < pages.length;
  }, [selected, pages.length]);

  const allSelected = pages.length > 0 && selected.size === pages.length;

  function toggleSelectAll() {
    setSelected((prev) => {
      if (prev.size === pages.length) return new Set();
      return new Set(pages.map((p) => p.id));
    });
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkDelete() {
    const ids = [...selected];
    if (ids.length === 0) return;
    const msg = he.dashboardBulkDeleteConfirm.replace("{n}", String(ids.length));
    if (!window.confirm(msg)) return;
    startTransition(async () => {
      const r = await deleteLandingPagesBulk(ids);
      if (!r.ok) {
        window.alert(r.error || he.deletePageError);
        return;
      }
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(214,235,253,0.09)] pb-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#a1a4a5] select-none">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-[rgba(214,235,253,0.35)] bg-transparent text-[#3b9eff] focus:ring-[#3b9eff]/40"
          />
          <span>{he.dashboardSelectAll}</span>
        </label>
        <button
          type="button"
          onClick={bulkDelete}
          disabled={pending || selected.size === 0}
          className="rounded-full border border-[#ff2047]/30 bg-[#ff2047]/10 px-4 py-2 text-sm font-medium text-[#ff2047] transition hover:bg-[#ff2047]/20 disabled:pointer-events-none disabled:opacity-40"
        >
          {pending ? he.dashboardBulkDeleteDeleting : he.dashboardBulkDelete}
        </button>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((p) => (
          <li
            key={p.id}
            className={`flex flex-col rounded-2xl border p-5 transition hover:bg-white/[0.03] ${
              selected.has(p.id)
                ? "border-[rgba(59,158,255,0.45)] bg-[rgba(59,158,255,0.06)]"
                : "border-[rgba(214,235,253,0.19)] bg-transparent"
            }`}
          >
            <div className="flex flex-wrap items-start gap-2">
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggleOne(p.id)}
                aria-label={`${he.dashboardSelectPageForBulkAria}: ${p.pageLabel}`}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[rgba(214,235,253,0.35)] bg-transparent text-[#3b9eff] focus:ring-[#3b9eff]/40"
              />
              <h2 className="min-w-0 flex-1 text-base font-semibold text-[#f0f0f0]">{p.title}</h2>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  p.isPublished ? "bg-[#11ff99]/15 text-[#11ff99]" : "bg-white/10 text-[#a1a4a5]"
                }`}
              >
                {p.isPublished ? he.published : he.draft}
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <CopyLinkButton url={p.pageUrl} />
              <span className="text-xs text-[#a1a4a5]">
                {he.dashboardLastUpdated} {p.updatedRelative}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[rgba(214,235,253,0.09)] pt-3">
              <MetricItem label={he.dashboardViews} value={p.viewCount} />
              <MetricItem label={he.dashboardLeads} value={p.submissionCount} />
              <div className="ms-auto">
                {p.isPublished && p.publishedShort ? (
                  <span className="text-xs text-[#a1a4a5]">
                    {he.dashboardPublishedAt}: {p.publishedShort}
                  </span>
                ) : (
                  <span className="text-xs text-[#464a4d]">{he.dashboardNeverPublished}</span>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/dashboard/pages/${p.id}/edit`}
                className="rounded-full border border-[rgba(214,235,253,0.19)] px-4 py-2 text-sm text-[#f0f0f0] transition hover:bg-white/10"
              >
                {he.editPage}
              </Link>
              {p.isPublished ? (
                <Link
                  href={`/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[rgba(214,235,253,0.19)] px-4 py-2 text-sm font-medium text-[#f0f0f0] transition hover:bg-white/10"
                >
                  {he.openPage}
                </Link>
              ) : null}
              <DeleteLandingPageButton pageId={p.id} pageLabel={p.pageLabel} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
