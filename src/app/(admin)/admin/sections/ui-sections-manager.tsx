"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteSectionDefinitionGlobally,
  saveSectionLibraryBatch,
} from "@/app/actions/admin";
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
  preview_image_url?: string | null;
};

type SectionCategoryRow = { slug: string; name_he: string; sort_order: number };

function isRenderableSectionKey(k: string): k is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(k);
}

function categoryBadgeClass(slug: string): string {
  if (slug === "hero") return "bg-[var(--lc-primary)]/15 text-[var(--lc-primary)]";
  if (slug === "conversion") return "bg-[#ffc53d]/15 text-[#ffc53d]";
  if (slug === "footer" || slug === "פוטר") return "bg-[#c27aff]/15 text-[#d4b3ff]";
  if (slug === "gallery" || slug === "גלרייה") return "bg-[#ff8c42]/15 text-[#ffb380]";
  if (slug === "faq" || slug === "שאלות-תשובות" || slug === "שאלות-נפוצות") return "bg-[#5eead4]/15 text-[#99f6e4]";
  return "bg-[#11ff99]/15 text-[#11ff99]";
}

const CATEGORY_MENU_GAP_PX = 4;
/** גובה מקסימלי לרשימה (בערך 22rem) — מצומצם לפי שטח פנוי כדי לאפשר גלילה */
const CATEGORY_MENU_MAX_PX = 352;

type CategoryMenuPos = {
  minWidth: number;
  maxHeight: number;
} & (
  | { vert: "below"; top: number; left: number }
  | { vert: "below"; top: number; right: number }
  | { vert: "above"; bottom: number; left: number }
  | { vert: "above"; bottom: number; right: number }
);

