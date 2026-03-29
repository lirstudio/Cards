"use client";

import { useEffect, useState, useTransition } from "react";
import { updateSectionContent } from "@/app/actions/pages";
import {
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
import type { SectionStyleOverrides } from "@/types/admin";

function linkRow(
  v: { label: string; href: string },
  onChange: (v: { label: string; href: string }) => void,
) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        className="min-w-0 flex-1 text-sm"
        value={v.label}
        onChange={(e) => onChange({ ...v, label: e.target.value })}
        placeholder="טקסט"
      />
      <input
        dir="ltr"
        className="min-w-0 flex-1 text-sm"
        value={v.href}
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
  variantStyleOverrides,
}: {
  pageId: string;
  sectionId?: string;
  sectionKey: SectionKey | typeof LEGACY_NAV_HERO_STATS_KEY;
  content: Record<string, unknown>;
  /** עיצוב נבחר בעמוד — משפיע על סקשן רשימה (הסתרת שדה תמונה ב״רשימה בלבד״). */
  variantStyleOverrides?: SectionStyleOverrides;
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

  useEffect(() => {
    // סנכרון בעת מעבר בין סקשנים בלבד — לא בכל עדכון תוכן מההורה (טיוטה חיה)
    setDraft({ ...content });
    // content מיועד לטעינה רק כשהסקשן משתנה; לא מסנכרנים מחדש מ-props בזמן הקלדה
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [sectionId]);

  useEffect(() => {
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
  let body: React.ReactNode = null;

  if (sk === "site_header_nav") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("logoText")}</span>
          <textarea
            className="lc-textarea-compact mt-1 w-full text-sm"
            rows={1}
            value={String(d.logoText ?? "")}
            onChange={(e) => setDraft({ ...d, logoText: e.target.value })}
          />
        </label>
        <div>
          <div className="text-neutral-600">{sectionContentFieldLabel("headerCta")}</div>
          {linkRow(
            (d.headerCta as { label: string; href: string }) ?? { label: "", href: "" },
            (v) => setDraft({ ...d, headerCta: v }),
          )}
        </div>
        {pageNavSections?.length ? (
          <HeaderNavLinksEditor pageNavSections={pageNavSections} draft={d} setDraft={setDraft} />
        ) : (
          <p className="rounded-lg bg-neutral-50 px-2.5 py-2 text-xs leading-relaxed text-neutral-600 ring-1 ring-neutral-200/80">
            {he.navLinksAutoHint}
          </p>
        )}
      </div>
    );
  } else if (sk === "hero_image_split" || sk === LEGACY_NAV_HERO_STATS_KEY) {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {["headline", "subheadline"].map((k) => (
          <label key={k} className="block">
            <span className="text-neutral-600">
              {k === "headline" ? "כותרת ראשית" : sectionContentFieldLabel(k)}
            </span>
            <textarea
              className="mt-1 w-full text-sm"
              rows={3}
              value={String(d[k] ?? "")}
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
            className="mt-0.5 size-4 shrink-0 rounded border-neutral-300"
            checked={Boolean(d.heroBackdropCircle)}
            onChange={(e) => setDraft({ ...d, heroBackdropCircle: e.target.checked })}
          />
          <span className="text-neutral-700">{sectionContentFieldLabel("heroBackdropCircle")}</span>
        </label>
        <div>
          <div className="text-neutral-600">{sectionContentFieldLabel("heroCta")}</div>
          {linkRow(
            (d.heroCta as { label: string; href: string }) ?? { label: "", href: "" },
            (v) => setDraft({ ...d, heroCta: v }),
          )}
        </div>
      </div>
    );
  } else if (sk === "stats_highlight_row") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        <div>
          <div className="mb-1 text-neutral-600">{sectionContentFieldLabel("stats")}</div>
          {((d.stats as { value: string; label?: string }[]) ?? []).map((s, i) => (
            <div key={i} className="mb-2 flex flex-wrap items-end gap-2">
              <label className="block shrink-0">
                <span className="text-xs text-neutral-500">{sectionContentFieldLabel("value")}</span>
                <input
                  className="mt-0.5 w-24 text-sm"
                  value={s.value}
                  onChange={(e) => {
                    const arr = [...((d.stats as typeof s[]) ?? [])];
                    arr[i] = { ...s, value: e.target.value };
                    setDraft({ ...d, stats: arr });
                  }}
                />
              </label>
              <label className="block min-w-0 flex-1">
                <span className="text-xs text-neutral-500">{sectionContentFieldLabel("label")}</span>
                <input
                  className="mt-0.5 w-full text-sm"
                  value={s.label ?? ""}
                  placeholder="תווית (אופציונלי)"
                  onChange={(e) => {
                    const arr = [...((d.stats as typeof s[]) ?? [])];
                    arr[i] = { ...s, label: e.target.value };
                    setDraft({ ...d, stats: arr });
                  }}
                />
              </label>
            </div>
          ))}
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
              <span className="text-neutral-600">{sectionContentFieldLabel("title")}</span>
              <input
                className="mt-1 w-full font-semibold"
                value={b.title}
                onChange={(e) => {
                  const arr = [...((d.blocks as typeof b[]) ?? [])];
                  arr[i] = { ...b, title: e.target.value };
                  setDraft({ ...d, blocks: arr });
                }}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-neutral-600">{sectionContentFieldLabel("body")}</span>
              <textarea
                className="mt-1 w-full text-sm"
                rows={3}
                value={b.body}
                onChange={(e) => {
                  const arr = [...((d.blocks as typeof b[]) ?? [])];
                  arr[i] = { ...b, body: e.target.value };
                  setDraft({ ...d, blocks: arr });
                }}
              />
            </label>
          </div>
        ))}
      </div>
    );
  } else if (sk === "testimonials_row") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        {((d.items as Record<string, unknown>[]) ?? []).map((it, i) => (
          <div key={i} className="lc-field-stack-item space-y-1">
            {(["headline", "body", "authorName", "authorTitle"] as const).map((f) => (
              <label key={f} className="mb-1 block">
                <span className="text-neutral-600">{testimonialFieldLabel(f)}</span>
                <textarea
                  className="mt-0.5 w-full text-sm"
                  rows={f === "body" ? 2 : 1}
                  value={String(it[f] ?? "")}
                  onChange={(e) => {
                    const arr = [...((d.items as Record<string, unknown>[]) ?? [])];
                    arr[i] = { ...arr[i], [f]: e.target.value };
                    setDraft({ ...d, items: arr });
                  }}
                />
              </label>
            ))}
            <label className="mb-1 block">
              <span className="text-neutral-600">{testimonialFieldLabel("starRating")}</span>
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
              <span className="text-neutral-600">{testimonialFieldLabel("authorImage")}</span>
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
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("title")}</span>
          <input
            className="mt-1 w-full text-sm"
            value={String(d.title ?? "")}
            onChange={(e) => setDraft({ ...d, title: e.target.value })}
          />
        </label>
        <div className="text-sm text-neutral-600">{sectionContentFieldLabel("paragraphs")}</div>
        {((d.paragraphs as string[]) ?? []).map((p, i) => (
          <label key={i} className="block">
            <span className="text-xs text-neutral-500">פסקה {i + 1}</span>
            <textarea
              className="mt-0.5 w-full text-sm"
              rows={2}
              value={p}
              onChange={(e) => {
                const arr = [...((d.paragraphs as string[]) ?? [])];
                arr[i] = e.target.value;
                setDraft({ ...d, paragraphs: arr });
              }}
            />
          </label>
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
        <div>
          <div className="mb-1 text-neutral-600">{he.ctaLinkGroup}</div>
          {linkRow(
            (d.cta as { label: string; href: string }) ?? { label: "", href: "#" },
            (v) => setDraft({ ...d, cta: v }),
          )}
        </div>
      </div>
    );
  } else if (sk === "checklist_with_image") {
    const d = draft as Record<string, unknown>;
    const checklistTextOnly =
      (variantStyleOverrides?.checklistLayout ?? "with_image") === "text_only";
    body = (
      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("title")}</span>
          <input
            className="mt-1 w-full text-sm"
            value={String(d.title ?? "")}
            onChange={(e) => setDraft({ ...d, title: e.target.value })}
          />
        </label>
        {checklistTextOnly ? (
          <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
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
              <span className="text-neutral-600">{sectionContentFieldLabel("title")}</span>
              <input
                className="mt-1 w-full font-medium"
                value={it.title}
                onChange={(e) => {
                  const arr = [...((d.items as typeof it[]) ?? [])];
                  arr[i] = { ...it, title: e.target.value };
                  setDraft({ ...d, items: arr });
                }}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-neutral-600">{sectionContentFieldLabel("description")}</span>
              <textarea
                className="mt-1 w-full text-sm"
                rows={2}
                value={it.description}
                onChange={(e) => {
                  const arr = [...((d.items as typeof it[]) ?? [])];
                  arr[i] = { ...it, description: e.target.value };
                  setDraft({ ...d, items: arr });
                }}
              />
            </label>
          </div>
        ))}
      </div>
    );
  } else if (sk === "pricing_banner") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("headline")}</span>
          <textarea
            className="mt-1 w-full text-sm"
            rows={2}
            value={String(d.headline ?? "")}
            onChange={(e) => setDraft({ ...d, headline: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-neutral-600">{he.bodyTextLabel}</span>
          <textarea
            className="mt-1 w-full text-sm"
            rows={4}
            value={String(d.body ?? "")}
            onChange={(e) => setDraft({ ...d, body: e.target.value })}
          />
        </label>
        <div>
          <div className="mb-1 text-neutral-600">{he.ctaLinkGroup}</div>
          {linkRow(
            (d.cta as { label: string; href: string }) ?? { label: "", href: "#" },
            (v) => setDraft({ ...d, cta: v }),
          )}
        </div>
      </div>
    );
  } else if (sk === "services_grid") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("badge")}</span>
          <input
            className="mt-1 w-full text-sm"
            value={String(d.badge ?? "")}
            onChange={(e) => setDraft({ ...d, badge: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("title")}</span>
          <input
            className="mt-1 w-full text-sm"
            value={String(d.title ?? "")}
            onChange={(e) => setDraft({ ...d, title: e.target.value })}
          />
        </label>
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
              <span className="text-neutral-600">{sectionContentFieldLabel("number")}</span>
              <input
                className="mt-1 w-full text-sm"
                value={String(c.number ?? "")}
                onChange={(e) => {
                  const arr = [...((d.cards as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...c, number: e.target.value };
                  setDraft({ ...d, cards: arr });
                }}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-neutral-600">{sectionContentFieldLabel("title")}</span>
              <input
                className="mt-1 w-full font-medium"
                value={String(c.title ?? "")}
                onChange={(e) => {
                  const arr = [...((d.cards as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...c, title: e.target.value };
                  setDraft({ ...d, cards: arr });
                }}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-neutral-600">{sectionContentFieldLabel("description")}</span>
              <textarea
                className="mt-1 w-full text-sm"
                rows={2}
                value={String(c.description ?? "")}
                onChange={(e) => {
                  const arr = [...((d.cards as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...c, description: e.target.value };
                  setDraft({ ...d, cards: arr });
                }}
              />
            </label>
          </div>
        ))}
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
              onChange={(e) => {
                const arr = [...((d.images as typeof im[]) ?? [])];
                arr[i] = { ...im, alt: e.target.value };
                setDraft({ ...d, images: arr });
              }}
            />
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
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("badge")}</span>
          <input
            className="mt-1 w-full text-sm"
            value={String(d.badge ?? "")}
            onChange={(e) => setDraft({ ...d, badge: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("title")}</span>
          <input
            className="mt-1 w-full text-sm"
            value={String(d.title ?? "")}
            onChange={(e) => setDraft({ ...d, title: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("intro")}</span>
          <textarea
            className="mt-1 w-full text-sm"
            rows={2}
            value={String(d.intro ?? "")}
            onChange={(e) => setDraft({ ...d, intro: e.target.value })}
          />
        </label>
        {((d.steps as { title: string; body: string }[]) ?? []).map((st, i) => (
          <div key={i} className="lc-field-stack-item space-y-2">
            <div className="mb-2 text-xs font-medium text-neutral-600">שלב {i + 1}</div>
            <label className="block">
              <span className="text-xs text-neutral-500">{sectionContentFieldLabel("title")}</span>
              <input
                className="mt-0.5 w-full font-medium"
                value={st.title}
                onChange={(e) => {
                  const arr = [...((d.steps as typeof st[]) ?? [])];
                  arr[i] = { ...st, title: e.target.value };
                  setDraft({ ...d, steps: arr });
                }}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-xs text-neutral-500">{sectionContentFieldLabel("body")}</span>
              <textarea
                className="mt-0.5 w-full text-sm"
                rows={3}
                value={st.body}
                onChange={(e) => {
                  const arr = [...((d.steps as typeof st[]) ?? [])];
                  arr[i] = { ...st, body: e.target.value };
                  setDraft({ ...d, steps: arr });
                }}
              />
            </label>
          </div>
        ))}
      </div>
    );
  } else if (sk === "faq_accordion") {
    const d = draft as Record<string, unknown>;
    body = (
      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("badge")}</span>
          <input
            className="mt-1 w-full text-sm"
            value={String(d.badge ?? "")}
            onChange={(e) => setDraft({ ...d, badge: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("title")}</span>
          <input
            className="mt-1 w-full text-sm"
            value={String(d.title ?? "")}
            onChange={(e) => setDraft({ ...d, title: e.target.value })}
          />
        </label>
        {((d.items as { question: string; answer: string }[]) ?? []).map((it, i) => (
          <div key={i} className="lc-field-stack-item space-y-2">
            <label className="block">
              <span className="text-neutral-600">{sectionContentFieldLabel("question")}</span>
              <textarea
                className="mt-1 w-full font-medium"
                rows={2}
                value={it.question}
                onChange={(e) => {
                  const arr = [...((d.items as typeof it[]) ?? [])];
                  arr[i] = { ...it, question: e.target.value };
                  setDraft({ ...d, items: arr });
                }}
              />
            </label>
            <label className="mt-2 block">
              <span className="text-neutral-600">{sectionContentFieldLabel("answer")}</span>
              <textarea
                className="mt-1 w-full text-sm"
                rows={3}
                value={it.answer}
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
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("badge")}</span>
          <input
            className="mt-1 w-full text-sm"
            value={String(d.badge ?? "")}
            onChange={(e) => setDraft({ ...d, badge: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("headline")}</span>
          <textarea
            className="mt-1 w-full text-sm"
            rows={2}
            value={String(d.headline ?? "")}
            onChange={(e) => setDraft({ ...d, headline: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("email")}</span>
          <input
            dir="ltr"
            className="mt-1 w-full text-sm"
            value={String(d.email ?? "")}
            onChange={(e) => setDraft({ ...d, email: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("phone")}</span>
          <input
            dir="ltr"
            className="mt-1 w-full text-sm"
            value={String(d.phone ?? "")}
            onChange={(e) => setDraft({ ...d, phone: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("submitLabel")}</span>
          <input
            className="mt-1 w-full text-sm"
            value={String(d.submitLabel ?? "")}
            onChange={(e) => setDraft({ ...d, submitLabel: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-neutral-600">{sectionContentFieldLabel("footerCredit")}</span>
          <input
            className="mt-1 w-full text-sm"
            value={String(d.footerCredit ?? "")}
            onChange={(e) => setDraft({ ...d, footerCredit: e.target.value })}
          />
        </label>
        <div className="text-neutral-600">{sectionContentFieldLabel("social")}</div>
        {((d.social as { network: string; href: string }[]) ?? []).map((s, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2">
            <label className="block shrink-0">
              <span className="text-xs text-neutral-500">{sectionContentFieldLabel("network")}</span>
              <input
                className="mt-0.5 w-28 text-sm"
                value={s.network}
                onChange={(e) => {
                  const arr = [...((d.social as typeof s[]) ?? [])];
                  arr[i] = { ...s, network: e.target.value };
                  setDraft({ ...d, social: arr });
                }}
              />
            </label>
            <label className="block min-w-0 flex-1">
              <span className="text-xs text-neutral-500">{sectionContentFieldLabel("href")}</span>
              <input
                dir="ltr"
                className="mt-0.5 w-full text-sm"
                value={s.href}
                onChange={(e) => {
                  const arr = [...((d.social as typeof s[]) ?? [])];
                  arr[i] = { ...s, href: e.target.value };
                  setDraft({ ...d, social: arr });
                }}
              />
            </label>
          </div>
        ))}
        <div className="text-neutral-600">{sectionContentFieldLabel("formFields")}</div>
        {((d.formFields as Record<string, unknown>[]) ?? []).map((f, i) => (
          <div key={i} className="lc-field-stack-item flex flex-wrap items-end gap-2 text-xs">
            <label className="flex min-w-[4.5rem] flex-col gap-0.5">
              <span className="text-neutral-600">{sectionContentFieldLabel("name")}</span>
              <input
                className="w-full text-xs"
                value={String(f.name ?? "")}
                placeholder={he.formFieldMachineName}
                onChange={(e) => {
                  const arr = [...((d.formFields as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...f, name: e.target.value };
                  setDraft({ ...d, formFields: arr });
                }}
              />
            </label>
            <label className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-neutral-600">{sectionContentFieldLabel("label")}</span>
              <input
                className="w-full text-xs"
                value={String(f.label ?? "")}
                placeholder="תווית"
                onChange={(e) => {
                  const arr = [...((d.formFields as Record<string, unknown>[]) ?? [])];
                  arr[i] = { ...f, label: e.target.value };
                  setDraft({ ...d, formFields: arr });
                }}
              />
            </label>
            <label className="flex shrink-0 flex-col gap-0.5">
              <span className="text-neutral-600">{sectionContentFieldLabel("type")}</span>
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
  }

  return (
    <div className={embedded ? "" : "rounded-2xl bg-white p-4 shadow-sm"}>
      {!embedded ? (
        <>
          <h3 className="font-semibold">{he.sectionInspector}</h3>
          <p className="text-xs text-neutral-500">{sectionKey}</p>
        </>
      ) : null}
      <div className={embedded ? "" : "mt-4"}>{body}</div>
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
      {msg ? <p className="mt-2 text-xs text-neutral-600">{msg}</p> : null}
    </div>
  );
}
