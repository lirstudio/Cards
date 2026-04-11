"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { he } from "@/lib/i18n/he";
import {
  CHECKLIST_SECTION_LEGACY_METADATA,
  sectionCatalog,
} from "@/lib/sections/catalog";
import {
  HERO_CONTENT_SECTION_KEYS,
  TESTIMONIALS_SECTION_KEYS,
  type SectionKey,
} from "@/lib/sections/schemas";
import {
  sectionStyleOverridesSchema,
  type SectionStyleOverrides,
  type AdminUserRow,
  type AdminUserDetail,
  type ListUsersOpts,
} from "@/types/admin";

const SPLIT_HERO_SECTION_KEYS = [
  "site_header_nav",
  "hero_image_split",
  "stats_highlight_row",
] as const satisfies readonly SectionKey[];

const FOOTER_SECTION_KEYS = [
  "footer_minimal",
  "footer_columns",
  "footer_newsletter",
] as const satisfies readonly SectionKey[];

async function resolveFooterCategorySlug(
  admin: ReturnType<typeof createAdminClient>,
): Promise<string> {
  const { data: byName } = await admin
    .from("section_categories")
    .select("slug")
    .eq("name_he", "פוטר")
    .limit(1)
    .maybeSingle();
  if (byName?.slug) return byName.slug as string;

  const { data: footerRow } = await admin
    .from("section_categories")
    .select("slug")
    .eq("slug", "footer")
    .maybeSingle();
  if (footerRow?.slug) return footerRow.slug as string;

  const { data: maxCat } = await admin
    .from("section_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxCat?.sort_order ?? -1) + 1;
  const { error } = await admin.from("section_categories").insert({
    slug: "footer",
    name_he: "פוטר",
    sort_order: nextOrder,
  });
  if (error) {
    console.error("resolveFooterCategorySlug insert", error.message);
  }
  return "footer";
}

async function ensureFooterSectionDefinitions(admin: ReturnType<typeof createAdminClient>) {
  const categorySlug = await resolveFooterCategorySlug(admin);
  const { data: rows } = await admin.from("section_definitions").select("key");
  const have = new Set((rows ?? []).map((r) => r.key as string));

  const { data: maxRow } = await admin
    .from("section_definitions")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextOrder = (maxRow?.sort_order ?? -1) + 1;

  for (const key of FOOTER_SECTION_KEYS) {
    if (have.has(key)) continue;
    const cat = sectionCatalog[key];
    const { error } = await admin.from("section_definitions").insert({
      key,
      title_he: cat.titleHe,
      description_he: cat.descriptionHe,
      category_slug: categorySlug,
      enabled: true,
      sort_order: nextOrder++,
    });
    if (error) {
      console.error("ensureFooterSectionDefinitions insert", key, error.message);
    }
  }
}

const GALLERY_SECTION_KEYS = [
  "gallery_grid_even",
  "gallery_spotlight",
  "gallery_bento",
] as const satisfies readonly SectionKey[];

async function resolveGalleryCategorySlug(
  admin: ReturnType<typeof createAdminClient>,
): Promise<string> {
  const { data: byName } = await admin
    .from("section_categories")
    .select("slug")
    .eq("name_he", "גלרייה")
    .limit(1)
    .maybeSingle();
  if (byName?.slug) return byName.slug as string;

  const { data: galleryRow } = await admin
    .from("section_categories")
    .select("slug")
    .eq("slug", "gallery")
    .maybeSingle();
  if (galleryRow?.slug) return galleryRow.slug as string;

  const { data: maxCat } = await admin
    .from("section_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxCat?.sort_order ?? -1) + 1;
  const { error } = await admin.from("section_categories").insert({
    slug: "gallery",
    name_he: "גלרייה",
    sort_order: nextOrder,
  });
  if (error) {
    console.error("resolveGalleryCategorySlug insert", error.message);
  }
  return "gallery";
}

async function ensureGallerySectionDefinitions(admin: ReturnType<typeof createAdminClient>) {
  const categorySlug = await resolveGalleryCategorySlug(admin);
  const { data: rows } = await admin.from("section_definitions").select("key");
  const have = new Set((rows ?? []).map((r) => r.key as string));

  const { data: maxRow } = await admin
    .from("section_definitions")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextOrder = (maxRow?.sort_order ?? -1) + 1;

  for (const key of GALLERY_SECTION_KEYS) {
    if (have.has(key)) continue;
    const cat = sectionCatalog[key];
    const { error } = await admin.from("section_definitions").insert({
      key,
      title_he: cat.titleHe,
      description_he: cat.descriptionHe,
      category_slug: categorySlug,
      enabled: true,
      sort_order: nextOrder++,
    });
    if (error) {
      console.error("ensureGallerySectionDefinitions insert", key, error.message);
    }
  }
}

const FAQ_SECTION_KEYS = [
  "faq_two_column",
  "faq_cards",
  "faq_expanded",
] as const satisfies readonly SectionKey[];

async function resolveFaqCategorySlug(admin: ReturnType<typeof createAdminClient>): Promise<string> {
  for (const nameHe of ["שאלות תשובות", "שאלות נפוצות"] as const) {
    const { data: row } = await admin
      .from("section_categories")
      .select("slug")
      .eq("name_he", nameHe)
      .limit(1)
      .maybeSingle();
    if (row?.slug) return row.slug as string;
  }

  const { data: faqRow } = await admin
    .from("section_categories")
    .select("slug")
    .eq("slug", "faq")
    .maybeSingle();
  if (faqRow?.slug) return faqRow.slug as string;

  const { data: maxCat } = await admin
    .from("section_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxCat?.sort_order ?? -1) + 1;
  const { error } = await admin.from("section_categories").insert({
    slug: "faq",
    name_he: "שאלות נפוצות",
    sort_order: nextOrder,
  });
  if (error) {
    console.error("resolveFaqCategorySlug insert", error.message);
  }
  return "faq";
}

async function ensureFaqSectionDefinitions(admin: ReturnType<typeof createAdminClient>) {
  const categorySlug = await resolveFaqCategorySlug(admin);
  const { data: rows } = await admin.from("section_definitions").select("key");
  const have = new Set((rows ?? []).map((r) => r.key as string));

  const { data: maxRow } = await admin
    .from("section_definitions")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextOrder = (maxRow?.sort_order ?? -1) + 1;

  for (const key of FAQ_SECTION_KEYS) {
    if (have.has(key)) continue;
    const cat = sectionCatalog[key];
    const { error } = await admin.from("section_definitions").insert({
      key,
      title_he: cat.titleHe,
      description_he: cat.descriptionHe,
      category_slug: categorySlug,
      enabled: true,
      sort_order: nextOrder++,
    });
    if (error) {
      console.error("ensureFaqSectionDefinitions insert", key, error.message);
    }
  }
}


/**
 * מוסיף ל-DB את שלושת סקשני הפיצול אם חסרים.
 * פותר מצב שבו המיגרציה לא הורצה מקומית.
 */
async function ensureSplitHeroSectionDefinitions(admin: ReturnType<typeof createAdminClient>) {
  const { data: rows } = await admin.from("section_definitions").select("key");
  const have = new Set((rows ?? []).map((r) => r.key as string));

  const { data: maxRow } = await admin
    .from("section_definitions")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextOrder = (maxRow?.sort_order ?? -1) + 1;

  for (const key of SPLIT_HERO_SECTION_KEYS) {
    if (have.has(key)) continue;
    const cat = sectionCatalog[key];
    const { error } = await admin.from("section_definitions").insert({
      key,
      title_he: cat.titleHe,
      description_he: cat.descriptionHe,
      category_slug: cat.category,
      enabled: true,
      sort_order: nextOrder++,
    });
    if (error) {
      console.error("ensureSplitHeroSectionDefinitions insert", key, error.message);
    }
  }
}

/** וריאנטי הירו נוספים (מעבר ל��hero_image_split) — seed כשהמיגרציה לא הורצה. */
const HERO_VARIANT_SECTION_KEYS = HERO_CONTENT_SECTION_KEYS.filter(
  (k) => !SPLIT_HERO_SECTION_KEYS.includes(k as (typeof SPLIT_HERO_SECTION_KEYS)[number]),
) as readonly SectionKey[];

async function ensureHeroVariantSectionDefinitions(admin: ReturnType<typeof createAdminClient>) {
  const { data: rows } = await admin.from("section_definitions").select("key");
  const have = new Set((rows ?? []).map((r) => r.key as string));

  const { data: maxRow } = await admin
    .from("section_definitions")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextOrder = (maxRow?.sort_order ?? -1) + 1;

  for (const key of HERO_VARIANT_SECTION_KEYS) {
    if (have.has(key)) continue;
    const cat = sectionCatalog[key];
    const { error } = await admin.from("section_definitions").insert({
      key,
      title_he: cat.titleHe,
      description_he: cat.descriptionHe,
      category_slug: cat.category,
      enabled: true,
      sort_order: nextOrder++,
    });
    if (error) {
      console.error("ensureHeroVariantSectionDefinitions insert", key, error.message);
    }
  }
}

/** מעדכן ב־DB כותרת/תיאור לסקשן הרשימה אם נשארו ערכי ה־seed הישנים (בלי תלות במיגרציה). */
async function ensureChecklistSectionDefinitionSync(
  admin: ReturnType<typeof createAdminClient>,
) {
  const { data: row } = await admin
    .from("section_definitions")
    .select("key, title_he, description_he")
    .eq("key", "checklist_with_image")
    .maybeSingle();
  if (!row) return;
  const leg = CHECKLIST_SECTION_LEGACY_METADATA;
  if (row.title_he !== leg.title_he && row.description_he !== leg.description_he) return;
  const cat = sectionCatalog.checklist_with_image;
  const { error } = await admin
    .from("section_definitions")
    .update({ title_he: cat.titleHe, description_he: cat.descriptionHe })
    .eq("key", "checklist_with_image");
  if (error) console.error("ensureChecklistSectionDefinitionSync", error.message);
}

async function ensureTestimonialsAndChecklistTextSectionDefinitions(
  admin: ReturnType<typeof createAdminClient>,
) {
  const { data: rows } = await admin.from("section_definitions").select("key");
  const have = new Set((rows ?? []).map((r) => r.key as string));

  const { data: maxRow } = await admin
    .from("section_definitions")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextOrder = (maxRow?.sort_order ?? -1) + 1;

  const keysToSeed = [...TESTIMONIALS_SECTION_KEYS, "checklist_text_only"] as const;
  for (const key of keysToSeed) {
    if (have.has(key)) continue;
    const cat = sectionCatalog[key as SectionKey];
    const { error } = await admin.from("section_definitions").insert({
      key,
      title_he: cat.titleHe,
      description_he: cat.descriptionHe,
      category_slug: cat.category,
      enabled: true,
      sort_order: nextOrder++,
    });
    if (error) {
      console.error("ensureTestimonialsAndChecklistTextSectionDefinitions", key, error.message);
    }
  }
}

// ── Auth helper ──

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("לא מחובר");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") throw new Error("אין הרשאה");
  return { supabase, user };
}

// ── Statistics ──

export async function getAdminStats() {
  await requireAdmin();
  const admin = createAdminClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const last7Start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
  const prev7Start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14).toISOString();

  const [
    { count: totalUsers },
    { count: usersToday },
    { count: usersThisWeek },
    { count: usersThisMonth },
    { count: usersLast7Days },
    { count: usersPrev7Days },
    { count: totalPages },
    { count: publishedPages },
    { count: draftPages },
    { count: pagesToday },
    { count: pagesThisWeek },
    { count: pagesThisMonth },
    { count: pagesLast7Days },
    { count: pagesPrev7Days },
    { count: totalSubmissions },
    { count: submissionsToday },
    { count: submissionsThisWeek },
    { count: submissionsThisMonth },
    { count: submissionsLast7Days },
    { count: submissionsPrev7Days },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", last7Start),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", prev7Start).lt("created_at", last7Start),
    admin.from("landing_pages").select("id", { count: "exact", head: true }),
    admin.from("landing_pages").select("id", { count: "exact", head: true }).eq("status", "published"),
    admin.from("landing_pages").select("id", { count: "exact", head: true }).eq("status", "draft"),
    admin.from("landing_pages").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
    admin.from("landing_pages").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
    admin.from("landing_pages").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    admin.from("landing_pages").select("id", { count: "exact", head: true }).gte("created_at", last7Start),
    admin.from("landing_pages").select("id", { count: "exact", head: true }).gte("created_at", prev7Start).lt("created_at", last7Start),
    admin.from("form_submissions").select("id", { count: "exact", head: true }),
    admin.from("form_submissions").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
    admin.from("form_submissions").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
    admin.from("form_submissions").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    admin.from("form_submissions").select("id", { count: "exact", head: true }).gte("created_at", last7Start),
    admin.from("form_submissions").select("id", { count: "exact", head: true }).gte("created_at", prev7Start).lt("created_at", last7Start),
  ]);

  const { data: subRows } = await admin
    .from("user_subscriptions")
    .select("plan_id, subscription_plans(slug, name_he)")
    .eq("status", "active");

  const planMap = new Map<string, { slug: string; name_he: string; count: number }>();
  for (const row of subRows ?? []) {
    const plan = row.subscription_plans as unknown as { slug: string; name_he: string } | null;
    if (!plan) continue;
    const entry = planMap.get(plan.slug) ?? { slug: plan.slug, name_he: plan.name_he, count: 0 };
    entry.count++;
    planMap.set(plan.slug, entry);
  }

  return {
    totalUsers: totalUsers ?? 0,
    usersToday: usersToday ?? 0,
    usersThisWeek: usersThisWeek ?? 0,
    usersThisMonth: usersThisMonth ?? 0,
    usersLast7Days: usersLast7Days ?? 0,
    usersPrev7Days: usersPrev7Days ?? 0,
    totalPages: totalPages ?? 0,
    publishedPages: publishedPages ?? 0,
    draftPages: draftPages ?? 0,
    pagesToday: pagesToday ?? 0,
    pagesThisWeek: pagesThisWeek ?? 0,
    pagesThisMonth: pagesThisMonth ?? 0,
    pagesLast7Days: pagesLast7Days ?? 0,
    pagesPrev7Days: pagesPrev7Days ?? 0,
    totalSubmissions: totalSubmissions ?? 0,
    submissionsToday: submissionsToday ?? 0,
    submissionsThisWeek: submissionsThisWeek ?? 0,
    submissionsThisMonth: submissionsThisMonth ?? 0,
    submissionsLast7Days: submissionsLast7Days ?? 0,
    submissionsPrev7Days: submissionsPrev7Days ?? 0,
    planDistribution: Array.from(planMap.values()),
  };
}

