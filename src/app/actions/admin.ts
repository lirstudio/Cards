"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { he } from "@/lib/i18n/he";
import {
  CHECKLIST_SECTION_LEGACY_METADATA,
  sectionCatalog,
} from "@/lib/sections/catalog";
import type { SectionKey } from "@/lib/sections/schemas";
import { sectionStyleOverridesSchema, type SectionStyleOverrides } from "@/types/admin";

const SPLIT_HERO_SECTION_KEYS = [
  "site_header_nav",
  "hero_image_split",
  "stats_highlight_row",
] as const satisfies readonly SectionKey[];

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

// פריסות ישנות שכבר לא קיימות בקוד — נמחקות אוטומטית מה-DB
const TESTIMONIALS_OBSOLETE_LAYOUTS = new Set([
  "grid",
  "grid_three",
  "featured_carousel",
  "vertical_stack",
]);

// כרטיסי העיצוב החדשים — כל אחד עיצוב שונה לגמרי
const TESTIMONIALS_PRESETS: Array<{
  layout: "marquee" | "photo_cards" | "star_cards" | "quote_side" | "cinematic";
  name_he: string;
  isDefault: boolean;
}> = [
  { layout: "marquee", name_he: "כרטיסים נגללים", isDefault: true },
  { layout: "photo_cards", name_he: "כרטיסי תמונה", isDefault: false },
  { layout: "star_cards", name_he: "כרטיסי כוכבים", isDefault: false },
  { layout: "quote_side", name_he: "ציטוט עם תמונה", isDefault: false },
  { layout: "cinematic", name_he: "קולנועי", isDefault: false },
];

function testimonialsLayoutKeyFromOverrides(o: Record<string, unknown> | null): {
  key: string;
  obsolete: boolean;
} {
  if (!o || typeof o !== "object") return { key: "marquee", obsolete: false };
  const raw = o.testimonialsLayout;
  if (typeof raw === "string" && raw.length > 0) {
    if (TESTIMONIALS_OBSOLETE_LAYOUTS.has(raw)) return { key: raw, obsolete: true };
    return { key: raw, obsolete: false };
  }
  return { key: "marquee", obsolete: false };
}

/** מסיר רקע מכרטיסי עיצוב — הרקע מגיע רק מערכת הנושא של העמוד */
async function stripSurfaceBackgroundFromAllVariants(
  admin: ReturnType<typeof createAdminClient>,
): Promise<boolean> {
  const { data: rows } = await admin.from("section_variants").select("id, style_overrides");
  let changed = false;
  for (const r of rows ?? []) {
    const o = r.style_overrides as Record<string, unknown> | null;
    if (!o || typeof o !== "object" || !("backgroundColor" in o)) continue;
    const next = { ...o };
    delete next.backgroundColor;
    const parsed = sectionStyleOverridesSchema.safeParse(next);
    if (!parsed.success) continue;
    const { error } = await admin
      .from("section_variants")
      .update({ style_overrides: parsed.data })
      .eq("id", r.id);
    if (!error) changed = true;
  }
  return changed;
}

/**
 * מבטיח כרטיסי testimonials_row: ללא כפילויות (וריאנט אחד לכל layout), ללא פריסות ישנות,
 * ברירת מחדל = marquee, וזריעת עיצובים חסרים.
 */
