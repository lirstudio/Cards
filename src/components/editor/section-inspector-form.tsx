"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updateSectionContent } from "@/app/actions/pages";
import {
  FAQ_EDITOR_SECTION_KEYS,
  isChecklistSectionKey,
  isTestimonialsSectionKey,
  LEGACY_NAV_HERO_STATS_KEY,
  type SectionKey,
} from "@/lib/sections/schemas";
import { he } from "@/lib/i18n/he";
import {
  sectionContentFieldLabel,
  testimonialFieldLabel,
} from "@/lib/i18n/section-content-labels";
import { ImageUploadField } from "./image-upload-field";
import { HeaderNavLinksEditor } from "./header-nav-links-editor";
import type { PageNavSectionRow } from "@/lib/landing/page-nav";

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  e.target.select();

function linkRow(
  v: { label: string; href: string },
  onChange: (v: { label: string; href: string }) => void,
) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        className="min-w-0 flex-1 text-sm"
        value={v.label}
        onFocus={selectOnFocus}
        onChange={(e) => onChange({ ...v, label: e.target.value })}
        placeholder="טקסט"
      />
      <input
        dir="ltr"
        className="min-w-0 flex-1 text-sm"
        value={v.href}
        onFocus={selectOnFocus}
        onChange={(e) => onChange({ ...v, href: e.target.value })}
        placeholder="# או URL"
      />
    </div>
  );
}