export type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;

export async function getDashboardTimeSeries() {
  await requireAdmin();
  const admin = createAdminClient();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29).toISOString();

  const [{ data: userRows }, { data: pageRows }, { data: submissionRows }] = await Promise.all([
    admin.from("profiles").select("created_at").gte("created_at", thirtyDaysAgo),
    admin.from("landing_pages").select("created_at").gte("created_at", thirtyDaysAgo),
    admin.from("form_submissions").select("created_at").gte("created_at", thirtyDaysAgo),
  ]);

  const days: DashboardTimeSeriesPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push({
      date: d.toISOString().split("T")[0],
      users: 0,
      pages: 0,
      submissions: 0,
    });
  }

  const dateIndex = new Map(days.map((d, i) => [d.date, i]));

  for (const row of userRows ?? []) {
    const idx = dateIndex.get(row.created_at.split("T")[0]);
    if (idx !== undefined) days[idx].users++;
  }
  for (const row of pageRows ?? []) {
    const idx = dateIndex.get(row.created_at.split("T")[0]);
    if (idx !== undefined) days[idx].pages++;
  }
  for (const row of submissionRows ?? []) {
    const idx = dateIndex.get(row.created_at.split("T")[0]);
    if (idx !== undefined) days[idx].submissions++;
  }

  return days;
}

