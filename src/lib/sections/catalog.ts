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
    descriptionHe: "כרטיסי המלצות בגלילה אופקית.",
    category: "content",
  },
  center_richtext_cta: {
    titleHe: "טקסט מרכזי + כפתור",
    descriptionHe: "כותרת, פסקאות ו־CTA — למשל על הסדנה.",
    category: "content",
  },
  checklist_with_image: {
    titleHe: "רשימת מה כלול + תמונה",
    descriptionHe: "כותרת, פריטים עם וי כחול ותמונה.",
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
