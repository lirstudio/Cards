import { z } from "zod";

// ── Row types ──

export type SectionCategoryRow = {
  slug: string;
  name_he: string;
  sort_order: number;
  created_at: string;
};

export type SectionDefinitionRow = {
  key: string;
  title_he: string;
  description_he: string;
  category_slug: string;
  enabled: boolean;
  sort_order: number;
  preview_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SectionVariantRow = {
  id: string;
  section_key: string;
  name_he: string;
  style_overrides: SectionStyleOverrides;
  is_default: boolean;
  enabled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** כרטיס עיצוב לבחירה בעורך העמוד (רשימה ציבורית מסקשנים מופעלים). */
export type SectionVariantPickerRow = {
  id: string;
  section_key: string;
  name_he: string;
  style_overrides: SectionStyleOverrides;
  is_default: boolean;
  sort_order: number;
};

export type SystemSettingRow = {
  key: string;
  value: unknown;
  updated_at: string;
};

// ── Style overrides ──

export const sectionStyleOverridesSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
  paddingY: z.enum(["sm", "md", "lg", "xl"]).optional(),
  borderRadius: z.enum(["none", "sm", "md", "lg"]).optional(),
  layoutDirection: z.enum(["rtl", "ltr"]).optional(),
  /** For sections with text + image: side‑by‑side (default) or stacked order. */
  imageTextLayout: z
    .enum(["default", "stack_text_above", "stack_image_above"])
    .optional(),
  /** סקשן checklist_with_image: תמונה לצד הרשימה או רשימה ממורכזת בלבד. */
  checklistLayout: z.enum(["with_image", "text_only"]).optional(),
  /** סקשן testimonials_row: עיצוב כרטיסי ההמלצות. */
  testimonialsLayout: z
    .enum([
      "marquee",
      "photo_cards",
      "star_cards",
      "quote_side",
      "cinematic",
    ])
    .optional(),
});

export type SectionStyleOverrides = z.infer<typeof sectionStyleOverridesSchema>;

// ── Admin stats ──

export type AdminStats = {
  totalUsers: number;
  usersToday: number;
  usersThisWeek: number;
  usersThisMonth: number;
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  pagesToday: number;
  pagesThisWeek: number;
  pagesThisMonth: number;
  totalSubmissions: number;
  planDistribution: { slug: string; name_he: string; count: number }[];
};

// ── Admin user list row ──

export type AdminUserRow = {
  id: string;
  display_name: string | null;
  email: string;
  role: string;
  plan_slug: string | null;
  plan_name: string | null;
  page_count: number;
  created_at: string;
};
