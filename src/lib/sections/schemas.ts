import { z } from "zod";

/** מוסיף __hidden?: string[] לכל סכימת סקשן — שדות ב-__hidden נשמרים בנתונים אך מוסתרים מהעורך ומהתצוגה */
function withHidden<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.extend({ __hidden: z.array(z.string()).optional() });
}

const linkSchema = z.object({ label: z.string(), href: z.string() });
const statSchema = z.object({ value: z.string(), label: z.string().optional() });
const qaBlockSchema = z.object({ title: z.string(), body: z.string() });
const testimonialSchema = z.object({
  headline: z.string(),
  body: z.string().optional(),
  authorName: z.string(),
  authorTitle: z.string().optional(),
  authorImage: z.string().optional(),
  /** 0 = בלי כוכבים, 1–5 = מספר כוכבי הדירוג */
  starRating: z.number().int().min(0).max(5).optional(),
});
const checklistItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});
const serviceCardSchema = z.object({
  title: z.string(),
  description: z.string(),
  number: z.string().optional(),
  featured: z.boolean().optional(),
});
const galleryImageSchema = z.object({ src: z.string(), alt: z.string().optional() });
const stepSchema = z.object({ title: z.string(), body: z.string() });
const faqItemSchema = z.object({ question: z.string(), answer: z.string() });
const socialLinkSchema = z.object({ network: z.string(), href: z.string() });
const formFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(["text", "email", "tel", "textarea"]),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
});

/** תוכן הירו (תמונה + טקסט + קישור) — משותף ל־hero_image_split ול־nav_hero_stats הישן */
export const heroImageSplitContentSchema = z.object({
  heroImage: z.string(),
  headline: z.string(),
  subheadline: z.string(),
  heroCta: linkSchema,
  /** עיגול צבע מותאם מאחורי תמונת ההירו — ברירת מחדל כבוי */
  heroBackdropCircle: z.boolean().optional().default(false),
});

/**
 * מפתח ישן ב-DB (nav_hero_stats) — אותה סכימה כמו הירו בלבד.
 * שדות תפריט/סטטיסטיקה ב-JSON ישן נזרקים בפרסור.
 */
export const legacyNavHeroStatsSchema = heroImageSplitContentSchema;