export function SectionInspectorForm({
  pageId,
  sectionId,
  sectionKey,
  content,
  onSaved,
  onDraftChange,
  onAdd,
  embedded,
  deferPersistence = false,
  pageNavSections,
}: {
  pageId: string;
  sectionId?: string;
  sectionKey: SectionKey | typeof LEGACY_NAV_HERO_STATS_KEY;
  content: Record<string, unknown>;
  onSaved?: () => void;
  /** תצוגה מקדימה חיה: נקרא כשמשתנה הטיוטה המובנית. */
  onDraftChange?: (draft: Record<string, unknown>) => void;
  /** כשמוגדר: כפתור השמירה מוסיף סקשן חדש (ללא updateSectionContent). */
  onAdd?: (
    draft: Record<string, unknown>,
  ) => Promise<{ ok: boolean; error?: string }>;
  /** ללא מסגרת/כותרת עליונה — למודאל הוספה. */
  embedded?: boolean;
  /**
   * כשמופעל (עורך עמוד מלא): אין שמירה למסד מהטופס — רק טיוטה מקדימה;
   * השמירה מתבצעת בכפתור ״שמור שינויים״ בעמוד.
   */
  deferPersistence?: boolean;
  /** סקשני העמוד לעריכת קישורי תפריט (רק ל־site_header_nav). */
  pageNavSections?: PageNavSectionRow[];
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>(() => ({ ...content }));
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isMounted = useRef(false);

  useEffect(() => {
    // סנכרון בעת מעבר בין סקשנים בלבד — לא בכל עדכון תוכן מההורה (טיוטה חיה)
    setDraft({ ...content });
    // content מיועד לטעינה רק כשהסקשן משתנה; לא מסנכרנים מחדש מ-props בזמן הקלדה
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [sectionId]);

  useEffect(() => {
    // לא מפעילים onDraftChange בעת הרכבה ראשונה — מאפשר לתצוגה מקדימה להשתמש בתוכן ברירת המחדל
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    onDraftChange?.(draft);
  }, [draft, onDraftChange]);

  function saveStructured() {
    if (deferPersistence && !onAdd) return;
    startTransition(async () => {
      if (onAdd) {
        const r = await onAdd(draft);
        setMsg(r.ok ? he.sectionAddedToPage : r.error ?? "");
        return;
      }
      if (!sectionId) return;
      const r = await updateSectionContent(pageId, sectionId, sectionKey, draft);
      setMsg(r.ok ? he.contentSaved : r.error ?? "");
      if (r.ok) onSaved?.();
    });
  }

  const sk = sectionKey;

  const hiddenSet = new Set<string>((draft.__hidden as string[] | undefined) ?? []);
  const isHidden = (k: string) => hiddenSet.has(k);
  const hideField = (k: string) =>
    setDraft({ ...draft, __hidden: [...hiddenSet, k] });
  const restoreField = (k: string) =>
    setDraft({ ...draft, __hidden: [...hiddenSet].filter((x) => x !== k) });

  /** כותרת שדה עם כפתור הסתרה × */
  function fieldLabel(key: string, label: React.ReactNode) {
    return (
      <span className="flex items-center justify-between">
        <span className="text-[#a1a4a5]">{label}</span>
        <button
          type="button"
          title="הסתר שדה"
          className="ml-2 shrink-0 text-xs text-[#464a4d] hover:text-red-400"
          onClick={() => hideField(key)}
        >
          ×
        </button>
      </span>
    );
  }

  let body: React.ReactNode = null;

  if (sk === "site_header_nav") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("logoText") && (
          <label className="block">
            {fieldLabel("logoText", sectionContentFieldLabel("logoText"))}
            <textarea
              className="lc-textarea-compact mt-1 w-full text-sm"
              rows={1}
              value={String(d.logoText ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, logoText: e.target.value })}
            />
          </label>
        )}
        {!isHidden("headerCta") && (
          <div>
            {fieldLabel("headerCta", sectionContentFieldLabel("headerCta"))}
            {linkRow(
              (d.headerCta as { label: string; href: string }) ?? { label: "", href: "" },
              (v) => setDraft({ ...d, headerCta: v }),
            )}
          </div>
        )}
        {pageNavSections?.length ? (
          <HeaderNavLinksEditor pageNavSections={pageNavSections} draft={d} setDraft={setDraft} />
        ) : (
          <p className="rounded-lg bg-white/5 px-2.5 py-2 text-xs leading-relaxed text-[#a1a4a5] ring-1 ring-[rgba(214,235,253,0.19)]">
            {he.navLinksAutoHint}
          </p>
        )}
      </div>
    );
  } else if (sk === "hero_immersive_bg") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        <ImageUploadField
          pageId={pageId}
          label={sectionContentFieldLabel("backgroundImage")}
          value={String(d.backgroundImage ?? "")}
          onChange={(url) => setDraft({ ...d, backgroundImage: url })}
        />
        {["headline", "subheadline"].filter((k) => !isHidden(k)).map((k) => (
          <label key={k} className="block">
            {fieldLabel(k, k === "headline" ? "כותרת ראשית" : sectionContentFieldLabel(k))}
            <textarea
              className="mt-1 w-full text-sm"
              rows={3}
              value={String(d[k] ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, [k]: e.target.value })}
            />
          </label>
        ))}
        {!isHidden("heroCta") && (
          <div>
            {fieldLabel("heroCta", sectionContentFieldLabel("heroCta"))}
            {linkRow(
              (d.heroCta as { label: string; href: string }) ?? { label: "", href: "" },
              (v) => setDraft({ ...d, heroCta: v }),
            )}
          </div>
        )}
        {!isHidden("secondaryCta") && (
          <div>
            {fieldLabel("secondaryCta", sectionContentFieldLabel("secondaryCta"))}
            {linkRow(
              (d.secondaryCta as { label: string; href: string }) ?? { label: "", href: "" },
              (v) => setDraft({ ...d, secondaryCta: v }),
            )}
          </div>
        )}
      </div>
    );
  } else if (sk === "hero_editorial_split") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("eyebrow") && (
          <label className="block">
            {fieldLabel("eyebrow", sectionContentFieldLabel("eyebrow"))}
            <textarea
              className="lc-textarea-compact mt-1 w-full text-sm"
              rows={1}
              value={String(d.eyebrow ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, eyebrow: e.target.value })}
            />
          </label>
        )}
        {["headline", "subheadline"].filter((k) => !isHidden(k)).map((k) => (
          <label key={k} className="block">
            {fieldLabel(k, k === "headline" ? "כותרת ראשית" : sectionContentFieldLabel(k))}
            <textarea
              className="mt-1 w-full text-sm"
              rows={3}
              value={String(d[k] ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, [k]: e.target.value })}
            />
          </label>
        ))}
        <ImageUploadField
          pageId={pageId}
          label={sectionContentFieldLabel("heroImage")}
          value={String(d.heroImage ?? "")}
          onChange={(url) => setDraft({ ...d, heroImage: url })}
        />
        {!isHidden("heroCta") && (
          <div>
            {fieldLabel("heroCta", sectionContentFieldLabel("heroCta"))}
            {linkRow(
              (d.heroCta as { label: string; href: string }) ?? { label: "", href: "" },
              (v) => setDraft({ ...d, heroCta: v }),
            )}
          </div>
        )}
      </div>
    );
  } else if (sk === "hero_showcase_float") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("badge") && (
          <label className="block">
            {fieldLabel("badge", sectionContentFieldLabel("badge"))}
            <textarea
              className="lc-textarea-compact mt-1 w-full text-sm"
              rows={1}
              value={String(d.badge ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, badge: e.target.value })}
            />
          </label>
        )}
        {["headline", "subheadline"].filter((k) => !isHidden(k)).map((k) => (
          <label key={k} className="block">
            {fieldLabel(k, k === "headline" ? "כותרת ראשית" : sectionContentFieldLabel(k))}
            <textarea
              className="mt-1 w-full text-sm"
              rows={3}
              value={String(d[k] ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, [k]: e.target.value })}
            />
          </label>
        ))}
        <ImageUploadField
          pageId={pageId}
          label={sectionContentFieldLabel("heroImage")}
          value={String(d.heroImage ?? "")}
          onChange={(url) => setDraft({ ...d, heroImage: url })}
        />
        {!isHidden("heroCta") && (
          <div>
            {fieldLabel("heroCta", sectionContentFieldLabel("heroCta"))}
            {linkRow(
              (d.heroCta as { label: string; href: string }) ?? { label: "", href: "" },
              (v) => setDraft({ ...d, heroCta: v }),
            )}
          </div>
        )}
      </div>
    );
  } else if (sk === "hero_image_split" || sk === LEGACY_NAV_HERO_STATS_KEY) {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {["headline", "subheadline"].filter((k) => !isHidden(k)).map((k) => (
          <label key={k} className="block">
            {fieldLabel(k, k === "headline" ? "כותרת ראשית" : sectionContentFieldLabel(k))}
            <textarea
              className="mt-1 w-full text-sm"
              rows={3}
              value={String(d[k] ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, [k]: e.target.value })}
            />
          </label>
        ))}
        <ImageUploadField
          pageId={pageId}
          label={sectionContentFieldLabel("heroImage")}
          value={String(d.heroImage ?? "")}
          onChange={(url) => setDraft({ ...d, heroImage: url })}
        />
        <label className="flex cursor-pointer items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 rounded border-[rgba(214,235,253,0.19)]"
            checked={Boolean(d.heroBackdropCircle)}
            onChange={(e) => setDraft({ ...d, heroBackdropCircle: e.target.checked })}
          />
          {fieldLabel("heroBackdropCircle", sectionContentFieldLabel("heroBackdropCircle"))}
        </label>
        {!isHidden("heroCta") && (
          <div>
            {fieldLabel("heroCta", sectionContentFieldLabel("heroCta"))}
            {linkRow(
              (d.heroCta as { label: string; href: string }) ?? { label: "", href: "" },
              (v) => setDraft({ ...d, heroCta: v }),
            )}
          </div>
        )}
      </div>
    );
  } else if (sk === "stats_highlight_row") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        <div>
          <div className="mb-1">{fieldLabel("stats", sectionContentFieldLabel("stats"))}</div>
          {((d.stats as { value: string; label?: string }[]) ?? []).map((s, i) => (
            <div key={i} className="mb-2 flex flex-wrap items-end gap-2">
              <label className="block shrink-0">
                <span className="text-xs text-[#464a4d]">{sectionContentFieldLabel("value")}</span>
                <input
                  className="mt-0.5 w-24 text-sm"
                  value={s.value}
                  onFocus={selectOnFocus}
                  onChange={(e) => {
                    const arr = [...((d.stats as typeof s[]) ?? [])];
                    arr[i] = { ...s, value: e.target.value };
                    setDraft({ ...d, stats: arr });
                  }}
                />
              </label>
              <label className="block min-w-0 flex-1">
                <span className="text-xs text-[#464a4d]">{sectionContentFieldLabel("label")}</span>
                <input
                  className="mt-0.5 w-full text-sm"
                  value={s.label ?? ""}
                  placeholder="תווית (אופציונלי)"
                  onFocus={selectOnFocus}
                  onChange={(e) => {
                    const arr = [...((d.stats as typeof s[]) ?? [])];
                    arr[i] = { ...s, label: e.target.value };
                    setDraft({ ...d, stats: arr });
                  }}
                />
              </label>
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() =>
                  setDraft({ ...d, stats: ((d.stats as unknown[]) ?? []).filter((_, j) => j !== i) })
                }
              >
                הסר
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-xs text-[var(--lc-primary)]"
            onClick={() =>
              setDraft({ ...d, stats: [...((d.stats as { value: string; label?: string }[]) ?? []), { value: "0", label: "" }] })
            }
          >
            + מספר
          </button>
        </div>
      </div>
    );
  } else if (sk === "about_bio_qa" || sk === "split_three_qa_image") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        <ImageUploadField
          pageId={pageId}
          label={sectionContentFieldLabel("image")}
          value={String(d.image ?? "")}
          onChange={(url) => setDraft({ ...d, image: url })}
        />
        {((d.blocks as { title: string; body: string }[]) ?? []).map((b, i) => (
          <div key={i} className="lc-field-stack-item space-y-2">
            <label className="block">
              <span className="text-[#a1a4a5]">{sectionContentFieldLabel("title")}</span>
              <input
                className="mt-1 w-full font-semibold"
                value={b.title}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.blocks as typeof b[]) ?? [])];
                  arr[i] = { ...b, title: e.target.value };
                  setDraft({ ...d, blocks: arr });
                }}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-[#a1a4a5]">{sectionContentFieldLabel("body")}</span>
              <textarea
                className="mt-1 w-full text-sm"
                rows={3}
                value={b.body}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.blocks as typeof b[]) ?? [])];
                  arr[i] = { ...b, body: e.target.value };
                  setDraft({ ...d, blocks: arr });
                }}
              />
            </label>
            <button
              type="button"
              className="mt-1 text-xs text-red-600"
              onClick={() =>
                setDraft({ ...d, blocks: ((d.blocks as unknown[]) ?? []).filter((_, j) => j !== i) })
              }
            >
              הסר
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({ ...d, blocks: [...((d.blocks as { title: string; body: string }[]) ?? []), { title: "", body: "" }] })
          }
        >
          + בלוק
        </button>
      </div>
    );
  } else if (isTestimonialsSectionKey(sk)) {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {((d.items as Record<string, unknown>[]) ?? []).map((it, i) => (
          <div key={i} className="lc-field-stack-item space-y-1">
            {(["headline", "body", "authorName", "authorTitle"] as const).map((f) => (
              <label key={f} className="mb-1 block">
                <span className="text-[#a1a4a5]">{testimonialFieldLabel(f)}</span>
                <textarea
                  className="mt-0.5 w-full text-sm"
                  rows={f === "body" ? 2 : 1}
                  value={String(it[f] ?? "")}
                  onFocus={selectOnFocus}
                  onChange={(e) => {
                    const arr = [...((d.items as Record<string, unknown>[]) ?? [])];
                    arr[i] = { ...arr[i], [f]: e.target.value };
                    setDraft({ ...d, items: arr });
                  }}
                />
              </label>
            ))}
            <label className="mb-1 block">
              <span className="text-[#a1a4a5]">{testimonialFieldLabel("starRating")}</span>
              <select
                className="mt-0.5 w-full text-sm"
                value={String(
                  it.starRating === undefined || it.starRating === null ? 5 : Number(it.starRating),
                )}
                onChange={(e) => {
                  const arr = [...((d.items as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...arr[i], starRating: parseInt(e.target.value, 10) };
                  setDraft({ ...d, items: arr });
                }}
              >
                <option value={0}>ללא כוכבים</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} כוכבים
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-1">
              <span className="text-[#a1a4a5]">{testimonialFieldLabel("authorImage")}</span>
              <ImageUploadField
                pageId={pageId}
                label=""
                value={String(it.authorImage ?? "")}
                onChange={(url) => {
                  const arr = [...((d.items as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...arr[i], authorImage: url };
                  setDraft({ ...d, items: arr });
                }}
              />
            </div>
            <button
              type="button"
              className="mt-2 text-xs text-red-600"
              onClick={() =>
                setDraft({
                  ...d,
                  items: ((d.items as unknown[]) ?? []).filter((_, j) => j !== i),
                })
              }
            >
              הסר המלצה
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({
              ...d,
                items: [
                ...((d.items as Record<string, unknown>[]) ?? []),
                {
                  headline: "",
                  body: "",
                  authorName: "",
                  authorTitle: "",
                  authorImage: "",
                  starRating: 5,
                },
              ],
            })
          }
        >
          + המלצה
        </button>
      </div>
    );
  } else if (sk === "center_richtext_cta") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("title") && (
          <label className="block">
            {fieldLabel("title", sectionContentFieldLabel("title"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.title ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, title: e.target.value })}
            />
          </label>
        )}
        <div className="text-sm">{fieldLabel("paragraphs", sectionContentFieldLabel("paragraphs"))}</div>
        {((d.paragraphs as string[]) ?? []).map((p, i) => (
          <div key={i}>
            <label className="block">
              <span className="text-xs text-[#464a4d]">פסקה {i + 1}</span>
              <textarea
                className="mt-0.5 w-full text-sm"
                rows={2}
                value={p}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.paragraphs as string[]) ?? [])];
                  arr[i] = e.target.value;
                  setDraft({ ...d, paragraphs: arr });
                }}
              />
            </label>
            <button
              type="button"
              className="mt-0.5 text-xs text-red-600"
              onClick={() =>
                setDraft({ ...d, paragraphs: ((d.paragraphs as string[]) ?? []).filter((_, j) => j !== i) })
              }
            >
              הסר פסקה
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({ ...d, paragraphs: [...((d.paragraphs as string[]) ?? []), ""] })
          }
        >
          + פסקה
        </button>
        {!isHidden("cta") && (
          <div>
            {fieldLabel("cta", he.ctaLinkGroup)}
            {linkRow(
              (d.cta as { label: string; href: string }) ?? { label: "", href: "#" },
              (v) => setDraft({ ...d, cta: v }),
            )}
          </div>
        )}
      </div>
    );
  } else if (isChecklistSectionKey(sk)) {
    const d = draft as Record<string, unknown>;
    const checklistTextOnly = sk === "checklist_text_only";
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("title") && (
          <label className="block">
            {fieldLabel("title", sectionContentFieldLabel("title"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.title ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, title: e.target.value })}
            />
          </label>
        )}
        {checklistTextOnly ? (
          <p className="rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5 px-3 py-2 text-xs text-[#a1a4a5]">
            {he.checklistVariantHidesImageHint}
          </p>
        ) : (
          <ImageUploadField
            pageId={pageId}
            label={sectionContentFieldLabel("image")}
            value={String(d.image ?? "")}
            onChange={(url) => setDraft({ ...d, image: url })}
          />
        )}
        {((d.items as { title: string; description: string }[]) ?? []).map((it, i) => (
          <div key={i} className="lc-field-stack-item space-y-2">
            <label className="block">
              <span className="text-[#a1a4a5]">{sectionContentFieldLabel("title")}</span>
              <input
                className="mt-1 w-full font-medium"
                value={it.title}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.items as typeof it[]) ?? [])];
                  arr[i] = { ...it, title: e.target.value };
                  setDraft({ ...d, items: arr });
                }}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-[#a1a4a5]">{sectionContentFieldLabel("description")}</span>
              <textarea
                className="mt-1 w-full text-sm"
                rows={2}
                value={it.description}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.items as typeof it[]) ?? [])];
                  arr[i] = { ...it, description: e.target.value };
                  setDraft({ ...d, items: arr });
                }}
              />
            </label>
            <button
              type="button"
              className="mt-1 text-xs text-red-600"
              onClick={() =>
                setDraft({ ...d, items: ((d.items as unknown[]) ?? []).filter((_, j) => j !== i) })
              }
            >
              הסר
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({ ...d, items: [...((d.items as { title: string; description: string }[]) ?? []), { title: "", description: "" }] })
          }
        >
          + פריט
        </button>
      </div>
    );
  } else if (sk === "pricing_banner") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("headline") && (
          <label className="block">
            {fieldLabel("headline", sectionContentFieldLabel("headline"))}
            <textarea
              className="mt-1 w-full text-sm"
              rows={2}
              value={String(d.headline ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, headline: e.target.value })}
            />
          </label>
        )}
        {!isHidden("body") && (
          <label className="block">
            {fieldLabel("body", he.bodyTextLabel)}
            <textarea
              className="mt-1 w-full text-sm"
              rows={4}
              value={String(d.body ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, body: e.target.value })}
            />
          </label>
        )}
        {!isHidden("cta") && (
          <div>
            {fieldLabel("cta", he.ctaLinkGroup)}
            {linkRow(
              (d.cta as { label: string; href: string }) ?? { label: "", href: "#" },
              (v) => setDraft({ ...d, cta: v }),
            )}
          </div>
        )}
      </div>
    );
  } else if (sk === "services_grid") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("badge") && (
          <label className="block">
            {fieldLabel("badge", sectionContentFieldLabel("badge"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.badge ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, badge: e.target.value })}
            />
          </label>
        )}
        {!isHidden("title") && (
          <label className="block">
            {fieldLabel("title", sectionContentFieldLabel("title"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.title ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, title: e.target.value })}
            />
          </label>
        )}
        {((d.cards as Record<string, unknown>[]) ?? []).map((c, i) => (
          <div key={i} className="lc-field-stack-item space-y-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={Boolean(c.featured)}
                onChange={(e) => {
                  const arr = [...((d.cards as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...c, featured: e.target.checked };
                  setDraft({ ...d, cards: arr });
                }}
              />
              {sectionContentFieldLabel("featured")}
            </label>
            <label className="mt-2 block">
              <span className="text-[#a1a4a5]">{sectionContentFieldLabel("number")}</span>
              <input
                className="mt-1 w-full text-sm"
                value={String(c.number ?? "")}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.cards as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...c, number: e.target.value };
                  setDraft({ ...d, cards: arr });
                }}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-[#a1a4a5]">{sectionContentFieldLabel("title")}</span>
              <input
                className="mt-1 w-full font-medium"
                value={String(c.title ?? "")}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.cards as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...c, title: e.target.value };
                  setDraft({ ...d, cards: arr });
                }}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-[#a1a4a5]">{sectionContentFieldLabel("description")}</span>
              <textarea
                className="mt-1 w-full text-sm"
                rows={2}
                value={String(c.description ?? "")}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.cards as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...c, description: e.target.value };
                  setDraft({ ...d, cards: arr });
                }}
              />
            </label>
            <button
              type="button"
              className="mt-1 text-xs text-red-600"
              onClick={() =>
                setDraft({ ...d, cards: ((d.cards as unknown[]) ?? []).filter((_, j) => j !== i) })
              }
            >
              הסר כרטיס
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({ ...d, cards: [...((d.cards as Record<string, unknown>[]) ?? []), { title: "", description: "" }] })
          }
        >
          + כרטיס
        </button>
      </div>
    );
  } else if (sk === "gallery_row") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {((d.images as { src: string; alt?: string }[]) ?? []).map((im, i) => (
          <div key={i} className="lc-field-stack-item space-y-2">
            <ImageUploadField
              pageId={pageId}
              label={`תמונה ${i + 1}`}
              value={im.src}
              onChange={(url) => {
                const arr = [...((d.images as typeof im[]) ?? [])];
                arr[i] = { ...im, src: url };
                setDraft({ ...d, images: arr });
              }}
            />
            <input
              className="mt-2 w-full text-xs"
              placeholder={he.imageAltPlaceholder}
              value={im.alt ?? ""}
              onFocus={selectOnFocus}
              onChange={(e) => {
                const arr = [...((d.images as typeof im[]) ?? [])];
                arr[i] = { ...im, alt: e.target.value };
                setDraft({ ...d, images: arr });
              }}
            />
            <button
              type="button"
              className="mt-1 text-xs text-red-600"
              onClick={() =>
                setDraft({ ...d, images: ((d.images as unknown[]) ?? []).filter((_, j) => j !== i) })
              }
            >
              הסר תמונה
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({
              ...d,
              images: [...((d.images as { src: string; alt?: string }[]) ?? []), { src: "", alt: "" }],
            })
          }
        >
          + תמונה
        </button>
      </div>
    );
  } else if (sk === "gallery_grid_even" || sk === "gallery_spotlight" || sk === "gallery_bento") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("title") && (
          <label className="block">
            {fieldLabel("title", sectionContentFieldLabel("title"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.title ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, title: e.target.value })}
            />
          </label>
        )}
        {!isHidden("subtitle") && (
          <label className="block">
            {fieldLabel("subtitle", sectionContentFieldLabel("subtitle"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.subtitle ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, subtitle: e.target.value })}
            />
          </label>
        )}
        {((d.images as { src: string; alt?: string }[]) ?? []).map((im, i) => (
          <div key={i} className="lc-field-stack-item space-y-2">
            <ImageUploadField
              pageId={pageId}
              label={`תמונה ${i + 1}`}
              value={im.src}
              onChange={(url) => {
                const arr = [...((d.images as typeof im[]) ?? [])];
                arr[i] = { ...im, src: url };
                setDraft({ ...d, images: arr });
              }}
            />
            <input
              className="mt-2 w-full text-xs"
              placeholder={he.imageAltPlaceholder}
              value={im.alt ?? ""}
              onFocus={selectOnFocus}
              onChange={(e) => {
                const arr = [...((d.images as typeof im[]) ?? [])];
                arr[i] = { ...im, alt: e.target.value };
                setDraft({ ...d, images: arr });
              }}
            />
            <button
              type="button"
              className="mt-1 text-xs text-red-600"
              onClick={() =>
                setDraft({ ...d, images: ((d.images as unknown[]) ?? []).filter((_, j) => j !== i) })
              }
            >
              הסר תמונה
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({
              ...d,
              images: [...((d.images as { src: string; alt?: string }[]) ?? []), { src: "", alt: "" }],
            })
          }
        >
          + תמונה
        </button>
      </div>
    );
  } else if (sk === "how_it_works_blue") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("badge") && (
          <label className="block">
            {fieldLabel("badge", sectionContentFieldLabel("badge"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.badge ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, badge: e.target.value })}
            />
          </label>
        )}
        {!isHidden("title") && (
          <label className="block">
            {fieldLabel("title", sectionContentFieldLabel("title"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.title ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, title: e.target.value })}
            />
          </label>
        )}
        {!isHidden("intro") && (
          <label className="block">
            {fieldLabel("intro", sectionContentFieldLabel("intro"))}
            <textarea
              className="mt-1 w-full text-sm"
              rows={2}
              value={String(d.intro ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, intro: e.target.value })}
            />
          </label>
        )}
        {((d.steps as { title: string; body: string }[]) ?? []).map((st, i) => (
          <div key={i} className="lc-field-stack-item space-y-2">
            <div className="mb-2 text-xs font-medium text-[#a1a4a5]">שלב {i + 1}</div>
            <label className="block">
              <span className="text-xs text-[#464a4d]">{sectionContentFieldLabel("title")}</span>
              <input
                className="mt-0.5 w-full font-medium"
                value={st.title}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.steps as typeof st[]) ?? [])];
                  arr[i] = { ...st, title: e.target.value };
                  setDraft({ ...d, steps: arr });
                }}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-xs text-[#464a4d]">{sectionContentFieldLabel("body")}</span>
              <textarea
                className="mt-0.5 w-full text-sm"
                rows={3}
                value={st.body}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.steps as typeof st[]) ?? [])];
                  arr[i] = { ...st, body: e.target.value };
                  setDraft({ ...d, steps: arr });
                }}
              />
            </label>
            <button
              type="button"
              className="mt-1 text-xs text-red-600"
              onClick={() =>
                setDraft({ ...d, steps: ((d.steps as unknown[]) ?? []).filter((_, j) => j !== i) })
              }
            >
              הסר שלב
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({ ...d, steps: [...((d.steps as { title: string; body: string }[]) ?? []), { title: "", body: "" }] })
          }
        >
          + שלב
        </button>
      </div>
    );
  } else if ((FAQ_EDITOR_SECTION_KEYS as readonly string[]).includes(sk)) {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("badge") && (
          <label className="block">
            {fieldLabel("badge", sectionContentFieldLabel("badge"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.badge ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, badge: e.target.value })}
            />
          </label>
        )}
        {!isHidden("title") && (
          <label className="block">
            {fieldLabel("title", sectionContentFieldLabel("title"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.title ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, title: e.target.value })}
            />
          </label>
        )}
        {((d.items as { question: string; answer: string }[]) ?? []).map((it, i) => (
          <div key={i} className="lc-field-stack-item space-y-2">
            <label className="block">
              <span className="text-[#a1a4a5]">{sectionContentFieldLabel("question")}</span>
              <textarea
                className="mt-1 w-full font-medium"
                rows={2}
                value={it.question}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.items as typeof it[]) ?? [])];
                  arr[i] = { ...it, question: e.target.value };
                  setDraft({ ...d, items: arr });
                }}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-[#a1a4a5]">{sectionContentFieldLabel("answer")}</span>
              <textarea
                className="mt-1 w-full text-sm"
                rows={3}
                value={it.answer}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.items as typeof it[]) ?? [])];
                  arr[i] = { ...it, answer: e.target.value };
                  setDraft({ ...d, items: arr });
                }}
              />
            </label>
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() =>
                setDraft({
                  ...d,
                  items: ((d.items as typeof it[]) ?? []).filter((_, j) => j !== i),
                })
              }
            >
              הסר
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({
              ...d,
              items: [...((d.items as { question: string; answer: string }[]) ?? []), { question: "", answer: "" }],
            })
          }
        >
          + שאלה
        </button>
      </div>
    );
  } else if (sk === "contact_split_footer") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("badge") && (
          <label className="block">
            {fieldLabel("badge", sectionContentFieldLabel("badge"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.badge ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, badge: e.target.value })}
            />
          </label>
        )}
        {!isHidden("headline") && (
          <label className="block">
            {fieldLabel("headline", sectionContentFieldLabel("headline"))}
            <textarea
              className="mt-1 w-full text-sm"
              rows={2}
              value={String(d.headline ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, headline: e.target.value })}
            />
          </label>
        )}
        {!isHidden("email") && (
          <label className="block">
            {fieldLabel("email", sectionContentFieldLabel("email"))}
            <input
              dir="ltr"
              className="mt-1 w-full text-sm"
              value={String(d.email ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, email: e.target.value })}
            />
          </label>
        )}
        {!isHidden("phone") && (
          <label className="block">
            {fieldLabel("phone", sectionContentFieldLabel("phone"))}
            <input
              dir="ltr"
              className="mt-1 w-full text-sm"
              value={String(d.phone ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, phone: e.target.value })}
            />
          </label>
        )}
        {!isHidden("submitLabel") && (
          <label className="block">
            {fieldLabel("submitLabel", sectionContentFieldLabel("submitLabel"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.submitLabel ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, submitLabel: e.target.value })}
            />
          </label>
        )}
        {!isHidden("footerCredit") && (
          <label className="block">
            {fieldLabel("footerCredit", sectionContentFieldLabel("footerCredit"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.footerCredit ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, footerCredit: e.target.value })}
            />
          </label>
        )}
        {fieldLabel("social", sectionContentFieldLabel("social"))}
        {((d.social as { network: string; href: string }[]) ?? []).map((s, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2">
            <label className="block shrink-0">
              <span className="text-xs text-[#464a4d]">{sectionContentFieldLabel("network")}</span>
              <input
                className="mt-0.5 w-28 text-sm"
                value={s.network}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.social as typeof s[]) ?? [])];
                  arr[i] = { ...s, network: e.target.value };
                  setDraft({ ...d, social: arr });
                }}
              />
            </label>
            <label className="block min-w-0 flex-1">
              <span className="text-xs text-[#464a4d]">{sectionContentFieldLabel("href")}</span>
              <input
                dir="ltr"
                className="mt-0.5 w-full text-sm"
                value={s.href}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.social as typeof s[]) ?? [])];
                  arr[i] = { ...s, href: e.target.value };
                  setDraft({ ...d, social: arr });
                }}
              />
            </label>
          </div>
        ))}
        {fieldLabel("formFields", sectionContentFieldLabel("formFields"))}
        {((d.formFields as Record<string, unknown>[]) ?? []).map((f, i) => (
          <div key={i} className="lc-field-stack-item flex flex-wrap items-end gap-2 text-xs">
            <label className="flex min-w-[4.5rem] flex-col gap-0.5">
              <span className="text-[#a1a4a5]">{sectionContentFieldLabel("name")}</span>
              <input
                className="w-full text-xs"
                value={String(f.name ?? "")}
                placeholder={he.formFieldMachineName}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.formFields as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...f, name: e.target.value };
                  setDraft({ ...d, formFields: arr });
                }}
              />
            </label>
            <label className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[#a1a4a5]">{sectionContentFieldLabel("label")}</span>
              <input
                className="w-full text-xs"
                value={String(f.label ?? "")}
                placeholder="תווית"
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.formFields as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...f, label: e.target.value };
                  setDraft({ ...d, formFields: arr });
                }}
              />
            </label>
            <label className="flex shrink-0 flex-col gap-0.5">
              <span className="text-[#a1a4a5]">{sectionContentFieldLabel("type")}</span>
              <select
                className="min-w-[7rem] text-xs"
                value={String(f.type ?? "text")}
                onChange={(e) => {
                  const arr = [...((d.formFields as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...f, type: e.target.value };
                  setDraft({ ...d, formFields: arr });
                }}
              >
                <option value="text">{he.formFieldTypeText}</option>
                <option value="email">{he.formFieldTypeEmail}</option>
                <option value="tel">{he.formFieldTypeTel}</option>
                <option value="textarea">{he.formFieldTypeTextarea}</option>
              </select>
            </label>
          </div>
        ))}
      </div>
    );
  } else if (sk === "footer_minimal") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("brandText") && (
          <label className="block">
            {fieldLabel("brandText", sectionContentFieldLabel("brandText"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.brandText ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, brandText: e.target.value })}
            />
          </label>
        )}
        <p className="text-xs text-[#464a4d]">{he.siteLogoHint}</p>
        {fieldLabel("navLinks", sectionContentFieldLabel("navLinks"))}
        {((d.links as { label: string; href: string }[]) ?? []).map((l, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2">
            {linkRow(l, (v) => {
              const arr = [...((d.links as typeof l[]) ?? [])];
              arr[i] = v;
              setDraft({ ...d, links: arr });
            })}
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() =>
                setDraft({
                  ...d,
                  links: ((d.links as typeof l[]) ?? []).filter((_, j) => j !== i),
                })
              }
            >
              הסר
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({
              ...d,
              links: [...((d.links as { label: string; href: string }[]) ?? []), { label: "", href: "#" }],
            })
          }
        >
          + קישור
        </button>
        {!isHidden("copyright") && (
          <label className="block">
            {fieldLabel("copyright", sectionContentFieldLabel("copyright"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.copyright ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, copyright: e.target.value })}
            />
          </label>
        )}
      </div>
    );
  } else if (sk === "footer_columns") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("brandText") && (
          <label className="block">
            {fieldLabel("brandText", sectionContentFieldLabel("brandText"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.brandText ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, brandText: e.target.value })}
            />
          </label>
        )}
        {!isHidden("aboutTitle") && (
          <label className="block">
            {fieldLabel("aboutTitle", sectionContentFieldLabel("aboutTitle"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.aboutTitle ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, aboutTitle: e.target.value })}
            />
          </label>
        )}
        {!isHidden("aboutBody") && (
          <label className="block">
            {fieldLabel("aboutBody", sectionContentFieldLabel("aboutBody"))}
            <textarea
              className="mt-1 w-full text-sm"
              rows={3}
              value={String(d.aboutBody ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, aboutBody: e.target.value })}
            />
          </label>
        )}
        {!isHidden("linksTitle") && (
          <label className="block">
            {fieldLabel("linksTitle", sectionContentFieldLabel("linksTitle"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.linksTitle ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, linksTitle: e.target.value })}
            />
          </label>
        )}
        {fieldLabel("navLinks", sectionContentFieldLabel("navLinks"))}
        {((d.links as { label: string; href: string }[]) ?? []).map((l, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2">
            {linkRow(l, (v) => {
              const arr = [...((d.links as typeof l[]) ?? [])];
              arr[i] = v;
              setDraft({ ...d, links: arr });
            })}
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() =>
                setDraft({
                  ...d,
                  links: ((d.links as typeof l[]) ?? []).filter((_, j) => j !== i),
                })
              }
            >
              הסר
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({
              ...d,
              links: [...((d.links as { label: string; href: string }[]) ?? []), { label: "", href: "#" }],
            })
          }
        >
          + קישור
        </button>
        {!isHidden("contactTitle") && (
          <label className="block">
            {fieldLabel("contactTitle", sectionContentFieldLabel("contactTitle"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.contactTitle ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, contactTitle: e.target.value })}
            />
          </label>
        )}
        {!isHidden("email") && (
          <label className="block">
            {fieldLabel("email", sectionContentFieldLabel("email"))}
            <input
              dir="ltr"
              className="mt-1 w-full text-sm"
              value={String(d.email ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, email: e.target.value })}
            />
          </label>
        )}
        {!isHidden("phone") && (
          <label className="block">
            {fieldLabel("phone", sectionContentFieldLabel("phone"))}
            <input
              dir="ltr"
              className="mt-1 w-full text-sm"
              value={String(d.phone ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, phone: e.target.value })}
            />
          </label>
        )}
        {fieldLabel("social", sectionContentFieldLabel("social"))}
        {((d.social as { network: string; href: string }[]) ?? []).map((s, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2">
            <label className="block shrink-0">
              <span className="text-xs text-[#464a4d]">{sectionContentFieldLabel("network")}</span>
              <input
                className="mt-0.5 w-28 text-sm"
                value={s.network}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.social as typeof s[]) ?? [])];
                  arr[i] = { ...s, network: e.target.value };
                  setDraft({ ...d, social: arr });
                }}
              />
            </label>
            <label className="block min-w-0 flex-1">
              <span className="text-xs text-[#464a4d]">{sectionContentFieldLabel("href")}</span>
              <input
                dir="ltr"
                className="mt-0.5 w-full text-sm"
                value={s.href}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.social as typeof s[]) ?? [])];
                  arr[i] = { ...s, href: e.target.value };
                  setDraft({ ...d, social: arr });
                }}
              />
            </label>
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() =>
                setDraft({
                  ...d,
                  social: ((d.social as typeof s[]) ?? []).filter((_, j) => j !== i),
                })
              }
            >
              הסר
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({
              ...d,
              social: [...((d.social as { network: string; href: string }[]) ?? []), { network: "instagram", href: "" }],
            })
          }
        >
          + רשת
        </button>
        {!isHidden("bottomBar") && (
          <label className="block">
            {fieldLabel("bottomBar", sectionContentFieldLabel("bottomBar"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.bottomBar ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, bottomBar: e.target.value })}
            />
          </label>
        )}
      </div>
    );
  } else if (sk === "footer_newsletter") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {!isHidden("headline") && (
          <label className="block">
            {fieldLabel("headline", sectionContentFieldLabel("headline"))}
            <textarea
              className="mt-1 w-full text-sm"
              rows={2}
              value={String(d.headline ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, headline: e.target.value })}
            />
          </label>
        )}
        {!isHidden("subheadline") && (
          <label className="block">
            {fieldLabel("subheadline", sectionContentFieldLabel("subheadline"))}
            <textarea
              className="mt-1 w-full text-sm"
              rows={2}
              value={String(d.subheadline ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, subheadline: e.target.value })}
            />
          </label>
        )}
        {!isHidden("brandTagline") && (
          <label className="block">
            {fieldLabel("brandTagline", sectionContentFieldLabel("brandTagline"))}
            <textarea
              className="mt-1 w-full text-sm"
              rows={2}
              value={String(d.brandTagline ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, brandTagline: e.target.value })}
            />
          </label>
        )}
        {!isHidden("emailLabel") && (
          <label className="block">
            {fieldLabel("emailLabel", sectionContentFieldLabel("emailLabel"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.emailLabel ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, emailLabel: e.target.value })}
            />
          </label>
        )}
        {!isHidden("submitLabel") && (
          <label className="block">
            {fieldLabel("submitLabel", sectionContentFieldLabel("submitLabel"))}
            <input
              className="mt-1 w-full text-sm"
              value={String(d.submitLabel ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, submitLabel: e.target.value })}
            />
          </label>
        )}
        {!isHidden("privacyNote") && (
          <label className="block">
            {fieldLabel("privacyNote", sectionContentFieldLabel("privacyNote"))}
            <textarea
              className="mt-1 w-full text-sm"
              rows={2}
              value={String(d.privacyNote ?? "")}
              onFocus={selectOnFocus}
              onChange={(e) => setDraft({ ...d, privacyNote: e.target.value })}
            />
          </label>
        )}
        {fieldLabel("social", sectionContentFieldLabel("social"))}
        {((d.social as { network: string; href: string }[]) ?? []).map((s, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2">
            <label className="block shrink-0">
              <span className="text-xs text-[#464a4d]">{sectionContentFieldLabel("network")}</span>
              <input
                className="mt-0.5 w-28 text-sm"
                value={s.network}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.social as typeof s[]) ?? [])];
                  arr[i] = { ...s, network: e.target.value };
                  setDraft({ ...d, social: arr });
                }}
              />
            </label>
            <label className="block min-w-0 flex-1">
              <span className="text-xs text-[#464a4d]">{sectionContentFieldLabel("href")}</span>
              <input
                dir="ltr"
                className="mt-0.5 w-full text-sm"
                value={s.href}
                onFocus={selectOnFocus}
                onChange={(e) => {
                  const arr = [...((d.social as typeof s[]) ?? [])];
                  arr[i] = { ...s, href: e.target.value };
                  setDraft({ ...d, social: arr });
                }}
              />
            </label>
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() =>
                setDraft({
                  ...d,
                  social: ((d.social as typeof s[]) ?? []).filter((_, j) => j !== i),
                })
              }
            >
              הסר
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-[var(--lc-primary)]"
          onClick={() =>
            setDraft({
              ...d,
              social: [...((d.social as { network: string; href: string }[]) ?? []), { network: "instagram", href: "" }],
            })
          }
        >
          + רשת
        </button>
      </div>
    );
  }

  const restorePanel =
    hiddenSet.size > 0 ? (
      <div className="mt-3 rounded-lg border border-[rgba(214,235,253,0.12)] bg-white/[0.03] px-3 py-2">
        <p className="mb-1.5 text-xs text-[#464a4d]">שדות מוסתרים</p>
        <div className="flex flex-wrap gap-1.5">
          {[...hiddenSet].map((k) => (
            <button
              key={k}
              type="button"
              className="rounded-full border border-[rgba(214,235,253,0.19)] px-2 py-0.5 text-xs text-[#a1a4a5] hover:border-[var(--lc-primary)] hover:text-[var(--lc-primary)]"
              onClick={() => restoreField(k)}
            >
              + {sectionContentFieldLabel(k) ?? k}
            </button>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className={embedded ? "" : "rounded-2xl bg-white/5 p-4 shadow-[0_0_0_1px_rgba(176,199,217,0.145)]"}>
      {!embedded ? (
        <>
          <h3 className="font-semibold">{he.sectionInspector}</h3>
          <p className="text-xs text-[#464a4d]">{sectionKey}</p>
        </>
      ) : null}
      <div className={embedded ? "" : "mt-4"}>{body}</div>
      {restorePanel}
      {deferPersistence && !onAdd ? null : (
        <button
          type="button"
          disabled={pending}
          className="mt-4 w-full rounded-full bg-[var(--lc-primary)] py-2 text-sm text-white disabled:opacity-50"
          onClick={saveStructured}
        >
          {onAdd ? he.addSectionConfirm : he.save}
        </button>
      )}
      {msg ? <p className="mt-2 text-xs text-[#a1a4a5]">{msg}</p> : null}
    </div>
  );
}