function SectionCategoryTagMenu({
  sec,
  categories,
  pending,
  onPick,
}: {
  sec: SectionDefWithCount;
  categories: SectionCategoryRow[];
  pending: boolean;
  onPick: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<CategoryMenuPos | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }
    const wrap = wrapRef.current;
    if (!wrap) return;

    const place = () => {
      const r = wrap.getBoundingClientRect();
      const dir = getComputedStyle(wrap).direction;
      const minW = Math.max(168, r.width);
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const maxPreferred = Math.min(CATEGORY_MENU_MAX_PX, vh * 0.72);
      const spaceBelow = vh - r.bottom - CATEGORY_MENU_GAP_PX;
      const spaceAbove = r.top - CATEGORY_MENU_GAP_PX;
      const openUp =
        spaceBelow < Math.min(maxPreferred, 200) && spaceAbove > spaceBelow;
      const available = Math.max(0, openUp ? spaceAbove : spaceBelow);
      /** מגבילים גובה לשטח הפנוי כדי שהגלילה הפנימית תכסה את כל הרשימה */
      const maxHeight = Math.min(maxPreferred, Math.max(8, available));

      if (dir === "rtl") {
        const right = vw - r.right;
        if (openUp) {
          setMenuPos({
            vert: "above",
            bottom: vh - r.top + CATEGORY_MENU_GAP_PX,
            right,
            minWidth: minW,
            maxHeight,
          });
        } else {
          setMenuPos({
            vert: "below",
            top: r.bottom + CATEGORY_MENU_GAP_PX,
            right,
            minWidth: minW,
            maxHeight,
          });
        }
      } else if (openUp) {
        setMenuPos({
          vert: "above",
          bottom: vh - r.top + CATEGORY_MENU_GAP_PX,
          left: r.left,
          minWidth: minW,
          maxHeight,
        });
      } else {
        setMenuPos({
          vert: "below",
          top: r.bottom + CATEGORY_MENU_GAP_PX,
          left: r.left,
          minWidth: minW,
          maxHeight,
        });
      }
    };

    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = categories.find((c) => c.slug === sec.category_slug)?.name_he ?? sec.category_slug;

  const menu =
    open && menuPos ? (
      <div
        ref={menuRef}
        className="lc-admin-category-dropdown-panel fixed z-[9999] overflow-hidden rounded-xl border border-[rgba(214,235,253,0.22)] bg-[#0a0a0a] py-0 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)]"
        role="listbox"
        aria-label={he.adminSectionCategory}
        style={{
          minWidth: menuPos.minWidth,
          backgroundColor: "#0a0a0a",
          backgroundImage: "none",
          opacity: 1,
          ...(menuPos.vert === "below"
            ? { top: menuPos.top, bottom: "auto" }
            : { bottom: menuPos.bottom, top: "auto" }),
          ...("left" in menuPos
            ? { left: menuPos.left, right: "auto" }
            : { right: menuPos.right, left: "auto" }),
        }}
      >
        <div
          className="lc-admin-category-dropdown-panel-scroll min-h-0 overflow-y-auto overscroll-contain bg-[#0a0a0a] py-1 [touch-action:pan-y]"
          style={{
            backgroundColor: "#0a0a0a",
            backgroundImage: "none",
            maxHeight: menuPos.maxHeight,
          }}
        >
          {categories.map((c) => {
            const selected = c.slug === sec.category_slug;
            return (
              <button
                key={c.slug}
                type="button"
                role="option"
                aria-selected={selected}
                className={`flex w-full items-center gap-2 px-3 py-2 text-start text-xs transition hover:bg-white/10 ${
                  selected ? "bg-white/10 font-medium text-[#f0f0f0]" : "text-[#a1a4a5]"
                }`}
                onClick={() => {
                  onPick(c.slug);
                  setOpen(false);
                }}
              >
                {selected ? (
                  <svg
                    className="h-3 w-3 shrink-0 text-[var(--lc-primary)]"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M2 6l3 3 5-6" />
                  </svg>
                ) : (
                  <span className="h-3 w-3 shrink-0" aria-hidden />
                )}
                {c.name_he}
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={he.adminSectionCategoryTagOpenMenu}
        className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lc-primary)] disabled:opacity-50 ${categoryBadgeClass(sec.category_slug)}`}
      >
        <span className="truncate">{label}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" className="shrink-0 opacity-80" aria-hidden>
          <path d="M6 8L1 3h10L6 8z" />
        </svg>
      </button>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
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
      className="flex h-[148px] w-full flex-col items-center justify-center gap-1 bg-white/5 px-4 text-center"
      aria-hidden
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-[#464a4d]">
        <path
          d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="text-[11px] font-medium text-[#464a4d]">{he.adminSectionNoThumbFallback}</span>
    </div>
  );
}

export function SectionsManager({
  initialSections,
  initialCategories,
}: {
  initialSections: SectionDefWithCount[];
  initialCategories: SectionCategoryRow[];
}) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [savePending, startSaveTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const anyPending = savePending || deletePending;

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const isDirty = useMemo(() => {
    const byKey = new Map(initialSections.map((s) => [s.key, s]));
    return sections.some((s) => {
      const b = byKey.get(s.key);
      return !b || b.enabled !== s.enabled || b.category_slug !== s.category_slug;
    });
  }, [sections, initialSections]);

  const filteredSections = useMemo(() => {
    if (categoryFilter === "all") return sections;
    return sections.filter((s) => s.category_slug === categoryFilter);
  }, [sections, categoryFilter]);

  function handleToggle(key: string, current: boolean) {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, enabled: !current } : s)),
    );
  }

  function handleSaveLibrary() {
    if (!isDirty) return;
    startSaveTransition(async () => {
      const byKey = new Map(initialSections.map((s) => [s.key, s]));
      const updates = sections
        .map((s) => {
          const b = byKey.get(s.key);
          if (!b || (b.enabled === s.enabled && b.category_slug === s.category_slug)) {
            return null;
          }
          return { key: s.key, enabled: s.enabled, category_slug: s.category_slug };
        })
        .filter((u): u is { key: string; enabled: boolean; category_slug: string } => u !== null);
      if (updates.length === 0) return;
      const res = await saveSectionLibraryBatch(updates);
      if (res.ok) {
        router.refresh();
      } else {
        window.alert(res.error ?? he.adminError);
      }
    });
  }

  function handleDelete(sec: SectionDefWithCount) {
    const msg = he.adminDeleteSectionConfirm
      .replace("{title}", sec.title_he)
      .replace("{key}", sec.key);
    if (!window.confirm(msg)) return;

    startDeleteTransition(async () => {
      const res = await deleteSectionDefinitionGlobally(sec.key);
      if (res.ok) {
        setSections((prev) => prev.filter((s) => s.key !== sec.key));
        router.refresh();
      } else if (res.error) {
        window.alert(res.error);
      }
    });
  }

  function handleCategorySelect(sec: SectionDefWithCount, nextSlug: string) {
    if (nextSlug === sec.category_slug) return;
    setSections((prev) =>
      prev.map((s) => (s.key === sec.key ? { ...s, category_slug: nextSlug } : s)),
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" dir="rtl">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#f0f0f0]">{he.adminSections}</h1>
          {isDirty ? (
            <p className="text-xs text-[#ffc53d]/90">{he.unsavedBanner}</p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={!isDirty || anyPending}
          onClick={handleSaveLibrary}
          className="shrink-0 rounded-lg bg-[var(--lc-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {savePending ? he.savingPageChanges : he.savePageChanges}
        </button>
      </header>

      <div className="space-y-2" dir="rtl">
        <p className="text-xs font-medium text-[#a1a4a5]">{he.adminSectionsFilterByCategory}</p>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={he.adminSectionsFilterByCategory}
        >
          <button
            type="button"
            disabled={anyPending}
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              categoryFilter === "all"
                ? "bg-[var(--lc-primary)] text-white"
                : "bg-white/10 text-[#a1a4a5] hover:bg-white/15 hover:text-[#f0f0f0]"
            } disabled:opacity-50`}
          >
            {he.adminSectionsShowAllCategories}{" "}
            <span className="tabular-nums opacity-80">({sections.length})</span>
          </button>
          {initialCategories.map((c) => {
            const n = sections.filter((s) => s.category_slug === c.slug).length;
            return (
              <button
                key={c.slug}
                type="button"
                disabled={anyPending}
                onClick={() => setCategoryFilter(c.slug)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  categoryFilter === c.slug
                    ? "bg-[var(--lc-primary)] text-white"
                    : "bg-white/10 text-[#a1a4a5] hover:bg-white/15 hover:text-[#f0f0f0]"
                } disabled:opacity-50`}
              >
                {c.name_he} <span className="tabular-nums opacity-80">({n})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredSections.length === 0 ? (
          <p className="col-span-full rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 px-4 py-8 text-center text-sm text-[#a1a4a5]">
            {he.adminSectionsEmptyFilter}
          </p>
        ) : null}
        {filteredSections.map((sec, index) => (
        <article
          key={sec.key}
          className="lc-admin-section-card-in flex flex-col overflow-visible rounded-2xl border border-[rgba(214,235,253,0.19)] bg-white/5 shadow-[0_0_0_1px_rgba(176,199,217,0.145)] transition-shadow hover:shadow-[0_0_0_1px_rgba(176,199,217,0.145)]"
          style={{ animationDelay: `${Math.min(index, 14) * 42}ms` }}
        >
          <div className="relative overflow-hidden border-b border-[rgba(214,235,253,0.19)] bg-white/5">
            <SectionCardThumbnail sec={sec} />
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-base font-semibold leading-snug text-[#f0f0f0]">{sec.title_he}</h2>
              <SectionCategoryTagMenu
                sec={sec}
                categories={initialCategories}
                pending={anyPending}
                onPick={(slug) => handleCategorySelect(sec, slug)}
              />
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(214,235,253,0.19)] pt-3">
              <button
                type="button"
                disabled={anyPending}
                onClick={() => handleToggle(sec.key, sec.enabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                  sec.enabled ? "bg-[var(--lc-primary)]" : "bg-white/10"
                }`}
                role="switch"
                aria-checked={sec.enabled}
                aria-label={he.adminToggleEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-[#f0f0f0] transition-transform duration-200 ${
                    sec.enabled ? "-translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>

              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/sections/${sec.key}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(214,235,253,0.19)] text-[#a1a4a5] transition hover:border-[rgba(214,235,253,0.19)] hover:bg-white/10 hover:text-[#f0f0f0]"
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
                  disabled={anyPending}
                  onClick={() => handleDelete(sec)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#ff2047]/30 bg-white/5 text-[#ff2047] transition hover:border-[#ff2047]/30 hover:bg-[#ff2047]/10 disabled:opacity-50"
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
    </div>
  );
}
