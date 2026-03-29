/* סקשן חדש בדף נחיתה: יישום רספונסיבי אחיד דרך src/lib/landing/section-shell (LC_SECTION_SHELL). */
import type { SectionKey } from "./schemas";

export type SectionCategory = "hero" | "content" | "conversion";

export type SectionCatalogEntry = {
  titleHe: string;
  descriptionHe: string;
  category: SectionCategory;
};

export const sectionCatalog: Record<SectionKey, SectionCatalogEntry> = {
  site_header_nav: {
    titleHe: "תפריט עליון",
    descriptionHe: "לוגו, סרגל עליון, קישורי ניווט וכפתור בראש העמוד.",
    category: "hero",
  },
  hero_image_split: {
    titleHe: "הירו (תמונה וטקסט)",
    descriptionHe: "כותרת ראשית, טקסט משנה, תמונה וכפתור פעולה — ללא תפריט.",
    category: "hero",
  },
  stats_highlight_row: {
    titleHe: "שורת מספרים",
    descriptionHe: "סטטיסטיקות בולטות בשורה אחת.",
    category: "hero",
  },
  about_bio_qa: {
    titleHe: "אודות",
    descriptionHe: "שלושה כותרות ופסקאות לצד תמונת פורטרט.",
    category: "content",
  },
  split_three_qa_image: {
    titleHe: "מי אנחנו",
    descriptionHe: "שלוש שאלות ותשובות לצד תמונה רחבה.",
    category: "content",
  },
  testimonials_row: {
    titleHe: "המלצות",
    descriptionHe:
      "כרטיסי המלצות — בחרו בכרטיס עיצוב: גלילה, רשת, מודגש עם שורה או רשימה אנכית.",
    category: "content",
  },
  center_richtext_cta: {
    titleHe: "טקסט מרכזי + כפתור",
    descriptionHe: "כותרת, פסקאות ו־CTA — למשל על הסדנה.",
    category: "content",
  },
  checklist_with_image: {
    titleHe: "רשימה",
    descriptionHe:
      "כותרת ופריטים עם וי כחול — ניתן לבחור תצוגה עם תמונה או רשימה בלבד (כרטיס עיצוב).",
    category: "content",
  },
  pricing_banner: {
    titleHe: "באנר מחיר",
    descriptionHe: "כותרת מחיר, טקסט הסבר וכפתור.",
    category: "conversion",
  },
  services_grid: {
    titleHe: "רשת שירותים",
    descriptionHe: "תגית, כותרת וארבעה כרטיסים (כולל מודגש).",
    category: "content",
  },
  gallery_row: {
    titleHe: "גלריית תמונות",
    descriptionHe: "שורת תמונות מעוגלות.",
    category: "content",
  },
  how_it_works_blue: {
    titleHe: "איך זה עובד",
    descriptionHe: "רקע כחול, שלושה שלבים בכרטיסים לבנים.",
    category: "conversion",
  },
  faq_accordion: {
    titleHe: "שאלות נפוצות",
    descriptionHe: "אקורדיון שאלות ותשובות.",
    category: "conversion",
  },
  contact_split_footer: {
    titleHe: "צור קשר וטופס",
    descriptionHe: "טופס הרשמה, רשתות, מייל, טלפון ופוטר.",
    category: "conversion",
  },
};

export function getCatalogEntry(key: SectionKey): SectionCatalogEntry {
  return sectionCatalog[key];
}

/** מילוי ישן ב־section_definitions (לפני שינוי השם ל־״רשימה״). */
export const CHECKLIST_SECTION_LEGACY_METADATA = {
  title_he: "רשימת מה כלול + תמונה",
  description_he: "כותרת, פריטים עם וי כחול ותמונה.",
} as const;

/** תצוגה וסנכרון: אם ב־DB עדיין הכותרת/תיאור הישנים — משתמשים בקטלוג. */
export function normalizeSectionDefinitionRow<
  T extends { key: string; title_he: string; description_he: string },
>(row: T): T {
  if (row.key !== "checklist_with_image") return row;
  const leg = CHECKLIST_SECTION_LEGACY_METADATA;
  if (row.title_he === leg.title_he || row.description_he === leg.description_he) {
    const c = sectionCatalog.checklist_with_image;
    return { ...row, title_he: c.titleHe, description_he: c.descriptionHe };
  }
  return row;
}