export type DashboardTimeSeriesPoint = {
  date: string;
  users: number;
  pages: number;
  submissions: number;
};

export async function getRecentActivity() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: recentUsers }, { data: recentPages }, { data: recentSubmissions }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id, display_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      admin
        .from("landing_pages")
        .select("id, title, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      admin
        .from("form_submissions")
        .select("id, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const items: RecentActivityItem[] = [
    ...(recentUsers ?? []).map((u) => ({
      id: `user-${u.id}`,
      type: "user" as const,
      label: (u.display_name as string | null) || "משתמש חדש",
      meta: undefined as string | undefined,
      createdAt: u.created_at as string,
    })),
    ...(recentPages ?? []).map((p) => ({
      id: `page-${p.id}`,
      type: "page" as const,
      label: (p.title as string | null) || "עמוד ללא שם",
      meta: p.status as string | undefined,
      createdAt: p.created_at as string,
    })),
    ...(recentSubmissions ?? []).map((s) => ({
      id: `sub-${s.id}`,
      type: "submission" as const,
      label: "שליחת טופס",
      meta: undefined as string | undefined,
      createdAt: s.created_at as string,
    })),
  ];

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items.slice(0, 12);
}

export type RecentActivityItem = {
  id: string;
  type: "user" | "page" | "submission";
  label: string;
  meta?: string;
  createdAt: string;
};

