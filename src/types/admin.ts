import { z } from "zod";

// ── Style overrides (before row types) ──

export const sectionStyleOverridesSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
  paddingY: z.enum(["sm", "md", "lg", "xl"]).optional(),
  borderRadius: z.enum(["none", "sm", "md", "lg"]).optional(),
  layoutDirection: z.enum(["rtl", "ltr"]).optional(),
  /** מרקיי אופקי (המלצות / גלריה): אם `reverse` — גלילה בכיוון ההפוך (animation-direction: reverse). */
  marqueeAnimationDirection: z.literal("reverse").optional(),
  /** For sections with text + image: side‑by‑side (default) or stacked order. */
  imageTextLayout: z
    .enum(["default", "stack_text_above", "stack_image_above"])
    .optional(),
});

export type SectionStyleOverrides = z.infer<typeof sectionStyleOverridesSchema>;

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
  style_overrides: SectionStyleOverrides;
  created_at: string;
  updated_at: string;
};

export type SystemSettingRow = {
  key: string;
  value: unknown;
  updated_at: string;
};

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
  plan_id: string | null;
  page_count: number;
  created_at: string;
  last_sign_in_at: string | null;
  is_banned: boolean;
  subscription_status: string | null;
};

export type AdminUserDetail = AdminUserRow & {
  pages: { id: string; slug: string; title: string; status: string; created_at: string }[];
  total_submissions: number;
  storage_bytes: number;
  subscription_plan_id: string | null;
  current_period_end: string | null;
  available_plans: { id: string; slug: string; name_he: string }[];
};

export type ListUsersOpts = {
  page?: number;
  pageSize?: number;
  search?: string;
  roleFilter?: "all" | "user" | "admin";
  planFilter?: string;
  sortBy?: "created_at" | "display_name" | "page_count";
  sortDir?: "asc" | "desc";
};