async function ensureTestimonialsSectionVariants(
  admin: ReturnType<typeof createAdminClient>,
): Promise<void> {
  const SECTION_KEY = "testimonials_row";

  const { data: def } = await admin
    .from("section_definitions")
    .select("description_he")
    .eq("key", SECTION_KEY)
    .maybeSingle();
  if (def) {
    const want = sectionCatalog.testimonials_row.descriptionHe;
    if (def.description_he !== want) {
      await admin.from("section_definitions").update({ description_he: want }).eq("key", SECTION_KEY);
    }
  }

  const { data: rows } = await admin
    .from("section_variants")
    .select("id, style_overrides, is_default, sort_order")
    .eq("section_key", SECTION_KEY);

  let changed = false;

  const obsoleteIds: string[] = [];
  const byLayout = new Map<
    string,
    { id: string; is_default: boolean; sort_order: number }[]
  >();

  for (const r of rows ?? []) {
    const o = r.style_overrides as Record<string, unknown> | null;
    const { key, obsolete } = testimonialsLayoutKeyFromOverrides(o);
    if (obsolete) {
      obsoleteIds.push(r.id);
      continue;
    }
    const list = byLayout.get(key) ?? [];
    list.push({
      id: r.id,
      is_default: r.is_default === true,
      sort_order: typeof r.sort_order === "number" ? r.sort_order : 0,
    });
    byLayout.set(key, list);
  }

  for (const id of obsoleteIds) {
    await admin.from("section_variants").delete().eq("id", id);
    changed = true;
  }

  const duplicateMigrations: { dropId: string; keepId: string }[] = [];
  const survivingByLayout = new Map<string, string>();

  for (const [layout, group] of byLayout) {
    if (group.length <= 1) {
      survivingByLayout.set(layout, group[0]!.id);
      continue;
    }
    const sorted = [...group].sort((a, b) => {
      if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.id.localeCompare(b.id);
    });
    const keeper = sorted[0]!.id;
    survivingByLayout.set(layout, keeper);
    for (let i = 1; i < sorted.length; i++) {
      duplicateMigrations.push({ dropId: sorted[i]!.id, keepId: keeper });
    }
  }

  for (const { dropId, keepId } of duplicateMigrations) {
    await admin.from("page_sections").update({ variant_id: keepId }).eq("variant_id", dropId);
  }
  for (const { dropId } of duplicateMigrations) {
    await admin.from("section_variants").delete().eq("id", dropId);
    changed = true;
  }

  const marqueeId = survivingByLayout.get("marquee");
  if (marqueeId) {
    const { data: defRows } = await admin
      .from("section_variants")
      .select("id, is_default")
      .eq("section_key", SECTION_KEY);
    const defaults = (defRows ?? []).filter((r) => r.is_default);
    const needsDefaultFix = defaults.length !== 1 || defaults[0]!.id !== marqueeId;
    if (needsDefaultFix) {
      await admin.from("section_variants").update({ is_default: false }).eq("section_key", SECTION_KEY);
      await admin.from("section_variants").update({ is_default: true }).eq("id", marqueeId);
      changed = true;
    }
  }

  const existingLayouts = new Set(survivingByLayout.keys());

  const { data: maxRow } = await admin
    .from("section_variants")
    .select("sort_order")
    .eq("section_key", SECTION_KEY)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let nextOrder = (maxRow?.sort_order ?? -1) + 1;

  for (const p of TESTIMONIALS_PRESETS) {
    if (existingLayouts.has(p.layout)) continue;

    const parsed = sectionStyleOverridesSchema.safeParse({ testimonialsLayout: p.layout });
    if (!parsed.success) continue;

    if (p.isDefault) {
      await admin.from("section_variants").update({ is_default: false }).eq("section_key", SECTION_KEY);
    }

    const { error } = await admin.from("section_variants").insert({
      section_key: SECTION_KEY,
      name_he: p.name_he,
      style_overrides: parsed.data,
      is_default: p.isDefault,
      enabled: true,
      sort_order: nextOrder++,
    });

    if (error) {
      console.error("ensureTestimonialsSectionVariants insert", p.layout, error.message);
      continue;
    }

    existingLayouts.add(p.layout);
    changed = true;
  }

  const stripChanged = await stripSurfaceBackgroundFromAllVariants(admin);
  if (stripChanged) changed = true;

  if (changed) {
    revalidatePath("/admin/sections");
    revalidatePath(`/admin/sections/${SECTION_KEY}`);
    revalidatePath("/dashboard", "layout");
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

  const [
    { count: totalUsers },
    { count: usersToday },
    { count: usersThisWeek },
    { count: usersThisMonth },
    { count: totalPages },
    { count: publishedPages },
    { count: draftPages },
    { count: pagesToday },
    { count: pagesThisWeek },
    { count: pagesThisMonth },
    { count: totalSubmissions },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    admin.from("landing_pages").select("id", { count: "exact", head: true }),
    admin.from("landing_pages").select("id", { count: "exact", head: true }).eq("status", "published"),
    admin.from("landing_pages").select("id", { count: "exact", head: true }).eq("status", "draft"),
    admin.from("landing_pages").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
    admin.from("landing_pages").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
    admin.from("landing_pages").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    admin.from("form_submissions").select("id", { count: "exact", head: true }),
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
    totalPages: totalPages ?? 0,
    publishedPages: publishedPages ?? 0,
    draftPages: draftPages ?? 0,
    pagesToday: pagesToday ?? 0,
    pagesThisWeek: pagesThisWeek ?? 0,
    pagesThisMonth: pagesThisMonth ?? 0,
    totalSubmissions: totalSubmissions ?? 0,
    planDistribution: Array.from(planMap.values()),
  };
}

// ── Users ──

export async function listUsers(page = 0, pageSize = 50) {
  await requireAdmin();
  const admin = createAdminClient();

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data: profiles, count } = await admin
    .from("profiles")
    .select(
      "id, display_name, role, created_at, user_subscriptions(subscription_plans(slug, name_he))",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: authData } = await admin.auth.admin.listUsers({ page: page + 1, perPage: pageSize });

  const emailMap = new Map<string, string>();
  for (const u of authData?.users ?? []) {
    emailMap.set(u.id, u.email ?? "");
  }

  const { data: pageCounts } = await admin
    .from("landing_pages")
    .select("user_id");

  const countMap = new Map<string, number>();
  for (const row of pageCounts ?? []) {
    countMap.set(row.user_id, (countMap.get(row.user_id) ?? 0) + 1);
  }

  const rows = (profiles ?? []).map((p) => {
    const sub = p.user_subscriptions as unknown as {
      subscription_plans: { slug: string; name_he: string } | null;
    } | null;
    return {
      id: p.id as string,
      display_name: p.display_name as string | null,
      email: emailMap.get(p.id as string) ?? "",
      role: p.role as string,
      plan_slug: sub?.subscription_plans?.slug ?? null,
      plan_name: sub?.subscription_plans?.name_he ?? null,
      page_count: countMap.get(p.id as string) ?? 0,
      created_at: p.created_at as string,
    };
  });

  return { rows, total: count ?? 0 };
}