export const sectionSchemas = {
  site_header_nav: withHidden(z.object({
    logoText: z.string(),
    /** לוגו כתמונה — אם מלא, מוצג במקום טקסט הלוגו (לא יחד איתו) */
    logoImageUrl: z.string().optional().default(""),
    topBarLeft: z.string().optional(),
    topBarRight: z.string().optional(),
    /** Legacy — לא בשימוש כשקיימים קישורים דינמיים מהעמוד */
    navLinks: z.array(linkSchema).optional().default([]),
    headerCta: linkSchema,
    /** סקשנים להסתרה מהתפריט (מזהי page_sections) */
    navExcludedSectionIds: z.array(z.string()).optional(),
    /** סדר הופעת פריטי תפריט (מזהים של סקשנים מקושרים לעמוד) */
    navSectionOrder: z.array(z.string()).optional(),
  })),
  hero_image_split: withHidden(heroImageSplitContentSchema),
  hero_editorial_split: withHidden(heroImageSplitContentSchema.extend({
    eyebrow: z.string().optional(),
  })),
  hero_immersive_bg: withHidden(z.object({
    backgroundImage: z.string(),
    headline: z.string(),
    subheadline: z.string(),
    heroCta: linkSchema,
    secondaryCta: linkSchema,
  })),
  hero_showcase_float: withHidden(heroImageSplitContentSchema.extend({
    badge: z.string().optional(),
  })),
  stats_highlight_row: withHidden(z.object({
    stats: z.array(statSchema),
  })),
  about_bio_qa: withHidden(z.object({
    image: z.string(),
    blocks: z.array(qaBlockSchema).min(1),
  })),
  split_three_qa_image: withHidden(z.object({
    image: z.string(),
    blocks: z.array(qaBlockSchema).min(1),
  })),
  testimonials_marquee: withHidden(z.object({
    items: z.array(testimonialSchema),
  })),
  testimonials_photo_cards: withHidden(z.object({
    items: z.array(testimonialSchema),
  })),
  testimonials_star_cards: withHidden(z.object({
    items: z.array(testimonialSchema),
  })),
  testimonials_quote_side: withHidden(z.object({
    items: z.array(testimonialSchema),
  })),
  testimonials_cinematic: withHidden(z.object({
    items: z.array(testimonialSchema),
  })),
  center_richtext_cta: withHidden(z.object({
    title: z.string(),
    paragraphs: z.array(z.string()),
    cta: linkSchema,
  })),
  checklist_with_image: withHidden(z.object({
    title: z.string(),
    image: z.string(),
    items: z.array(checklistItemSchema),
  })),
  checklist_text_only: withHidden(z.object({
    title: z.string(),
    image: z.string(),
    items: z.array(checklistItemSchema),
  })),
  pricing_banner: withHidden(z.object({
    headline: z.string(),
    body: z.string(),
    cta: linkSchema,
  })),
  services_grid: withHidden(z.object({
    badge: z.string(),
    title: z.string(),
    cards: z.array(serviceCardSchema),
  })),
  gallery_row: withHidden(z.object({
    images: z.array(galleryImageSchema),
  })),
  gallery_grid_even: withHidden(z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    images: z.array(galleryImageSchema),
  })),
  gallery_spotlight: withHidden(z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    images: z.array(galleryImageSchema),
  })),
  gallery_bento: withHidden(z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    images: z.array(galleryImageSchema),
  })),
  how_it_works_blue: withHidden(z.object({
    badge: z.string(),
    title: z.string(),
    intro: z.string(),
    steps: z.array(stepSchema).min(1),
  })),
  /** תוכן משותף לכל וריאנטי שאלות נפוצות */
  faq_accordion: withHidden(z.object({
    badge: z.string(),
    title: z.string(),
    items: z.array(faqItemSchema),
  })),
  faq_two_column: withHidden(z.object({
    badge: z.string(),
    title: z.string(),
    items: z.array(faqItemSchema),
  })),
  faq_cards: withHidden(z.object({
    badge: z.string(),
    title: z.string(),
    items: z.array(faqItemSchema),
  })),
  faq_expanded: withHidden(z.object({
    badge: z.string(),
    title: z.string(),
    items: z.array(faqItemSchema),
  })),
  contact_split_footer: withHidden(z.object({
    badge: z.string(),
    headline: z.string(),
    social: z.array(socialLinkSchema),
    email: z.string(),
    phone: z.string(),
    submitLabel: z.string(),
    footerCredit: z.string(),
    formFields: z.array(formFieldSchema),
  })),
  footer_minimal: withHidden(z.object({
    brandText: z.string(),
    links: z.array(linkSchema),
    copyright: z.string(),
  })),
  footer_columns: withHidden(z.object({
    brandText: z.string(),
    aboutTitle: z.string(),
    aboutBody: z.string(),
    linksTitle: z.string(),
    links: z.array(linkSchema),
    contactTitle: z.string(),
    email: z.string(),
    phone: z.string(),
    social: z.array(socialLinkSchema),
    bottomBar: z.string(),
  })),
  footer_newsletter: withHidden(z.object({
    headline: z.string(),
    subheadline: z.string(),
    brandTagline: z.string(),
    social: z.array(socialLinkSchema),
    emailLabel: z.string(),
    submitLabel: z.string(),
    privacyNote: z.string(),
  })),
};

export type SectionKey = keyof typeof sectionSchemas;

export const SECTION_KEYS = Object.keys(sectionSchemas) as SectionKey[];

/** פריסות המלצות — מפתח נפרד לכל עיצוב (ללא וריאנטים ב-DB). */
export const TESTIMONIALS_SECTION_KEYS = [
  "testimonials_marquee",
  "testimonials_photo_cards",
  "testimonials_star_cards",
  "testimonials_quote_side",
  "testimonials_cinematic",
] as const satisfies readonly SectionKey[];