// ── Users ──

async function fetchAllAuthUsers(admin: ReturnType<typeof createAdminClient>) {
  const result: { id: string; email: string; last_sign_in_at: string | null; banned_until: string | null }[] = [];
  let authPage = 1;
  while (true) {
    const { data } = await admin.auth.admin.listUsers({ page: authPage, perPage: 1000 });
    const users = data?.users ?? [];
    for (const u of users) {
      result.push({
        id: u.id,
        email: u.email ?? "",
        last_sign_in_at: u.last_sign_in_at ?? null,
        banned_until: (u as unknown as Record<string, unknown>).banned_until as string | null ?? null,
      });
    }
    if (users.length < 1000) break;
    authPage++;
  }
  return result;
}

function isBannedUser(bannedUntil: string | null): boolean {
  if (!bannedUntil) return false;
  return new Date(bannedUntil) > new Date();
}

export async function listUsers(
  opts: ListUsersOpts = {},
): Promise<{ rows: AdminUserRow[]; total: number; availablePlans: { id: string; slug: string; name_he: string }[] }> {
  await requireAdmin();
  const admin = createAdminClient();

  const {
    page = 0,
    pageSize = 50,
    search,
    roleFilter,
    planFilter,
    sortBy = "created_at",
    sortDir = "desc",
  } = opts;

  const [allAuthUsers, profilesResult, pageCountsResult, plansResult] = await Promise.all([
    fetchAllAuthUsers(admin),
    admin.from("profiles").select(
      "id, display_name, role, created_at, user_subscriptions(id, plan_id, status, current_period_end, subscription_plans(slug, name_he))",
    ),
    admin.from("landing_pages").select("user_id"),
    admin.from("subscription_plans").select("id, slug, name_he").order("slug"),
  ]);

  const emailMap = new Map<string, string>();
  const lastSignInMap = new Map<string, string | null>();
  const bannedMap = new Map<string, boolean>();
  for (const u of allAuthUsers) {
    emailMap.set(u.id, u.email);
    lastSignInMap.set(u.id, u.last_sign_in_at);
    bannedMap.set(u.id, isBannedUser(u.banned_until));
  }

  const countMap = new Map<string, number>();
  for (const row of pageCountsResult.data ?? []) {
    countMap.set(row.user_id, (countMap.get(row.user_id) ?? 0) + 1);
  }

  let rows: AdminUserRow[] = (profilesResult.data ?? []).map((p) => {
    const sub = p.user_subscriptions as unknown as {
      id: string;
      plan_id: string;
      status: string;
      current_period_end: string | null;
      subscription_plans: { slug: string; name_he: string } | null;
    } | null;
    return {
      id: p.id as string,
      display_name: p.display_name as string | null,
      email: emailMap.get(p.id as string) ?? "",
      role: p.role as string,
      plan_slug: sub?.subscription_plans?.slug ?? null,
      plan_name: sub?.subscription_plans?.name_he ?? null,
      plan_id: sub?.plan_id ?? null,
      page_count: countMap.get(p.id as string) ?? 0,
      created_at: p.created_at as string,
      last_sign_in_at: lastSignInMap.get(p.id as string) ?? null,
      is_banned: bannedMap.get(p.id as string) ?? false,
      subscription_status: sub?.status ?? null,
    };
  });

  if (search?.trim()) {
    const term = search.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.display_name?.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term),
    );
  }
  if (roleFilter && roleFilter !== "all") {
    rows = rows.filter((r) => r.role === roleFilter);
  }
  if (planFilter && planFilter !== "all") {
    rows = rows.filter((r) => r.plan_slug === planFilter);
  }

  rows.sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;
    if (sortBy === "display_name") {
      aVal = (a.display_name ?? a.email).toLowerCase();
      bVal = (b.display_name ?? b.email).toLowerCase();
    } else if (sortBy === "page_count") {
      aVal = a.page_count;
      bVal = b.page_count;
    } else {
      aVal = a.created_at;
      bVal = b.created_at;
    }
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === "desc" ? -cmp : cmp;
  });

  const total = rows.length;
  const from = page * pageSize;
  const paginatedRows = rows.slice(from, from + pageSize);

  return {
    rows: paginatedRows,
    total,
    availablePlans: (plansResult.data ?? []).map((p) => ({
      id: p.id as string,
      slug: p.slug as string,
      name_he: p.name_he as string,
    })),
  };
}

