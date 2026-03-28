"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  upsertSectionDefinition,
  upsertSectionVariant,
  deleteSectionVariant,
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
    primary: vo.accentColor ?? "#0b43b4",
    background: vo.backgroundColor ?? "#f8f9fa",
    heading: vo.textColor ?? "#000000",
    body: "#4b5563",
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
        ? "relative h-full min-h-[240px] w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
        : "relative h-[248px] w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
      : fillContainer
        ? "relative h-full min-h-[min(52vh,600px)] w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
        : "relative min-h-[520px] w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100";
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
}: {
  value: SectionStyleOverrides;
  onChange: (v: SectionStyleOverrides) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-600">{he.adminStyleBg}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value.backgroundColor ?? "#ffffff"}
            onChange={(e) => onChange({ ...value, backgroundColor: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border border-neutral-300"
          />
          <input
            type="text"
            value={value.backgroundColor ?? ""}
            onChange={(e) => onChange({ ...value, backgroundColor: e.target.value || undefined })}
            placeholder="#ffffff"
            dir="ltr"
            className="flex-1 text-xs"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-600">{he.adminStyleText}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value.textColor ?? "#000000"}
            onChange={(e) => onChange({ ...value, textColor: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border border-neutral-300"
          />
          <input
            type="text"
            value={value.textColor ?? ""}
            onChange={(e) => onChange({ ...value, textColor: e.target.value || undefined })}
            placeholder="#000000"
            dir="ltr"
            className="flex-1 text-xs"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-600">{he.adminStyleAccent}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value.accentColor ?? "#0b43b4"}
            onChange={(e) => onChange({ ...value, accentColor: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded border border-neutral-300"
          />
          <input
            type="text"
            value={value.accentColor ?? ""}
            onChange={(e) => onChange({ ...value, accentColor: e.target.value || undefined })}
            placeholder="#0b43b4"
            dir="ltr"
            className="flex-1 text-xs"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-600">{he.adminStylePadding}</label>
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
        <label className="text-xs font-medium text-neutral-600">{he.adminStyleRadius}</label>
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
        <label className="text-xs font-medium text-neutral-600">{he.adminStyleDirection}</label>
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
      <div className="col-span-2 space-y-1">
        <label className="text-xs font-medium text-neutral-600">{he.adminImageTextLayout}</label>
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
          <label className="text-xs font-medium text-neutral-600">{he.adminVariantName}</label>
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

        <h4 className="text-xs font-semibold text-neutral-600">{he.adminVariantStyle}</h4>
        <VariantStyleForm
          value={draft.style_overrides ?? EMPTY_OVERRIDES}
          onChange={(v) => patchDraft({ style_overrides: v })}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || !draft.name_he?.trim()}
            onClick={onSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {he.adminSave}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
      {canPreview ? (
        <div className="flex w-full min-w-0 shrink-0 flex-col lg:max-w-[min(100%,520px)] lg:flex-1">
          <p className="mb-2 shrink-0 text-xs font-medium text-neutral-600">{he.adminLivePreview}</p>
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
  const [definitionModalOpen, setDefinitionModalOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setDef(definition);
  }, [definition]);

  useEffect(() => {
    setVariants(initialVariants);
  }, [initialVariants]);

  const canPreview =
    SECTION_KEYS.includes(def.key as SectionKey) || isLegacyNavHeroStatsKey(def.key);
  const previewContent = getDefaultContentForAdminPreview(def.key);
  const showAddVariantButton = variants.length >= 1 && !editingVariant;
  const variantEditorModalOpen = !!editingVariant;

  function openVariantEditor(draft: Partial<SectionVariantRow>) {
    setDefinitionModalOpen(false);
    setEditingVariant(draft);
  }

  function patchDraft(patch: Partial<SectionVariantRow>) {
    setEditingVariant((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function handleVariantEditorCancel() {
    setEditingVariant(null);
  }

  const variantCancelLabel = he.adminBackToVariantList;

  function openDefinitionModal() {
    setEditingVariant(null);
    setDefinitionModalOpen(true);
  }

  function handleSaveDef() {
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
        setDefinitionModalOpen(false);
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
        if (editingVariant?.id === id) {
          setEditingVariant(null);
        }
      }
    });
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        dir="rtl"
      >
        <h2 className="font-semibold">{he.adminSectionVariants}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openDefinitionModal}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            {he.adminEditSectionDetailsButton}
          </button>
          {showAddVariantButton ? (
            <button
              type="button"
              onClick={() => openVariantEditor(emptyVariantDraft(def.key, variants.length))}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
            >
              + {he.adminAddVariant}
            </button>
          ) : null}
        </div>
      </div>

      {msg ? (
        <p className="text-xs text-green-700" dir="rtl">
          {msg}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 sm:items-stretch">
        {variants.length === 0 ? (
          <div
            className="flex min-h-[min(420px,70vh)] flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 sm:min-h-[440px] sm:p-4"
            dir="rtl"
          >
            <div className="flex shrink-0 items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <span className="font-medium">{he.adminVariantOriginalDesign}</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  openVariantEditor({
                    ...emptyVariantDraft(def.key, 0),
                    name_he: he.adminVariantOriginalDesign,
                  })
                }
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 transition hover:bg-neutral-100"
                title={he.adminEditVariant}
                aria-label={he.adminEditVariant}
              >
                <PencilIcon />
              </button>
            </div>
            {canPreview ? (
              <div className="relative min-h-0 flex-1 basis-0">
                <AdminVariantPreview
                  sectionKey={def.key}
                  content={previewContent}
                  variantStyleOverrides={EMPTY_OVERRIDES}
                  previewId="admin-placeholder-original"
                  size="thumb"
                  fillContainer
                />
              </div>
            ) : null}
          </div>
        ) : (
          variants.map((v) => (
            <div
              key={v.id}
              className="flex min-h-[min(420px,70vh)] flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 sm:min-h-[440px] sm:p-4"
              dir="rtl"
            >
              <div className="flex shrink-0 items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{v.name_he}</span>
                    {v.is_default ? (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        {he.adminVariantDefault}
                      </span>
                    ) : null}
                    {!v.enabled ? (
                      <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] text-neutral-600">
                        {he.adminSectionDisabled}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openVariantEditor({ ...v })}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 transition hover:bg-neutral-100"
                    title={he.adminEditVariant}
                    aria-label={he.adminEditVariant}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleDeleteVariant(v.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    title={he.adminDeleteVariant}
                    aria-label={he.adminDeleteVariant}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
              {canPreview ? (
                <div className="relative min-h-0 flex-1 basis-0">
                  <AdminVariantPreview
                    sectionKey={def.key}
                    content={previewContent}
                    variantStyleOverrides={v.style_overrides ?? EMPTY_OVERRIDES}
                    previewId={`admin-row-${v.id}`}
                    size="thumb"
                    fillContainer
                  />
                </div>
              ) : null}
            </div>
          ))
        )}
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

      {definitionModalOpen ? (
        <Modal
          labelledBy="section-definition-editor-title"
          onRequestClose={() => setDefinitionModalOpen(false)}
          backdropAriaLabel={he.closeSettings}
          zClassName="z-[100]"
        >
          <ModalPanel maxWidthClassName="max-w-lg" dir="rtl">
            <ModalHeader
              titleId="section-definition-editor-title"
              title={he.adminSectionDetails}
              onClose={() => setDefinitionModalOpen(false)}
              closeAriaLabel={he.closeSettings}
              dense
            />
            <ModalBody className="space-y-4 p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-1">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-600">
                    {he.adminSectionTitle}
                  </label>
                  <input
                    type="text"
                    value={def.title_he}
                    onChange={(e) => setDef({ ...def, title_he: e.target.value })}
                    className="block w-full text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-600">
                    {he.adminSectionCategory}
                  </label>
                  <select
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-600">
                  {he.adminSectionDescription}
                </label>
                <textarea
                  value={def.description_he}
                  onChange={(e) => setDef({ ...def, description_he: e.target.value })}
                  rows={3}
                  className="block w-full text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={def.enabled}
                    onChange={(e) => setDef({ ...def, enabled: e.target.checked })}
                    className="rounded"
                  />
                  {he.adminSectionEnabled}
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-neutral-600">סדר:</label>
                  <input
                    type="number"
                    value={def.sort_order}
                    onChange={(e) =>
                      setDef({ ...def, sort_order: Number(e.target.value) })
                    }
                    className="w-16 text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={pending}
                onClick={handleSaveDef}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {he.adminSave}
              </button>
            </ModalBody>
          </ModalPanel>
        </Modal>
      ) : null}
    </div>
  );
}
