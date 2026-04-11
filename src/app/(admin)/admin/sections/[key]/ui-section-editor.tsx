"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  upsertSectionDefinition,
  upsertSectionVariant,
  deleteSectionVariant,
  deleteSectionVariants,
} from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalPanel,
} from "@/components/ui/modal";
import { ScaledSectionPreviewLayer } from "@/components/editor/scaled-section-preview-layer";
import { SectionRenderer } from "@/components/landing/SectionRenderer";
import { getDefaultContentForAdminPreview } from "@/lib/sections/defaults";
import {
  isLegacyNavHeroStatsKey,
  SECTION_KEYS,
  type SectionKey,
} from "@/lib/sections/schemas";
import type {
  SectionDefinitionRow,
  SectionVariantRow,
  SectionCategoryRow,
  SectionStyleOverrides,
} from "@/types/admin";

const EMPTY_OVERRIDES: SectionStyleOverrides = {};

function optionDisplayName(nameHe: string | undefined, index: number): string {
  const t = nameHe?.trim();
  if (t) return t;
  return he.adminDesignOptionNumbered.replace("{n}", String(index + 1));
}

type DesignCardDisplayItem =
  | { kind: "implicit" }
  | { kind: "persisted"; row: SectionVariantRow };

function emptyVariantDraft(
  sectionKey: string,
  sortOrder: number,
): Partial<SectionVariantRow> {
  return {
    section_key: sectionKey,
    name_he: "",
    style_overrides: EMPTY_OVERRIDES,
    is_default: false,
    enabled: true,
    sort_order: sortOrder,
  };
}

function PencilIcon() {
  return (
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
  );
}

function TrashIcon() {
  return (
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
  );
}

function themeFromOverrides(vo: SectionStyleOverrides) {
  return {
    primary: vo.accentColor ?? "#3b9eff",
    background: "#000000",
    heading: vo.textColor ?? "#f0f0f0",
    body: "#a1a4a5",
  };
}

/** תצוגה מקדימה לפי גודל — אצבע ברשימה או גדול בעורך */
function AdminVariantPreview({
  sectionKey,
  content,
  variantStyleOverrides,
  previewId,
  size,
  /** תופס את כל רוחב/גובה הורה — כרטיס ברשימה או עמודת תצוגה במודאל */
  fillContainer = false,
}: {
  sectionKey: string;
  content: Record<string, unknown>;
  variantStyleOverrides: SectionStyleOverrides;
  previewId: string;
  size: "thumb" | "large";
  fillContainer?: boolean;
}) {
  const vo = variantStyleOverrides ?? EMPTY_OVERRIDES;
  const scale =
    size === "thumb"
      ? fillContainer
        ? 0.58
        : 0.42
      : fillContainer
        ? 0.72
        : 0.62;
  const frame =
    size === "thumb"
      ? fillContainer
        ? "relative h-full min-h-[240px] w-full overflow-hidden rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5"
        : "relative h-[248px] w-full overflow-hidden rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5"
      : fillContainer
        ? "relative h-full min-h-[min(52vh,600px)] w-full overflow-hidden rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5"
        : "relative min-h-[520px] w-full overflow-hidden rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5";
  const denseInThumb =
    sectionKey === "hero_image_split" ||
    isLegacyNavHeroStatsKey(sectionKey) ||
    sectionKey === "site_header_nav" ||
    (sectionKey === "stats_highlight_row" && size === "thumb");
  return (
    <div className={frame} title={he.adminVariantPreviewTitle}>
      <ScaledSectionPreviewLayer scale={scale}>
        <SectionRenderer
          sectionKey={sectionKey}
          content={content}
          visible
          theme={themeFromOverrides(vo)}
          landingPageId="admin-variant-preview"
          sectionId={previewId}
          editorPreview
          embedded={denseInThumb}
          variantStyleOverrides={vo}
        />
      </ScaledSectionPreviewLayer>
    </div>
  );
}

