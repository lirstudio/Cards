/* סקשן חדש בדף נחיתה: יישום רספונסיבי אחיד דרך src/lib/landing/section-shell (LC_SECTION_SHELL). */
import type { SectionKey } from "./schemas";

export type SectionCategory =
  | "hero"
  | "content"
  | "conversion"
  | "footer"
  | "gallery"
  | "faq";

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
  hero_editorial_split: {
    titleHe: "הירו — מגזין (מדיה רחבה)",
    descriptionHe: "שורת הדגשה, כותרות ותמונה רחבה במסגרת פרימיום — ללא קימור התמונה של הירו הקלאסי.",
    category: "hero",
  },
  hero_immersive_bg: {
    titleHe: "הירו — רקע מלא",
    descriptionHe: "תמונת רקע מלאה עם שכבת עומק, טקסט ממורכז ושני כפתורי פעולה.",
    category: "hero",
  },
  hero_showcase_float: {
    titleHe: "הירו — במה ומוצר מרחף",
    descriptionHe: "כותרת דומיננטית, תגית אופציונלית ותמונה עם אפקט צף ומוקאפ.",
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
  testimonials_marquee: {
    titleHe: "המלצות — כרטיסים נגללים",
    descriptionHe: "כרטיסי המלצות במרקיי אופקי.",
    category: "content",
  },
  testimonials_photo_cards: {
    titleHe: "המלצות — כרטיסי תמונה",
    descriptionHe: "המלצות עם דגש על תמונות המחברים.",
    category: "content",
  },
  testimonials_star_cards: {
    titleHe: "המלצות — כרטיסי כוכבים",
    descriptionHe: "דירוג כוכבים בולט ליד כל המלצה.",
    category: "content",
  },
  testimonials_quote_side: {
    titleHe: "המלצות — ציטוט ותמונה",
    descriptionHe: "ציטוט גדול לצד תמונת מחבר.",
    category: "content",
  },
  testimonials_cinematic: {
    titleHe: "המלצות — קולנועי",
    descriptionHe: "שקופיות רחבות בסגנון קולנועי.",
    category: "content",
  },
  center_richtext_cta: {
    titleHe: "טקסט מרכזי + כפתור",
    descriptionHe: "כותרת, פסקאות ו־CTA — למשל על הסדנה.",
    category: "content",
  },
  checklist_with_image: {
    titleHe: "רשימה (עם תמונה)",
    descriptionHe: "כותרת ופריטים עם וי כחול לצד תמונה.",
    category: "content",
  },
  checklist_text_only: {
    titleHe: "רשימה (טקסט בלבד)",
    descriptionHe: "כותרת ופריטים עם וי כחול — ללא תמונה, רשימה ממורכזת.",
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
    titleHe: "גלריית תמונות (שורה נגללת)",
    descriptionHe: "שורת תמונות מעוגלות עם גלילה אופקית.",
    category: "gallery",
  },
  gallery_grid_even: {
    titleHe: "גלריית רשת",
    descriptionHe: "רשת תמונות אחידה —2–3 עמודות לפי רוחב המסך.",
    category: "gallery",
  },
  gallery_spotlight: {
    titleHe: "גלריית מוקד",
    descriptionHe: "תמונה גדולה לצד רשת קטנה — מדגישה פריט ראשי.",
    category: "gallery",
  },
  gallery_bento: {
    titleHe: "גלריית בנטו",
    descriptionHe: "פריסה אסימטרית (בנטו) לכמה תמונות בולטות.",
    category: "gallery",
  },
  how_it_works_blue: {
    titleHe: "איך זה עובד",
    descriptionHe: "תגית, מבוא ושלושה שלבים בכרטיסים.",
    category: "conversion",
  },
  faq_accordion: {
    titleHe: "שאלות נפוצות (אקורדיון)",
    descriptionHe: "שאלות ותשובות — נפתחות בלחיצה.",
    category: "faq",
  },
  faq_two_column: {
    titleHe: "שאלות נפוצות (שתי עמודות)",
    descriptionHe: "רשת דו-עמודתית — כל התשובות גלויות.",
    category: "faq",
  },
  faq_cards: {
    titleHe: "שאלות נפוצות (כרטיסים)",
    descriptionHe: "כרטיסים בודדים לכל שאלה — רשת נקייה.",
    category: "faq",
  },
  faq_expanded: {
    titleHe: "שאלות נפוצות (רשימה פתוחה)",
    descriptionHe: "רשימה אנכית עם הפרדות — ללא אקורדיון.",
    category: "faq",
  },
  contact_split_footer: {
    titleHe: "צור קשר וטופס",
    descriptionHe: "טופס הרשמה, רשתות, מייל, טלפון ופוטר.",
    category: "conversion",
  },
  footer_minimal: {
    titleHe: "פוטר מינימליסטי",
    descriptionHe: "מותג, שורת קישורים וזכויות יוצרים — קומפקטי.",
    category: "footer",
  },
  footer_columns: {
    titleHe: "פוטר רב-עמודות",
    descriptionHe: "אודות, קישורים, יצירת קשר ורשתות חברתיות.",
    category: "footer",
  },
  footer_newsletter: {
    titleHe: "פוטר עם ניוזלטר",
    descriptionHe: "מסר מותג, הרשמה לאימייל ורשתות חברתיות.",
    category: "footer",
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
