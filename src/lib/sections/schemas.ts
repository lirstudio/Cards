import { z } from "zod";

const linkSchema = z.object({ label: z.string(), href: z.string() });
const statSchema = z.object({ value: z.string(), label: z.string().optional() });
const qaBlockSchema = z.object({ title: z.string(), body: z.string() });
const testimonialSchema = z.object({
  headline: z.string(),
  body: z.string().optional(),
  authorName: z.string(),
  authorTitle: z.string().optional(),
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
});

/**
 * מפתח ישן ב-DB (nav_hero_stats) — אותה סכימה כמו הירו בלבד.
 * שדות תפריט/סטטיסטיקה ב-JSON ישן נזרקים בפרסור.
 */
export const legacyNavHeroStatsSchema = heroImageSplitContentSchema;

export const sectionSchemas = {
  site_header_nav: z.object({
    logoText: z.string(),
    topBarLeft: z.string().optional(),
    topBarRight: z.string().optional(),
    /** Legacy — לא בשימוש כשקיימים קישורים דינמיים מהעמוד */
    navLinks: z.array(linkSchema).optional().default([]),
    headerCta: linkSchema,
    /** סקשנים להסתרה מהתפריט (מזהי page_sections) */
    navExcludedSectionIds: z.array(z.string()).optional(),
    /** סדר הופעת פריטי תפריט (מזהים של סקשנים מקושרים לעמוד) */
    navSectionOrder: z.array(z.string()).optional(),
  }),
  hero_image_split: heroImageSplitContentSchema,
  stats_highlight_row: z.object({
    stats: z.array(statSchema),
  }),
  about_bio_qa: z.object({
    image: z.string(),
    blocks: z.array(qaBlockSchema).min(1),
  }),
  split_three_qa_image: z.object({
    image: z.string(),
    blocks: z.array(qaBlockSchema).min(3).max(3),
  }),
  testimonials_row: z.object({
    items: z.array(testimonialSchema),
  }),
  center_richtext_cta: z.object({
    title: z.string(),
    paragraphs: z.array(z.string()),
    cta: linkSchema,
  }),
  checklist_with_image: z.object({
    title: z.string(),
    image: z.string(),
    items: z.array(checklistItemSchema),
  }),
  pricing_banner: z.object({
    headline: z.string(),
    body: z.string(),
    cta: linkSchema,
  }),
  services_grid: z.object({
    badge: z.string(),
    title: z.string(),
    cards: z.array(serviceCardSchema),
  }),
  gallery_row: z.object({
    images: z.array(galleryImageSchema),
  }),
  how_it_works_blue: z.object({
    badge: z.string(),
    title: z.string(),
    intro: z.string(),
    steps: z.tuple([stepSchema, stepSchema, stepSchema]),
  }),
  faq_accordion: z.object({
    badge: z.string(),
    title: z.string(),
    items: z.array(faqItemSchema),
  }),
  contact_split_footer: z.object({
    badge: z.string(),
    headline: z.string(),
    social: z.array(socialLinkSchema),
    email: z.string(),
    phone: z.string(),
    submitLabel: z.string(),
    footerCredit: z.string(),
    formFields: z.array(formFieldSchema),
  }),
} as const;

export type SectionKey = keyof typeof sectionSchemas;

export const SECTION_KEYS = Object.keys(sectionSchemas) as SectionKey[];

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