export async function updateUserRole(
  userId: string,
  role: "user" | "admin",
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/users");
  return { ok: true };
}

// ── Section definitions ──

export async function listSectionDefinitions() {
  await requireAdmin();
  const admin = createAdminClient();
  await ensureSplitHeroSectionDefinitions(admin);
  await ensureChecklistSectionDefinitionSync(admin);
  await ensureTestimonialsSectionVariants(admin);

  const { data: defs } = await admin
    .from("section_definitions")
    .select("*, section_variants(id)")
    .order("sort_order");

  return (defs ?? []).map((d) => ({
    ...d,
    variant_count: Array.isArray(d.section_variants) ? d.section_variants.length : 0,
  }));
}

export async function getSectionDefinition(key: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await ensureSplitHeroSectionDefinitions(admin);
  await ensureChecklistSectionDefinitionSync(admin);
  await ensureTestimonialsSectionVariants(admin);

  const { data: def } = await admin
    .from("section_definitions")
    .select("*")
    .eq("key", key)
    .single();

  const { data: variants } = await admin
    .from("section_variants")
    .select("*")
    .eq("section_key", key)
    .order("sort_order");

  const { data: categories } = await admin
    .from("section_categories")
    .select("*")
    .order("sort_order");

  return { definition: def, variants: variants ?? [], categories: categories ?? [] };
}

export async function upsertSectionDefinition(input: {
  key: string;
  title_he: string;
  description_he: string;
  category_slug: string;
  enabled: boolean;
  sort_order: number;
  preview_image_url?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("section_definitions")
    .upsert(
      {
        key: input.key,
        title_he: input.title_he,
        description_he: input.description_he,
        category_slug: input.category_slug,
        enabled: input.enabled,
        sort_order: input.sort_order,
        preview_image_url: input.preview_image_url ?? null,
      },
      { onConflict: "key" },
    );

  if (error) return { ok: false, error: error.message };
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

const PROTECTED_FROM_GLOBAL_DELETE = new Set<string>(SPLIT_HERO_SECTION_KEYS);

/**
 * מוחק הגדרת סקשן מהקטלוג ומכל דפי הנחיתה (page_sections), מעדכן תבניות,
 * ומוחק כרטיסי עיצוב (CASCADE מ־section_definitions).
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

// ── Section variants ──

export async function upsertSectionVariant(input: {
  id?: string;
  section_key: string;
  name_he: string;
  style_overrides: SectionStyleOverrides;
  is_default: boolean;
  enabled: boolean;
  sort_order: number;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const parsed = sectionStyleOverridesSchema.safeParse(input.style_overrides);
  if (!parsed.success) return { ok: false, error: "ערכי עיצוב לא תקינים" };

  if (input.is_default) {
    await admin
      .from("section_variants")
      .update({ is_default: false })
      .eq("section_key", input.section_key);
  }

  const row = {
    section_key: input.section_key,
    name_he: input.name_he,
    style_overrides: parsed.data,
    is_default: input.is_default,
    enabled: input.enabled,
    sort_order: input.sort_order,
  };

  if (input.id) {
    const { error } = await admin
      .from("section_variants")
      .update(row)
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin.from("section_variants").insert(row);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/sections");
  revalidatePath(`/admin/sections/${input.section_key}`);
  /* כרטיסי עיצוב נטענים בעורך העמוד — ללא זה יישאר מטמון ישן */
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function deleteSectionVariant(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin.from("section_variants").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/sections");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

/** מחיקת מספר כרטיסי עיצוב לסקשן אחד (אימות section_key). */
export async function deleteSectionVariants(
  sectionKey: string,
  ids: string[],
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  const key = sectionKey.trim();
  if (!key) return { ok: false, error: "מזהה סקשן לא תקין" };

  const cleaned = [...new Set(ids.map((id) => String(id).trim()).filter(Boolean))];
  if (cleaned.length === 0) return { ok: true };

  const { error } = await admin
    .from("section_variants")
    .delete()
    .eq("section_key", key)
    .in("id", cleaned);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/sections");
  revalidatePath(`/admin/sections/${key}`);
  revalidatePath("/dashboard", "layout");
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
