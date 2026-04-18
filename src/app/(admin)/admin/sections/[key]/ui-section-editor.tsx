"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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

// ── Segment control ──────────────────────────────────────────────────────────

function SegmentControl({
  value,
  onChange,
  options,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-[rgba(214,235,253,0.19)]" dir="rtl">
      {options.map((opt, idx) => {
        const isActive = opt.value === "" ? !value : value === opt.value;
        return (
          <button
            key={opt.value || `__default_${idx}`}
            type="button"
            onClick={() => onChange(opt.value === "" ? undefined : opt.value)}
            className={[
              "flex-1 px-2 py-1.5 text-xs transition-colors",
              idx < options.length - 1 ? "border-l border-[rgba(214,235,253,0.19)]" : "",
              isActive
                ? "bg-white/10 text-[#f0f0f0]"
                : "text-[#464a4d] hover:text-[#a1a4a5]",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Color field ──────────────────────────────────────────────────────────────

function ColorField({
  label,
  value,
  defaultColor,
  placeholder,
  onChange,
}: {
  label: string;
  value: string | undefined;
  defaultColor: string;
  placeholder: string;
  onChange: (v: string | undefined) => void;
}) {
  const displayColor = value || defaultColor;
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-[#a1a4a5]">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-md border border-[rgba(214,235,253,0.25)]">
          <span
            className="absolute inset-0"
            style={{ background: displayColor }}
          />
          <input
            type="color"
            value={displayColor}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            title={label}
          />
        </div>
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={placeholder}
          dir="ltr"
          className="flex-1 rounded-lg border border-[rgba(214,235,253,0.19)] bg-transparent px-2.5 py-1.5 text-xs text-[#f0f0f0] outline-none transition focus:border-[var(--lc-primary)]"
          style={{ borderLeftColor: displayColor, borderLeftWidth: 3 }}
        />
      </div>
    </div>
  );
}

// ── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-[#f0f0f0]">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-[var(--lc-primary)]" : "bg-white/15",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
      {label}
    </label>
  );
}

// ── Section style preview ────────────────────────────────────────────────────

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

// ── Design settings form ─────────────────────────────────────────────────────

function DefinitionStyleForm({
  value,
  onChange,
  sectionKey,
}: {
  value: SectionStyleOverrides;
  onChange: (v: SectionStyleOverrides) => void;
  sectionKey: string;
}) {
  const showMarqueeAnimation = sectionKey === "testimonials_marquee" || sectionKey === "gallery_row";
  return (
    <div className="space-y-4">
      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <ColorField
          label={he.adminStyleText}
          value={value.textColor}
          defaultColor="#f0f0f0"
          placeholder="#f0f0f0"
          onChange={(v) => onChange({ ...value, textColor: v })}
        />
        <ColorField
          label={he.adminStyleAccent}
          value={value.accentColor}
          defaultColor="#3b9eff"
          placeholder="#3b9eff"
          onChange={(v) => onChange({ ...value, accentColor: v })}
        />
      </div>

      {/* Padding */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-[#a1a4a5]">{he.adminStylePadding}</label>
        <SegmentControl
          value={value.paddingY}
          onChange={(v) => onChange({ ...value, paddingY: v as SectionStyleOverrides["paddingY"] })}
          options={[
            { value: "", label: "מחדל" },
            { value: "sm", label: "קטן" },
            { value: "md", label: "בינוני" },
            { value: "lg", label: "גדול" },
            { value: "xl", label: "XL" },
          ]}
        />
      </div>

      {/* Border radius */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-[#a1a4a5]">{he.adminStyleRadius}</label>
        <SegmentControl
          value={value.borderRadius}
          onChange={(v) => onChange({ ...value, borderRadius: v as SectionStyleOverrides["borderRadius"] })}
          options={[
            { value: "", label: "מחדל" },
            { value: "none", label: "ללא" },
            { value: "sm", label: "קטן" },
            { value: "md", label: "בינוני" },
            { value: "lg", label: "גדול" },
          ]}
        />
      </div>

      {/* Direction */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-[#a1a4a5]">{he.adminStyleDirection}</label>
        <SegmentControl
          value={value.layoutDirection}
          onChange={(v) => onChange({ ...value, layoutDirection: v as SectionStyleOverrides["layoutDirection"] })}
          options={[
            { value: "", label: "ברירת מחדל" },
            { value: "rtl", label: "← ימין לשמאל" },
            { value: "ltr", label: "שמאל לימין →" },
          ]}
        />
      </div>

      {showMarqueeAnimation ? (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#a1a4a5]">{he.adminMarqueeAnimationDirection}</label>
          <SegmentControl
            value={value.marqueeAnimationDirection === "reverse" ? "reverse" : ""}
            onChange={(v) =>
              onChange({
                ...value,
                marqueeAnimationDirection: v as SectionStyleOverrides["marqueeAnimationDirection"],
              })
            }
            options={[
              { value: "", label: he.adminMarqueeAnimationDefault },
              { value: "reverse", label: he.adminMarqueeAnimationReverse },
            ]}
          />
        </div>
      ) : null}

      {/* Image/text layout */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-[#a1a4a5]">{he.adminImageTextLayout}</label>
        <SegmentControl
          value={value.imageTextLayout}
          onChange={(v) => onChange({ ...value, imageTextLayout: v as SectionStyleOverrides["imageTextLayout"] })}
          options={[
            { value: "", label: "לצד" },
            { value: "stack_text_above", label: "טקסט מעל" },
            { value: "stack_image_above", label: "תמונה מעל" },
          ]}
        />
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

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
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "warn" | "error">("success");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const saveRef = useRef<() => void>(() => {});

  // Sync when definition prop changes (e.g. router navigation), but don't mark dirty.
  // Intentionally NOT clearing msg here — messages should persist until the next user edit.
  useEffect(() => {
    setDef({ ...definition, style_overrides: definition.style_overrides ?? {} });
    setDirty(false);
  }, [definition]);

  function updateDef(patch: Partial<SectionDefinitionRow>) {
    setDef((prev) => ({ ...prev, ...patch }));
    setDirty(true);
    setMsg("");
  }

  const canPreview =
    SECTION_KEYS.includes(def.key as SectionKey) || isLegacyNavHeroStatsKey(def.key);
  const previewContent = getDefaultContentForAdminPreview(def.key);

  function handleSaveDefinition() {
    if (pending) return;
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
        setMsgType("success");
        setDirty(false);
        router.refresh();
      } else if (res.error?.startsWith("נשמר")) {
        setMsg("הנתונים נשמרו, אך הגדרות עיצוב לא נשמרו (עמודה חסרה במסד). הרץ מיגרציה.");
        setMsgType("warn");
        setDirty(false);
        router.refresh();
      } else {
        setMsg(res.error ?? he.adminError);
        setMsgType("error");
      }
    });
  }

  // Keep a stable ref for the keyboard handler so we don't need to re-register it
  saveRef.current = handleSaveDefinition;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function handleCopyKey() {
    void navigator.clipboard.writeText(def.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4" dir="rtl">

      {/* Unsaved-changes banner */}
      {dirty && (
        <div className="flex items-center gap-2 rounded-lg border border-[rgba(255,180,0,0.25)] bg-[rgba(255,180,0,0.06)] px-3 py-2 text-xs text-[#ffb400]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffb400]" />
          יש שינויים שלא נשמרו
        </div>
      )}

      {/* ── Two cards side by side ───────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Metadata card */}
        <div className="space-y-4 rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-[#f0f0f0]">{he.adminSectionDetails}</h2>

          {/* Display name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#a1a4a5]" htmlFor="section-display-name">
              {he.adminSectionDisplayName}
            </label>
            <input
              id="section-display-name"
              type="text"
              value={def.title_he}
              onChange={(e) => updateDef({ title_he: e.target.value })}
              className="block w-full text-base font-semibold text-[#f0f0f0]"
            />
            <p className="text-[11px] leading-relaxed text-[#464a4d]">
              {he.adminSectionDisplayNameHint}
            </p>
          </div>

          {/* Category + sort order */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#a1a4a5]" htmlFor="section-category">
                {he.adminSectionCategory}
              </label>
              <select
                id="section-category"
                value={def.category_slug}
                onChange={(e) => updateDef({ category_slug: e.target.value })}
                className="block w-full text-sm"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name_he}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#a1a4a5]" htmlFor="section-sort">
                {he.adminSectionSortOrder}
              </label>
              <input
                id="section-sort"
                type="number"
                value={def.sort_order}
                onChange={(e) => updateDef({ sort_order: Number(e.target.value) })}
                className="block w-full text-sm sm:max-w-[8rem]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#a1a4a5]" htmlFor="section-description">
              {he.adminSectionDescription}
            </label>
            <textarea
              id="section-description"
              value={def.description_he}
              onChange={(e) => updateDef({ description_he: e.target.value })}
              rows={3}
              className="block w-full text-sm"
            />
          </div>

          {/* Enabled toggle */}
          <Toggle
            checked={def.enabled}
            onChange={(v) => updateDef({ enabled: v })}
            label={he.adminSectionEnabled}
          />

          {/* Section key + copy */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#464a4d]">
            <span>{he.adminSectionKey}</span>
            <code
              className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-[#a1a4a5]"
              dir="ltr"
            >
              {def.key}
            </code>
            <button
              type="button"
              onClick={handleCopyKey}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] transition hover:text-[#a1a4a5]"
              title="העתק מזהה"
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="#11ff99"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[#11ff99]">הועתק</span>
                </>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path
                    d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Design settings card */}
        <div className="space-y-4 rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 p-5">
          <h3 className="text-sm font-semibold text-[#f0f0f0]">{he.adminVariantStyle}</h3>
          <DefinitionStyleForm
            sectionKey={def.key}
            value={def.style_overrides ?? {}}
            onChange={(style_overrides) => updateDef({ style_overrides })}
          />
        </div>

      </div>{/* end two-card grid */}

      {/* Save button + inline feedback */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending || !def.title_he.trim()}
          onClick={handleSaveDefinition}
          className="relative flex items-center gap-2 rounded-lg bg-[var(--lc-primary)] px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {he.adminSave}
          {dirty && !pending && (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ffb400]"
            />
          )}
        </button>
        {msg && (
          <span className={`text-xs ${
              msgType === "error" ? "text-red-400" :
              msgType === "warn" ? "text-[#ffb400]" :
              "text-[#11ff99]"
            }`}>
              {msg}
            </span>
        )}
      </div>

      {/* ── Preview — full width below ───────────────────────── */}
      {canPreview && (
        <div>
          <p className="mb-2 text-xs font-medium text-[#a1a4a5]">
            {he.adminVariantPreviewTitle}
          </p>
          <AdminSectionStylePreview
            sectionKey={def.key}
            content={previewContent}
            styleOverrides={def.style_overrides ?? {}}
            previewId={`admin-def-${def.key}`}
          />
        </div>
      )}
    </div>
  );
}