function VariantStyleForm({
  value,
  onChange,
  sectionKey,
}: {
  value: SectionStyleOverrides;
  onChange: (v: SectionStyleOverrides) => void;
  sectionKey?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-[#a1a4a5]">{he.adminStyleText}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value.textColor ?? "#f0f0f0"}
            onChange={(e) => onChange({ ...value, textColor: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border border-[rgba(214,235,253,0.19)]"
          />
          <input
            type="text"
            value={value.textColor ?? ""}
            onChange={(e) => onChange({ ...value, textColor: e.target.value || undefined })}
            placeholder="#f0f0f0"
            dir="ltr"
            className="flex-1 text-xs"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[#a1a4a5]">{he.adminStyleAccent}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value.accentColor ?? "#3b9eff"}
            onChange={(e) => onChange({ ...value, accentColor: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border border-[rgba(214,235,253,0.19)]"
          />
          <input
            type="text"
            value={value.accentColor ?? ""}
            onChange={(e) => onChange({ ...value, accentColor: e.target.value || undefined })}
            placeholder="#3b9eff"
            dir="ltr"
            className="flex-1 text-xs"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[#a1a4a5]">{he.adminStylePadding}</label>
        <select
          value={value.paddingY ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              paddingY: (e.target.value || undefined) as SectionStyleOverrides["paddingY"],
            })
          }
          className="w-full text-xs"
        >
          <option value="">ברירת מחדל</option>
          <option value="sm">קטן</option>
          <option value="md">בינוני</option>
          <option value="lg">גדול</option>
          <option value="xl">גדול מאוד</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[#a1a4a5]">{he.adminStyleRadius}</label>
        <select
          value={value.borderRadius ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              borderRadius: (e.target.value || undefined) as SectionStyleOverrides["borderRadius"],
            })
          }
          className="w-full text-xs"
        >
          <option value="">ברירת מחדל</option>
          <option value="none">ללא</option>
          <option value="sm">קטן</option>
          <option value="md">בינוני</option>
          <option value="lg">גדול</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[#a1a4a5]">{he.adminStyleDirection}</label>
        <select
          value={value.layoutDirection ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              layoutDirection: (e.target.value || undefined) as SectionStyleOverrides["layoutDirection"],
            })
          }
          className="w-full text-xs"
        >
          <option value="">ברירת מחדל</option>
          <option value="rtl">ימין לשמאל</option>
          <option value="ltr">שמאל לימין</option>
        </select>
      </div>
      {sectionKey === "checklist_with_image" ? (
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-medium text-[#a1a4a5]">{he.adminChecklistLayout}</label>
          <select
            value={value.checklistLayout ?? "with_image"}
            onChange={(e) =>
              onChange({
                ...value,
                checklistLayout: e.target.value as NonNullable<
                  SectionStyleOverrides["checklistLayout"]
                >,
              })
            }
            className="w-full text-xs"
          >
            <option value="with_image">{he.adminChecklistWithImage}</option>
            <option value="text_only">{he.adminChecklistTextOnly}</option>
          </select>
        </div>
      ) : null}
      {sectionKey === "testimonials_row" ? (
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-medium text-[#a1a4a5]">{he.adminTestimonialsLayout}</label>
          <select
            value={value.testimonialsLayout ?? "marquee"}
            onChange={(e) =>
              onChange({
                ...value,
                testimonialsLayout: e.target.value as NonNullable<
                  SectionStyleOverrides["testimonialsLayout"]
                >,
              })
            }
            className="w-full text-xs"
          >
            <option value="marquee">{he.adminTestimonialsMarquee}</option>
            <option value="photo_cards">{he.adminTestimonialsPhotoCards}</option>
            <option value="star_cards">{he.adminTestimonialsStarCards}</option>
            <option value="quote_side">{he.adminTestimonialsQuoteSide}</option>
            <option value="cinematic">{he.adminTestimonialsCinematic}</option>
          </select>
        </div>
      ) : null}
      <div className="col-span-2 space-y-1">
        <label className="text-xs font-medium text-[#a1a4a5]">{he.adminImageTextLayout}</label>
        <select
          value={value.imageTextLayout ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              imageTextLayout: (e.target.value || undefined) as SectionStyleOverrides["imageTextLayout"],
            })
          }
          className="w-full text-xs"
        >
          <option value="">{he.adminLayoutSideBySide}</option>
          <option value="stack_text_above">{he.adminLayoutStackTextAbove}</option>
          <option value="stack_image_above">{he.adminLayoutStackImageAbove}</option>
        </select>
      </div>
    </div>
  );
}

function VariantDraftEditor({
  draft,
  patchDraft,
  onSave,
  onCancel,
  cancelLabel,
  pending,
  canPreview,
  sectionKey,
  previewContent,
  previewSize,
}: {
  draft: Partial<SectionVariantRow>;
  patchDraft: (patch: Partial<SectionVariantRow>) => void;
  onSave: () => void;
  onCancel: () => void;
  cancelLabel: string;
  pending: boolean;
  canPreview: boolean;
  sectionKey: string;
  previewContent: Record<string, unknown>;
  previewSize: "thumb" | "large";
}) {
  return (
    <div
      className="flex flex-col gap-4 lg:flex-row lg:items-stretch"
      dir="rtl"
    >
      <div className="min-w-0 flex-1 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#a1a4a5]">{he.adminVariantName}</label>
          <input
            type="text"
            value={draft.name_he ?? ""}
            onChange={(e) => patchDraft({ name_he: e.target.value })}
            className="block w-full text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.is_default ?? false}
              onChange={(e) => patchDraft({ is_default: e.target.checked })}
              className="rounded"
            />
            {he.adminVariantDefault}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.enabled ?? true}
              onChange={(e) => patchDraft({ enabled: e.target.checked })}
              className="rounded"
            />
            {he.adminSectionEnabled}
          </label>
        </div>

        <h4 className="text-xs font-semibold text-[#a1a4a5]">{he.adminVariantStyle}</h4>
        <VariantStyleForm
          sectionKey={sectionKey}
          value={draft.style_overrides ?? EMPTY_OVERRIDES}
          onChange={(v) => patchDraft({ style_overrides: v })}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || !draft.name_he?.trim()}
            onClick={onSave}
            className="rounded-lg bg-[var(--lc-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {he.adminSave}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[rgba(214,235,253,0.19)] px-4 py-2 text-sm font-medium text-[#a1a4a5] transition hover:bg-white/10"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
      {canPreview ? (
        <div className="flex w-full min-w-0 shrink-0 flex-col lg:max-w-[min(100%,520px)] lg:flex-1">
          <p className="mb-2 shrink-0 text-xs font-medium text-[#a1a4a5]">{he.adminLivePreview}</p>
          <div className="relative min-h-[min(48vh,560px)] w-full flex-1">
            <AdminVariantPreview
              sectionKey={sectionKey}
              content={previewContent}
              variantStyleOverrides={draft.style_overrides ?? EMPTY_OVERRIDES}
              previewId={draft.id ? `admin-edit-${draft.id}` : "admin-edit-new"}
              size={previewSize}
              fillContainer
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SectionEditor({
  definition,
  initialVariants,
  categories,
}: {
  definition: SectionDefinitionRow;
  initialVariants: SectionVariantRow[];
  categories: SectionCategoryRow[];
}) {
  const [def, setDef] = useState(definition);
  const [variants, setVariants] = useState(initialVariants);
  const [editingVariant, setEditingVariant] = useState<Partial<SectionVariantRow> | null>(null);
  const [selectedVariantIds, setSelectedVariantIds] = useState<Set<string>>(() => new Set());
  const [msg, setMsg] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDef(definition);
  }, [definition]);

  useEffect(() => {
    setVariants(initialVariants);
  }, [initialVariants]);

  useEffect(() => {
    const valid = new Set(variants.map((v) => v.id));
    setSelectedVariantIds((prev) => {
      const next = new Set([...prev].filter((id) => valid.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [variants]);

  const canPreview =
    SECTION_KEYS.includes(def.key as SectionKey) || isLegacyNavHeroStatsKey(def.key);
  const previewContent = getDefaultContentForAdminPreview(def.key);
  const displayItems: DesignCardDisplayItem[] =
    variants.length > 0
      ? variants.map((row) => ({ kind: "persisted", row }))
      : [{ kind: "implicit" }];
  /** תמיד מציגים הוספה כשלא עורכים מודאל — כולל כשאין עדיין כרטיסים במסד. */
  const showAddVariantButton = !editingVariant;
  const variantEditorModalOpen = !!editingVariant;

  function openVariantEditor(draft: Partial<SectionVariantRow>) {
    setEditingVariant(draft);
  }

  function patchDraft(patch: Partial<SectionVariantRow>) {
    setEditingVariant((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function handleVariantEditorCancel() {
    setEditingVariant(null);
  }

  const variantCancelLabel = he.adminBackToVariantList;

  function handleSaveDefinition() {
    startTransition(async () => {
      const res = await upsertSectionDefinition({
        key: def.key,
        title_he: def.title_he,
        description_he: def.description_he,
        category_slug: def.category_slug,
        enabled: def.enabled,
        sort_order: def.sort_order,
        preview_image_url: def.preview_image_url,
      });
      if (res.ok) {
        setMsg(he.adminSaved);
        router.refresh();
      } else {
        setMsg(res.error ?? he.adminError);
      }
    });
  }

  function handleSaveVariant() {
    if (!editingVariant) return;
    const current = editingVariant;
    startTransition(async () => {
      const res = await upsertSectionVariant({
        id: current.id,
        section_key: def.key,
        name_he: current.name_he ?? "",
        style_overrides: current.style_overrides ?? EMPTY_OVERRIDES,
        is_default: current.is_default ?? false,
        enabled: current.enabled ?? true,
        sort_order: current.sort_order ?? variants.length,
      });
      if (res.ok) {
        setMsg(he.adminSaved);
        const { getSectionDefinition } = await import("@/app/actions/admin");
        const fresh = await getSectionDefinition(def.key);
        setVariants(fresh.variants);
        setEditingVariant(null);
      } else {
        setMsg(res.error ?? he.adminError);
      }
    });
  }

  function handleDeleteVariant(id: string) {
    startTransition(async () => {
      const res = await deleteSectionVariant(id);
      if (res.ok) {
        const next = variants.filter((v) => v.id !== id);
        setVariants(next);
        setSelectedVariantIds((prev) => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        });
        if (editingVariant?.id === id) {
          setEditingVariant(null);
        }
      }
    });
  }

  const allVariantsSelected =
    variants.length > 0 && selectedVariantIds.size === variants.length;
  const someVariantsSelected =
    selectedVariantIds.size > 0 && !allVariantsSelected;

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someVariantsSelected;
  }, [someVariantsSelected, allVariantsSelected]);

  function toggleSelectVariant(id: string) {
    setSelectedVariantIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllVariants() {
    if (allVariantsSelected) {
      setSelectedVariantIds(new Set());
    } else {
      setSelectedVariantIds(new Set(variants.map((v) => v.id)));
    }
  }

  function handleBulkDeleteVariants() {
    const ids = [...selectedVariantIds];
    if (ids.length === 0) return;
    const confirmMsg = he.adminBulkDeleteConfirm.replace("{n}", String(ids.length));
    if (!window.confirm(confirmMsg)) return;
    startTransition(async () => {
      const res = await deleteSectionVariants(def.key, ids);
      if (res.ok) {
        setMsg(he.adminSaved);
        const idSet = new Set(ids);
        setVariants((prev) => prev.filter((v) => !idSet.has(v.id)));
        setSelectedVariantIds(new Set());
        if (editingVariant?.id && idSet.has(editingVariant.id)) {
          setEditingVariant(null);
        }
        router.refresh();
      } else {
        setMsg(res.error ?? he.adminError);
      }
    });
  }

  return (
    <div className="rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 p-5 space-y-4">
      <header className="space-y-4 border-b border-[rgba(214,235,253,0.19)] pb-5" dir="rtl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="text-base font-semibold text-[#f0f0f0]">{he.adminSectionDetails}</h2>
          <button
            type="button"
            disabled={pending || !def.title_he.trim()}
            onClick={handleSaveDefinition}
            className="shrink-0 rounded-lg bg-[var(--lc-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {he.adminSave}
          </button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              className="block text-xs font-medium text-[#a1a4a5]"
              htmlFor="section-display-name"
            >
              {he.adminSectionDisplayName}
            </label>
            <input
              id="section-display-name"
              type="text"
              value={def.title_he}
              onChange={(e) => setDef({ ...def, title_he: e.target.value })}
              className="block w-full max-w-2xl text-lg font-semibold text-[#f0f0f0]"
            />
            <p className="text-[11px] leading-relaxed text-[#464a4d]">
              {he.adminSectionDisplayNameHint}
            </p>
          </div>
          <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#a1a4a5]" htmlFor="section-category">
                {he.adminSectionCategory}
              </label>
              <select
                id="section-category"
                value={def.category_slug}
                onChange={(e) => setDef({ ...def, category_slug: e.target.value })}
                className="block w-full text-sm"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name_he}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#a1a4a5]" htmlFor="section-sort">
                {he.adminSectionSortOrder}
              </label>
              <input
                id="section-sort"
                type="number"
                value={def.sort_order}
                onChange={(e) => setDef({ ...def, sort_order: Number(e.target.value) })}
                className="block w-full text-sm sm:max-w-[8rem]"
              />
            </div>
          </div>
          <div className="max-w-2xl space-y-1">
            <label className="block text-xs font-medium text-[#a1a4a5]" htmlFor="section-description">
              {he.adminSectionDescription}
            </label>
            <textarea
              id="section-description"
              value={def.description_he}
              onChange={(e) => setDef({ ...def, description_he: e.target.value })}
              rows={3}
              className="block w-full text-sm"
            />
          </div>
          <label className="flex max-w-2xl items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={def.enabled}
              onChange={(e) => setDef({ ...def, enabled: e.target.checked })}
              className="rounded"
            />
            {he.adminSectionEnabled}
          </label>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#464a4d]">
            <span>{he.adminSectionKey}</span>
            <code
              className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-[#a1a4a5]"
              dir="ltr"
            >
              {def.key}
            </code>
          </div>
        </div>
      </header>

      <div
        className="flex flex-wrap items-center justify-between gap-3"
        dir="rtl"
      >
        <h2 className="font-semibold">{he.adminSectionVariants}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {showAddVariantButton ? (
            <button
              type="button"
              onClick={() =>
                openVariantEditor({
                  ...emptyVariantDraft(def.key, variants.length),
                  ...(variants.length === 0 ? { is_default: true } : {}),
                })
              }
              className="rounded-lg bg-[var(--lc-primary)] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
            >
              + {he.adminAddVariant}
            </button>
          ) : null}
        </div>
      </div>

      {variants.length > 0 && !variantEditorModalOpen ? (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5 px-3 py-2"
          dir="rtl"
        >
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#a1a4a5]">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allVariantsSelected}
              onChange={toggleSelectAllVariants}
              className="rounded border-[rgba(214,235,253,0.19)]"
            />
            {he.adminBulkSelectAll}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {selectedVariantIds.size > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedVariantIds(new Set())}
                  className="text-xs text-[#a1a4a5] underline hover:text-[#f0f0f0]"
                >
                  {he.adminBulkClearSelection}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleBulkDeleteVariants}
                  className="rounded-lg border border-[#ff2047]/30 bg-[#ff2047]/10 px-3 py-1.5 text-xs font-medium text-[#ff2047] transition hover:bg-[#ff2047]/15 disabled:opacity-50"
                >
                  {he.adminBulkDeleteSelected} ({selectedVariantIds.size})
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {msg ? (
        <p className="text-xs text-[#11ff99]" dir="rtl">
          {msg}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 sm:items-stretch">
        {displayItems.map((item, index) => {
          const isImplicit = item.kind === "implicit";
          const v = item.kind === "persisted" ? item.row : null;
          const previewId = isImplicit
            ? "admin-implicit-default"
            : `admin-row-${v!.id}`;
          const styleOverrides = v?.style_overrides ?? EMPTY_OVERRIDES;
          const showDefaultBadge = isImplicit || v?.is_default;
          const title = optionDisplayName(v?.name_he, index);

          return (
            <div
              key={isImplicit ? "implicit-default" : v!.id}
              className="flex min-h-[min(420px,70vh)] flex-col gap-3 rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5 p-3 sm:min-h-[440px] sm:p-4"
              dir="rtl"
            >
              <div className="flex shrink-0 items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{title}</span>
                    {showDefaultBadge ? (
                      <span className="rounded-full bg-[var(--lc-primary)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--lc-primary)]">
                        {he.adminVariantDefault}
                      </span>
                    ) : null}
                    {v && !v.enabled ? (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[#a1a4a5]">
                        {he.adminSectionDisabled}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {v ? (
                    <label className="inline-flex cursor-pointer items-center p-1">
                      <input
                        type="checkbox"
                        checked={selectedVariantIds.has(v.id)}
                        onChange={() => toggleSelectVariant(v.id)}
                        className="size-4 rounded border-[rgba(214,235,253,0.19)]"
                        aria-label={he.adminVariantCheckboxAria}
                      />
                    </label>
                  ) : null}
                  <button
                    type="button"
                    onClick={() =>
                      isImplicit
                        ? openVariantEditor({
                            ...emptyVariantDraft(def.key, 0),
                            is_default: true,
                          })
                        : openVariantEditor({ ...v })
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5 text-[#a1a4a5] transition hover:bg-white/10"
                    title={he.adminEditVariant}
                    aria-label={he.adminEditVariant}
                  >
                    <PencilIcon />
                  </button>
                  {v ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleDeleteVariant(v.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#ff2047]/30 text-[#ff2047] transition hover:bg-[#ff2047]/10 disabled:opacity-50"
                      title={he.adminDeleteVariant}
                      aria-label={he.adminDeleteVariant}
                    >
                      <TrashIcon />
                    </button>
                  ) : null}
                </div>
              </div>
              {canPreview ? (
                <div className="relative min-h-0 flex-1 basis-0">
                  <AdminVariantPreview
                    sectionKey={def.key}
                    content={previewContent}
                    variantStyleOverrides={styleOverrides}
                    previewId={previewId}
                    size="thumb"
                    fillContainer
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {variantEditorModalOpen && editingVariant ? (
        <Modal
          labelledBy="section-variant-editor-title"
          onRequestClose={handleVariantEditorCancel}
          backdropAriaLabel={he.closeSettings}
          zClassName="z-[100]"
        >
          <ModalPanel
            maxWidthClassName="max-w-[min(1100px,96vw)]"
            dir="rtl"
            className="max-h-[min(92vh,900px)]"
          >
            <ModalHeader
              titleId="section-variant-editor-title"
              title={
                editingVariant.id ? he.adminVariantEditorTitle : he.adminAddVariant
              }
              onClose={handleVariantEditorCancel}
              closeAriaLabel={he.closeSettings}
              dense
            />
            <ModalBody className="p-4 sm:p-5">
              <VariantDraftEditor
                draft={editingVariant}
                patchDraft={patchDraft}
                onSave={handleSaveVariant}
                onCancel={handleVariantEditorCancel}
                cancelLabel={variantCancelLabel}
                pending={pending}
                canPreview={canPreview}
                sectionKey={def.key}
                previewContent={previewContent}
                previewSize="large"
              />
            </ModalBody>
          </ModalPanel>
        </Modal>
      ) : null}
    </div>
  );
}