export async function updateUserRole(
  userId: string,
  role: "user" | "admin",
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin.from("profiles").update({ role }).eq("id", userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}

export async function getUserDetail(userId: string): Promise<AdminUserDetail | null> {
  await requireAdmin();
  const admin = createAdminClient();

  const [profileResult, authUserResult, pagesResult, plansResult] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, display_name, role, created_at, user_subscriptions(id, plan_id, status, current_period_end, subscription_plans(slug, name_he))",
      )
      .eq("id", userId)
      .maybeSingle(),
    admin.auth.admin.getUserById(userId),
    admin
      .from("landing_pages")
      .select("id, slug, title, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    admin.from("subscription_plans").select("id, slug, name_he").order("slug"),
  ]);

  const profile = profileResult.data;
  if (!profile) return null;

  const authUser = authUserResult.data.user;

  const pageIds = (pagesResult.data ?? []).map((p) => p.id);
  let totalSubmissions = 0;
  if (pageIds.length > 0) {
    const { count } = await admin
      .from("form_submissions")
      .select("id", { count: "exact", head: true })
      .in("landing_page_id", pageIds);
    totalSubmissions = count ?? 0;
  }

  let storageBytes = 0;
  try {
    const { data: files } = await admin.storage.from("landing-media").list(userId, { limit: 1000 });
    if (files) {
      for (const file of files) {
        storageBytes += (file.metadata as Record<string, unknown>)?.size as number ?? 0;
      }
    }
  } catch {
    // Storage listing may fail if no files exist; ignore
  }

  const sub = profile.user_subscriptions as unknown as {
    id: string;
    plan_id: string;
    status: string;
    current_period_end: string | null;
    subscription_plans: { slug: string; name_he: string } | null;
  } | null;

  const bannedUntil = (authUser as unknown as Record<string, unknown> | null)?.banned_until as string | null ?? null;

  return {
    id: profile.id as string,
    display_name: profile.display_name as string | null,
    email: authUser?.email ?? "",
    role: profile.role as string,
    plan_slug: sub?.subscription_plans?.slug ?? null,
    plan_name: sub?.subscription_plans?.name_he ?? null,
    plan_id: sub?.plan_id ?? null,
    page_count: (pagesResult.data ?? []).length,
    created_at: profile.created_at as string,
    last_sign_in_at: authUser?.last_sign_in_at ?? null,
    is_banned: isBannedUser(bannedUntil),
    subscription_status: sub?.status ?? null,
    pages: (pagesResult.data ?? []).map((p) => ({
      id: p.id as string,
      slug: p.slug as string,
      title: p.title as string,
      status: p.status as string,
      created_at: p.created_at as string,
    })),
    total_submissions: totalSubmissions,
    storage_bytes: storageBytes,
    subscription_plan_id: sub?.plan_id ?? null,
    current_period_end: sub?.current_period_end ?? null,
    available_plans: (plansResult.data ?? []).map((p) => ({
      id: p.id as string,
      slug: p.slug as string,
      name_he: p.name_he as string,
    })),
  };
}