export type TestimonialsSectionKey = (typeof TESTIMONIALS_SECTION_KEYS)[number];

export type TestimonialsVisualLayout =
  | "marquee"
  | "photo_cards"
  | "star_cards"
  | "quote_side"
  | "cinematic";

const TESTIMONIALS_KEY_TO_LAYOUT = {
  testimonials_marquee: "marquee",
  testimonials_photo_cards: "photo_cards",
  testimonials_star_cards: "star_cards",
  testimonials_quote_side: "quote_side",
  testimonials_cinematic: "cinematic",
} as const satisfies Record<TestimonialsSectionKey, TestimonialsVisualLayout>;

export function testimonialsLayoutFromSectionKey(key: string): TestimonialsVisualLayout | null {
  if (key in TESTIMONIALS_KEY_TO_LAYOUT) {
    return TESTIMONIALS_KEY_TO_LAYOUT[key as TestimonialsSectionKey];
  }
  return null;
}

export function isTestimonialsSectionKey(key: string): key is TestimonialsSectionKey {
  return (TESTIMONIALS_SECTION_KEYS as readonly string[]).includes(key);
}

/** סקשני שאלות נפוצות — אותו מבנה תוכן ואותו טופס עורך */
export const FAQ_EDITOR_SECTION_KEYS = [
  "faq_accordion",
  "faq_two_column",
  "faq_cards",
  "faq_expanded",
] as const satisfies readonly SectionKey[];

/** רשימה עם/בלי תמונה — אותו טופס תוכן, מפתח שונה לפריסה. */
export const CHECKLIST_SECTION_KEYS = [
  "checklist_with_image",
  "checklist_text_only",
] as const satisfies readonly SectionKey[];

export type ChecklistSectionKey = (typeof CHECKLIST_SECTION_KEYS)[number];

export function isChecklistSectionKey(key: string): key is ChecklistSectionKey {
  return (CHECKLIST_SECTION_KEYS as readonly string[]).includes(key);
}

/** סקשני הירו עם עריכת תוכן (למעט תפריט עליון). */
export const HERO_CONTENT_SECTION_KEYS = [
  "hero_image_split",
  "hero_editorial_split",
  "hero_immersive_bg",
  "hero_showcase_float",
] as const satisfies readonly SectionKey[];

export type HeroContentSectionKey = (typeof HERO_CONTENT_SECTION_KEYS)[number];

export function isHeroContentSectionKey(key: string): key is HeroContentSectionKey {
  return (HERO_CONTENT_SECTION_KEYS as readonly string[]).includes(key);
}

export function parseSectionContent<K extends SectionKey>(
  key: K,
  data: unknown,
): z.infer<(typeof sectionSchemas)[K]> {
  return sectionSchemas[key].parse(data) as z.infer<(typeof sectionSchemas)[K]>;
}

export type LegacyNavHeroStats = z.infer<typeof legacyNavHeroStatsSchema>;

export const LEGACY_NAV_HERO_STATS_KEY = "nav_hero_stats" as const;

export function isLegacyNavHeroStatsKey(key: string): boolean {
  return key === LEGACY_NAV_HERO_STATS_KEY;
}

export function safeParseLegacyNavHeroStats(data: unknown) {
  return legacyNavHeroStatsSchema.safeParse(data);
}

/** סקשן שניתן לעריכה בעורך (כולל מפתח ישן) */
export function isEditableSectionKey(key: string): key is SectionKey | typeof LEGACY_NAV_HERO_STATS_KEY {
  return key in sectionSchemas || isLegacyNavHeroStatsKey(key);
}

export function safeParseSectionContent<K extends SectionKey>(
  key: K,
  data: unknown,
):
  | { success: true; data: z.infer<(typeof sectionSchemas)[K]> }
  | { success: false; error: z.ZodError } {
  const r = sectionSchemas[key].safeParse(data);
  if (r.success) {
    return { success: true, data: r.data as z.infer<(typeof sectionSchemas)[K]> };
  }
  return { success: false, error: r.error };
}
