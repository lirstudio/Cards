import { sectionCatalog } from "@/lib/sections/catalog";
import {
  isLegacyNavHeroStatsKey,
  type SectionKey,
} from "@/lib/sections/schemas";

/** מזהה ייחודי לעוגן גלילה לכל מופע סקשן בעמוד */
export function landingSectionDomId(sectionId: string): string {
  return `lc-${sectionId}`;
}

export const LANDING_SECTION_ANCHOR_CLASS = "scroll-mt-28";

export type PageNavSectionRow = {
  sectionKey: string;
  sectionId: string;
  visible: boolean;
};

export function navLabelForSectionKey(sectionKey: string): string {
  if (isLegacyNavHeroStatsKey(sectionKey)) {
    return sectionCatalog.hero_image_split.titleHe;
  }
  if (sectionKey in sectionCatalog) {
    return sectionCatalog[sectionKey as SectionKey].titleHe;
  }
  return sectionKey;
}

export type BuiltNavLink = {
  sectionId: string;
  label: string;
  href: string;
};

/**
 * קישורי תפריט לפי סדר הופעה בעמוד (מערך כמו ב־DB / בעורך).
 * לא כולל את תפריט העליון בלבד.
 */
export function buildNavLinksFromPage(sections: PageNavSectionRow[]): BuiltNavLink[] {
  const out: BuiltNavLink[] = [];
  for (const s of sections) {
    if (s.sectionKey === "site_header_nav") continue;
    if (!s.visible) continue;
    out.push({
      sectionId: s.sectionId,
      label: navLabelForSectionKey(s.sectionKey),
      href: `#${landingSectionDomId(s.sectionId)}`,
    });
  }
  return out;
}

/** תפריט אחרי מחיקות וסדר ידני (בהשוואה לרשימה האוטומטית מסדר העמוד). */
export function resolveNavLinksForPage(
  pageNavSections: PageNavSectionRow[],
  opts?: {
    excludedSectionIds?: string[] | null;
    sectionOrder?: string[] | null;
  },
): BuiltNavLink[] {
  const base = buildNavLinksFromPage(pageNavSections);
  const excluded = new Set(opts?.excludedSectionIds?.filter(Boolean) ?? []);
  const hasExcluded = excluded.size > 0;
  const order = opts?.sectionOrder;
  const hasOrder = order != null && order.length > 0;

  if (!hasExcluded && !hasOrder) {
    return base;
  }

  const pool = base.filter((l) => !excluded.has(l.sectionId));
  if (!hasOrder) {
    return pool;
  }

  const byId = new Map(pool.map((l) => [l.sectionId, l]));
  const out: BuiltNavLink[] = [];
  const used = new Set<string>();
  for (const id of order) {
    if (excluded.has(id)) continue;
    const l = byId.get(id);
    if (l) {
      out.push(l);
      used.add(l.sectionId);
    }
  }
  for (const l of pool) {
    if (!used.has(l.sectionId)) out.push(l);
  }
  return out;
}

/** המרת #contact / ריק לעוגן של סקשן יצירת קשר הראשון מהסוף (כמו CTA קודם). */
export function resolveHeaderCtaHref(
  href: string,
  sections: PageNavSectionRow[] | undefined,
): string {
  const h = href.trim();
  if (!sections?.length) return h || "#lc-page-top";
  if (h === "" || h === "#" || h === "#contact") {
    const contact = [...sections]
      .reverse()
      .find((s) => s.visible && s.sectionKey === "contact_split_footer");
    if (contact) return `#${landingSectionDomId(contact.sectionId)}`;
    return "#lc-page-top";
  }
  return h || "#lc-page-top";
}