export async function updateUserPlan(
  userId: string,
  planId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("user_subscriptions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  const { error } = existing
    ? await admin
        .from("user_subscriptions")
        .update({ plan_id: planId, status: "active" })
        .eq("user_id", userId)
    : await admin
        .from("user_subscriptions")
        .insert({ user_id: userId, plan_id: planId, status: "active" });

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function disableUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: "876600h",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function enableUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: "none",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function impersonateUser(
  userId: string,
): Promise<{ ok: boolean; link?: string; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: authData } = await admin.auth.admin.getUserById(userId);
  const email = authData.user?.email;
  if (!email) return { ok: false, error: "User has no email" };

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, link: data.properties?.action_link };
}

export async function sendAdminPasswordReset(
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: authData } = await admin.auth.admin.getUserById(userId);
  const email = authData.user?.email;
  if (!email) return { ok: false, error: "User has no email" };

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${site}/auth/callback?next=/auth/update-password`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function exportUsersCsv(): Promise<{ ok: boolean; csv?: string; error?: string }> {
  const { rows } = await listUsers({ page: 0, pageSize: 10000 });

  const header = "ID,שם,אימייל,תפקיד,מנוי,עמודים,כניסה אחרונה,סטטוס,תאריך הרשמה\n";
  const csvRows = rows.map((r) => {
    return [
      r.id,
      r.display_name ?? "",
      r.email,
      r.role,
      r.plan_name ?? "",
      r.page_count,
      r.last_sign_in_at ? new Date(r.last_sign_in_at).toLocaleDateString("he-IL") : "",
      r.is_banned ? "מושבת" : "פעיל",
      new Date(r.created_at).toLocaleDateString("he-IL"),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
  });

  return { ok: true, csv: header + csvRows.join("\n") };
}

// ── Section definitions ──

export async function listSectionDefinitions() {
  await requireAdmin();
  const admin = createAdminClient();
  await ensureSplitHeroSectionDefinitions(admin);
  await ensureHeroVariantSectionDefinitions(admin);
  await ensureChecklistSectionDefinitionSync(admin);
  await ensureFooterSectionDefinitions(admin);
  await ensureGallerySectionDefinitions(admin);
  await ensureFaqSectionDefinitions(admin);
  await ensureTestimonialsAndChecklistTextSectionDefinitions(admin);

  const { data: defs } = await admin.from("section_definitions").select("*").order("sort_order");

  return defs ?? [];
}

export async function getSectionDefinition(key: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await ensureSplitHeroSectionDefinitions(admin);
  await ensureHeroVariantSectionDefinitions(admin);
  await ensureChecklistSectionDefinitionSync(admin);
  await ensureFooterSectionDefinitions(admin);
  await ensureGallerySectionDefinitions(admin);
  await ensureFaqSectionDefinitions(admin);
  await ensureTestimonialsAndChecklistTextSectionDefinitions(admin);

  const { data: def } = await admin
    .from("section_definitions")
    .select("*")
    .eq("key", key)
    .single();

  const { data: categories } = await admin
    .from("section_categories")
    .select("*")
    .order("sort_order");

  return { definition: def, categories: categories ?? [] };
}

export async function upsertSectionDefinition(input: {
  key: string;
  title_he: string;
  description_he: string;
  category_slug: string;
  enabled: boolean;
  sort_order: number;
  preview_image_url?: string | null;
  style_overrides?: SectionStyleOverrides;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const parsedStyle = sectionStyleOverridesSchema.safeParse(input.style_overrides ?? {});
  if (!parsedStyle.success) return { ok: false, error: "ערכי עיצוב לא תקינים" };

  const baseRow = {
    key: input.key,
    title_he: input.title_he,
    description_he: input.description_he,
    category_slug: input.category_slug,
    enabled: input.enabled,
    sort_order: input.sort_order,
    preview_image_url: input.preview_image_url ?? null,
  };

  const { error } = await admin
    .from("section_definitions")
    .upsert({ ...baseRow, style_overrides: parsedStyle.data }, { onConflict: "key" });

  if (error) {
    // PGRST205 = column not found in schema cache (migration not applied yet).
    // Fall back to saving without style_overrides so the rest of the data isn't lost.
    if (error.code === "PGRST205" || error.message.includes("style_overrides")) {
      const { error: fallbackError } = await admin
        .from("section_definitions")
        .upsert(baseRow, { onConflict: "key" });
      if (fallbackError) return { ok: false, error: fallbackError.message };
      revalidatePath("/admin/sections");
      return {
        ok: false,
        error:
          "נשמר — אך הגדרות עיצוב לא נשמרו: עמודת style_overrides חסרה במסד הנתונים. " +
          "הרץ: ALTER TABLE public.section_definitions ADD COLUMN IF NOT EXISTS style_overrides jsonb NOT NULL DEFAULT '{}'::jsonb; " +
          "בדשבורד Supabase (SQL Editor) כדי לתקן.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/sections");
  return { ok: true };
}

export async function toggleSectionEnabled(
  key: string,
  enabled: boolean,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("section_definitions")
    .update({ enabled })
    .eq("key", key);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/sections");
  return { ok: true };
}

export async function updateSectionCategory(
  key: string,
  category_slug: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  const trimmed = category_slug.trim();
  if (!trimmed) {
    return { ok: false, error: "קטגוריה לא תקינה" };
  }

  const { data: cat } = await admin
    .from("section_categories")
    .select("slug")
    .eq("slug", trimmed)
    .maybeSingle();
  if (!cat) {
    return { ok: false, error: "קטגוריה לא קיימת" };
  }

  const { error } = await admin
    .from("section_definitions")
    .update({ category_slug: trimmed })
    .eq("key", key);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/sections");
  revalidatePath(`/admin/sections/${key}`);
  return { ok: true };
}

export type SectionLibraryBatchRow = {
  key: string;
  enabled: boolean;
  category_slug: string;
};

/**
 * עדכון מרוכז של הפעלה וקטגוריה לסקשנים בספרייה — קריאת שרת אחת, עדכונים רצופים במסד.
 */
export async function saveSectionLibraryBatch(
  updates: SectionLibraryBatchRow[],
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!updates.length) return { ok: true };

  const admin = createAdminClient();

  const normalized = updates.map((u) => ({
    key: u.key.trim(),
    enabled: u.enabled,
    category_slug: u.category_slug.trim(),
  }));

  for (const u of normalized) {
    if (!u.key || u.key.length > 200) {
      return { ok: false, error: "מזהה סקשן לא תקין" };
    }
    if (!u.category_slug) {
      return { ok: false, error: "קטגוריה לא תקינה" };
    }
  }

  const slugSet = [...new Set(normalized.map((u) => u.category_slug))];
  const { data: cats, error: catErr } = await admin
    .from("section_categories")
    .select("slug")
    .in("slug", slugSet);
  if (catErr) return { ok: false, error: catErr.message };
  const validSlugs = new Set((cats ?? []).map((c) => c.slug as string));
  for (const s of slugSet) {
    if (!validSlugs.has(s)) return { ok: false, error: "קטגוריה לא קיימת" };
  }

  const keys = normalized.map((u) => u.key);
  const { data: defs, error: defErr } = await admin
    .from("section_definitions")
    .select("key")
    .in("key", keys);
  if (defErr) return { ok: false, error: defErr.message };
  const haveKeys = new Set((defs ?? []).map((d) => d.key as string));
  for (const u of normalized) {
    if (!haveKeys.has(u.key)) return { ok: false, error: "סקשן לא קיים" };
  }

  for (const u of normalized) {
    const { error } = await admin
      .from("section_definitions")
      .update({ enabled: u.enabled, category_slug: u.category_slug })
      .eq("key", u.key);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/sections");
  for (const u of normalized) {
    revalidatePath(`/admin/sections/${u.key}`);
  }
  return { ok: true };
}

const PROTECTED_FROM_GLOBAL_DELETE = new Set<string>(SPLIT_HERO_SECTION_KEYS);

/**
 * מוחק הגדרת סקשן מהקטלוג ומכל דפי הנחיתה (page_sections) ומעדכן תבניות.
 */
export async function deleteSectionDefinitionGlobally(
  key: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const trimmed = key.trim();
  if (!trimmed || trimmed.length > 200) {
    return { ok: false, error: "מזהה סקשן לא תקין" };
  }
  if (PROTECTED_FROM_GLOBAL_DELETE.has(trimmed)) {
    return { ok: false, error: he.adminDeleteSectionProtected };
  }

  const admin = createAdminClient();

  const { error: psErr } = await admin.from("page_sections").delete().eq("section_key", trimmed);
  if (psErr) return { ok: false, error: psErr.message };

  const { data: templates, error: tFetchErr } = await admin
    .from("templates")
    .select("id, default_section_keys");
  if (tFetchErr) return { ok: false, error: tFetchErr.message };

  for (const t of templates ?? []) {
    const keys = t.default_section_keys;
    if (!Array.isArray(keys) || !keys.includes(trimmed)) continue;
    const next = keys.filter((k: unknown) => k !== trimmed);
    const { error: tUpErr } = await admin
      .from("templates")
      .update({ default_section_keys: next })
      .eq("id", t.id);
    if (tUpErr) return { ok: false, error: tUpErr.message };
  }

  const { error: sdErr } = await admin.from("section_definitions").delete().eq("key", trimmed);
  if (sdErr) return { ok: false, error: sdErr.message };

  revalidatePath("/admin/sections");
  revalidatePath(`/admin/sections/${trimmed}`);
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/pages", "layout");
  return { ok: true };
}

// ── Categories ──

export async function listCategories() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data } = await admin
    .from("section_categories")
    .select("*")
    .order("sort_order");

  return data ?? [];
}

export async function upsertCategory(input: {
  slug: string;
  name_he: string;
  sort_order: number;
  isNew?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  if (input.isNew) {
    const { error } = await admin.from("section_categories").insert({
      slug: input.slug,
      name_he: input.name_he,
      sort_order: input.sort_order,
    });
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin
      .from("section_categories")
      .update({ name_he: input.name_he, sort_order: input.sort_order })
      .eq("slug", input.slug);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/sections");
  return { ok: true };
}

export async function deleteCategory(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { count } = await admin
    .from("section_definitions")
    .select("key", { count: "exact", head: true })
    .eq("category_slug", slug);

  if ((count ?? 0) > 0) {
    return { ok: false, error: "לא ניתן למחוק קטגוריה שמכילה סקשנים" };
  }

  const { error } = await admin.from("section_categories").delete().eq("slug", slug);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function updateCategoryOrder(
  orderedSlugs: string[],
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  for (let i = 0; i < orderedSlugs.length; i++) {
    await admin
      .from("section_categories")
      .update({ sort_order: i })
      .eq("slug", orderedSlugs[i]);
  }

  revalidatePath("/admin/categories");
  return { ok: true };
}

// ── System settings ──

export async function getSystemSettings() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data } = await admin
    .from("system_settings")
    .select("*")
    .order("key");

  return data ?? [];
}

export async function updateSystemSetting(
  key: string,
  value: unknown,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("system_settings")
    .upsert({ key, value: value as object }, { onConflict: "key" });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings");
  return { ok: true };
}
