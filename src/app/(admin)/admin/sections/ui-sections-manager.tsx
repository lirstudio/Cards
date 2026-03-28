"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteSectionDefinitionGlobally, toggleSectionEnabled } from "@/app/actions/admin";
import { SectionTypePreview } from "@/components/editor/section-type-preview";
import { he } from "@/lib/i18n/he";
import { SECTION_KEYS, type SectionKey } from "@/lib/sections/schemas";

type SectionDefWithCount = {
  key: string;
  title_he: string;
  description_he: string;
  category_slug: string;
  enabled: boolean;
  sort_order: number;
  variant_count: number;
  preview_image_url?: string | null;
};

function isRenderableSectionKey(k: string): k is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(k);
}

function categoryBadgeClass(slug: string): string {
  if (slug === "hero") return "bg-sky-100 text-sky-900 ring-sky-200/80";
  if (slug === "conversion") return "bg-amber-100 text-amber-950 ring-amber-200/80";
  return "bg-emerald-100 text-emerald-950 ring-emerald-200/80";
}

function SectionCardThumbnail({ sec }: { sec: SectionDefWithCount }) {
  const url = sec.preview_image_url?.trim();
  if (url) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element -- URL מנהל עשוי להיות חיצוני */
      <img src={url} alt="" className="h-[148px] w-full object-cover object-top" loading="lazy" />
    );
  }
  if (isRenderableSectionKey(sec.key)) {
    return <SectionTypePreview sectionKey={sec.key} />;
  }
  return (
    <div
      className="flex h-[148px] w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-neutral-100 to-neutral-200 px-4 text-center"
      aria-hidden
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-neutral-400">
        <path
          d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="text-[11px] font-medium text-neutral-500">{he.adminSectionNoThumbFallback}</span>
    </div>
  );
}

export function SectionsManager({
  initialSections,
}: {
  initialSections: SectionDefWithCount[];
}) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [pending, startTransition] = useTransition();

  function handleToggle(key: string, current: boolean) {
    startTransition(async () => {
      const res = await toggleSectionEnabled(key, !current);
      if (res.ok) {
        setSections((prev) =>
          prev.map((s) => (s.key === key ? { ...s, enabled: !current } : s)),
        );
      }
    });
  }

  function handleDelete(sec: SectionDefWithCount) {
    const msg = he.adminDeleteSectionConfirm
      .replace("{title}", sec.title_he)
      .replace("{key}", sec.key);
    if (!window.confirm(msg)) return;

    startTransition(async () => {
      const res = await deleteSectionDefinitionGlobally(sec.key);
      if (res.ok) {
        setSections((prev) => prev.filter((s) => s.key !== sec.key));
        router.refresh();
      } else if (res.error) {
        window.alert(res.error);
      }
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {sections.map((sec) => (
        <article
          key={sec.key}
          className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="relative overflow-hidden border-b border-neutral-100 bg-neutral-100">
            <SectionCardThumbnail sec={sec} />
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-base font-semibold leading-snug text-neutral-900">{sec.title_he}</h2>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${categoryBadgeClass(sec.category_slug)}`}
              >
                {sec.category_slug}
              </span>
            </div>

            <p className="line-clamp-2 text-xs leading-relaxed text-neutral-600">{sec.description_he}</p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500" dir="ltr">
              <code className="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-[11px] text-neutral-700">
                {sec.key}
              </code>
              <span className="text-neutral-400">·</span>
              <span>
                {he.adminSectionVariants}: {sec.variant_count}
              </span>
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => handleToggle(sec.key, sec.enabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                  sec.enabled ? "bg-blue-600" : "bg-neutral-300"
                }`}
                role="switch"
                aria-checked={sec.enabled}
                aria-label={he.adminToggleEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                    sec.enabled ? "-translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>

              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/sections/${sec.key}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label={he.editSectionAria}
                  title={he.editSectionAria}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                </Link>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDelete(sec)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                  aria-label={he.adminDeleteSectionAria}
                  title={he.adminDeleteSection}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
