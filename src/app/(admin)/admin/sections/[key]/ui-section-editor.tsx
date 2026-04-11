"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { upsertSectionDefinition } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
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
  SectionCategoryRow,
  SectionStyleOverrides,
} from "@/types/admin";

const EMPTY_OVERRIDES: SectionStyleOverrides = {};

function themeFromOverrides(vo: SectionStyleOverrides) {
  return {
    primary: vo.accentColor ?? "#3b9eff",
    background: "#000000",
    heading: vo.textColor ?? "#f0f0f0",
    body: "#a1a4a5",
  };
}

function AdminSectionStylePreview({
  sectionKey,
  content,
  styleOverrides,
  previewId,
}: {
  sectionKey: string;
  content: Record<string, unknown>;
  styleOverrides: SectionStyleOverrides;
  previewId: string;
}) {
  const vo = styleOverrides ?? EMPTY_OVERRIDES;
  const denseInThumb =
    sectionKey === "hero_image_split" ||
    sectionKey === "hero_editorial_split" ||
    sectionKey === "hero_immersive_bg" ||
    sectionKey === "hero_showcase_float" ||
    isLegacyNavHeroStatsKey(sectionKey) ||
    sectionKey === "site_header_nav" ||
    sectionKey === "stats_highlight_row";
  return (
    <div
      className="relative min-h-[min(52vh,600px)] w-full overflow-hidden rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5"
      title={he.adminVariantPreviewTitle}
    >
      <ScaledSectionPreviewLayer scale={0.72}>
        <SectionRenderer
          sectionKey={sectionKey}
          content={content}
          visible
          theme={themeFromOverrides(vo)}
          landingPageId="admin-section-preview"
          sectionId={previewId}
          editorPreview
          embedded={denseInThumb}
          libraryPreviewMotion
          variantStyleOverrides={vo}
        />
      </ScaledSectionPreviewLayer>
    </div>
  );
}

function DefinitionStyleForm({
  value,
  onChange,
}: {
  value: SectionStyleOverrides;
  onChange: (v: SectionStyleOverrides) => void;
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

export function SectionEditor({
  definition,
  categories,
}: {
  definition: SectionDefinitionRow;
  categories: SectionCategoryRow[];
}) {
  const [def, setDef] = useState<SectionDefinitionRow>(() => ({
    ...definition,
    style_overrides: definition.style_overrides ?? {},
  }));
  const [msg, setMsg] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setDef({
      ...definition,
      style_overrides: definition.style_overrides ?? {},
    });
  }, [definition]);

  const canPreview =
    SECTION_KEYS.includes(def.key as SectionKey) || isLegacyNavHeroStatsKey(def.key);
  const previewContent = getDefaultContentForAdminPreview(def.key);

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
        style_overrides: def.style_overrides ?? {},
      });
      if (res.ok) {
        setMsg(he.adminSaved);
        router.refresh();
      } else {
        setMsg(res.error ?? he.adminError);
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 p-5">
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

      <section className="space-y-3 border-b border-[rgba(214,235,253,0.19)] pb-5" dir="rtl">
        <h3 className="text-sm font-semibold text-[#f0f0f0]">{he.adminVariantStyle}</h3>
        <DefinitionStyleForm
          value={def.style_overrides ?? {}}
          onChange={(style_overrides) => setDef({ ...def, style_overrides })}
        />
      </section>

      {msg ? (
        <p className="text-xs text-[#11ff99]" dir="rtl">
          {msg}
        </p>
      ) : null}

      {canPreview ? (
        <section className="space-y-2" dir="rtl">
          <h3 className="text-sm font-semibold text-[#a1a4a5]">{he.adminVariantPreviewTitle}</h3>
          <AdminSectionStylePreview
            sectionKey={def.key}
            content={previewContent}
            styleOverrides={def.style_overrides ?? {}}
            previewId={`admin-def-${def.key}`}
          />
        </section>
      ) : null}
    </div>
  );
}
