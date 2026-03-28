"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDefaultContent } from "@/lib/sections/defaults";
import type { SectionKey } from "@/lib/sections/schemas";
import {
  SECTION_KEYS,
  isLegacyNavHeroStatsKey,
  safeParseLegacyNavHeroStats,
  safeParseSectionContent,
} from "@/lib/sections/schemas";
import { getUserQuota } from "@/lib/subscription";
import { isReservedSlug } from "@/lib/reserved-slugs";
import type { PageTheme } from "@/types/landing";
import { he } from "@/lib/i18n/he";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function defaultVariantIdForSection(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sectionKey: SectionKey,
): Promise<string | null> {
  const { data } = await supabase
    .from("section_variants")
    .select("id")
    .eq("section_key", sectionKey)
    .eq("enabled", true)
    .eq("is_default", true)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

export async function createLandingPageFromTemplate(
  templateSlug: string,
  rawSlug: string,
  title: string,
): Promise<{ ok: true; pageId: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const quota = await getUserQuota(supabase, user.id);
  if (!quota?.canCreate) return { ok: false, error: he.quotaExceeded };

  const slug = slugify(rawSlug) || `page-${Date.now().toString(36)}`;
  if (isReservedSlug(slug)) return { ok: false, error: "שם כתובת לא זמין" };

  const { data: template } = await supabase
    .from("templates")
    .select("id,tier")
    .eq("slug", templateSlug)
    .maybeSingle();

  if (!template) return { ok: false, error: "תבנית לא נמצאה" };
  if (template.tier > quota.allowedTier) {
    return { ok: false, error: "התבנית דורשת שדרוג מנוי" };
  }

  const { data: page, error: pageError } = await supabase
    .from("landing_pages")
    .insert({
      user_id: user.id,
      template_id: template.id,
      slug,
      title: title || slug,
      status: "draft",
      theme: {
        primary: "#0b43b4",
        background: "#f8f9fa",
        heading: "#000000",
        body: "#4b5563",
      } satisfies PageTheme,
    })
    .select("id")
    .single();

  if (pageError || !page) {
    if (pageError?.code === "23505") return { ok: false, error: "כתובת זו כבר תפוסה" };
    return { ok: false, error: pageError?.message ?? "שגיאה ביצירה" };
  }

  revalidatePath("/dashboard");
  return { ok: true, pageId: page.id };
}

export async function updateSectionOrder(
  pageId: string,
  orderedSectionIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data: page } = await supabase
    .from("landing_pages")
    .select("id,slug")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!page) return { ok: false, error: "אין גישה" };

  for (let i = 0; i < orderedSectionIds.length; i++) {
    await supabase
      .from("page_sections")
      .update({ sort_order: i })
      .eq("id", orderedSectionIds[i])
      .eq("landing_page_id", pageId);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${page.slug}`);
  return { ok: true };
}

export async function updateSectionContentJson(
  pageId: string,
  sectionId: string,
  sectionKey: string,
  jsonText: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data: page } = await supabase
    .from("landing_pages")
    .select("slug")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!page) return { ok: false, error: "אין גישה" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: "JSON לא תקין" };
  }

  if (isLegacyNavHeroStatsKey(sectionKey)) {
    const check = safeParseLegacyNavHeroStats(parsed);
    if (!check.success) return { ok: false, error: he.contentInvalid };
    await supabase
      .from("page_sections")
      .update({ content: check.data as object })
      .eq("id", sectionId)
      .eq("landing_page_id", pageId);
    revalidatePath("/dashboard");
    revalidatePath(`/${page.slug}`);
    return { ok: true };
  }

  if (!SECTION_KEYS.includes(sectionKey as SectionKey)) {
    return { ok: false, error: "סקשן לא מוכר" };
  }
  const sk = sectionKey as SectionKey;
  const check = safeParseSectionContent(sk, parsed);
  if (!check.success) return { ok: false, error: he.contentInvalid };

  await supabase
    .from("page_sections")
    .update({ content: check.data as object })
    .eq("id", sectionId)
    .eq("landing_page_id", pageId);

  revalidatePath("/dashboard");
  revalidatePath(`/${page.slug}`);
  return { ok: true };
}

export async function updatePageTheme(
  pageId: string,
  theme: PageTheme,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data: page } = await supabase
    .from("landing_pages")
    .select("slug")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!page) return { ok: false, error: "אין גישה" };

  await supabase.from("landing_pages").update({ theme }).eq("id", pageId);

  revalidatePath("/dashboard");
  revalidatePath(`/${page.slug}`);
  return { ok: true };
}

export async function setPagePublished(
  pageId: string,
  published: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data: page } = await supabase
    .from("landing_pages")
    .select("slug")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!page) return { ok: false, error: "אין גישה" };

  await supabase
    .from("landing_pages")
    .update({
      status: published ? "published" : "draft",
      published_at: published ? new Date().toISOString() : null,
    })
    .eq("id", pageId);

  revalidatePath("/dashboard");
  revalidatePath(`/${page.slug}`);
  return { ok: true };
}

export async function updatePageSettings(
  pageId: string,
  input: {
    title: string;
    rawSlug: string;
    theme: PageTheme;
    published: boolean;
  },
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data: row } = await supabase
    .from("landing_pages")
    .select("slug,status")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!row) return { ok: false, error: "אין גישה" };

  const slugOld = row.slug as string;
  const wasPublished = row.status === "published";
  const nextSlug = slugify(input.rawSlug) || slugOld;
  if (nextSlug !== slugOld && isReservedSlug(nextSlug)) {
    return { ok: false, error: "שם כתובת לא זמין" };
  }

  const theme: PageTheme = { ...input.theme };
  if (theme.siteLogoUrl !== undefined && !String(theme.siteLogoUrl).trim()) {
    delete theme.siteLogoUrl;
  }
  if (!theme.noSectionAnimations) {
    delete theme.noSectionAnimations;
  }

  const updates: Record<string, unknown> = {
    title: input.title.trim() || nextSlug,
    slug: nextSlug,
    theme,
    status: input.published ? "published" : "draft",
  };
  if (input.published) {
    if (!wasPublished) {
      updates.published_at = new Date().toISOString();
    }
  } else {
    updates.published_at = null;
  }

  const { error } = await supabase.from("landing_pages").update(updates).eq("id", pageId);

  if (error) {
    if (error.code === "23505") return { ok: false, error: "כתובת זו כבר תפוסה" };
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${slugOld}`);
  if (nextSlug !== slugOld) {
    revalidatePath(`/${nextSlug}`);
  }
  return { ok: true };
}

export async function addSectionToPage(
  pageId: string,
  sectionKey: SectionKey,
): Promise<{ ok: boolean; error?: string; sectionId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data: page } = await supabase
    .from("landing_pages")
    .select("slug")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!page) return { ok: false, error: "אין גישה" };

  const { count } = await supabase
    .from("page_sections")
    .select("id", { count: "exact", head: true })
    .eq("landing_page_id", pageId);

  const sortOrder = count ?? 0;
  const variantId = await defaultVariantIdForSection(supabase, sectionKey);

  const { data: inserted, error } = await supabase
    .from("page_sections")
    .insert({
      landing_page_id: pageId,
      section_key: sectionKey,
      sort_order: sortOrder,
      content: getDefaultContent(sectionKey),
      visible: true,
      ...(variantId ? { variant_id: variantId } : {}),
    })
    .select("id")
    .single();

  if (error || !inserted) return { ok: false, error: error?.message ?? "שגיאה" };

  revalidatePath("/dashboard");
  revalidatePath(`/${page.slug}`);
  return { ok: true, sectionId: inserted.id };
}

/** מוסיף סקשן חדש במיקום index (0 = ראשון). אם מועבר content — מאומת מול הסכימה לפני השמירה. */
export async function insertSectionAt(
  pageId: string,
  sectionKey: SectionKey,
  index: number,
  contentOverride?: Record<string, unknown>,
  /** מזהה וריאנט שנבחר בעורך; אם לא הועבר — נטען וריאנט ברירת־מחדל מה־DB */
  explicitVariantId?: string,
): Promise<{ ok: boolean; error?: string; sectionId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data: page } = await supabase
    .from("landing_pages")
    .select("slug")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!page) return { ok: false, error: "אין גישה" };

  let contentToInsert: Record<string, unknown>;
  if (contentOverride !== undefined) {
    const check = safeParseSectionContent(sectionKey, contentOverride);
    if (!check.success) return { ok: false, error: he.contentInvalid };
    contentToInsert = check.data as Record<string, unknown>;
  } else {
    contentToInsert = getDefaultContent(sectionKey);
  }

  const { data: rows } = await supabase
    .from("page_sections")
    .select("id")
    .eq("landing_page_id", pageId)
    .order("sort_order", { ascending: true });

  const ids = (rows ?? []).map((r) => r.id);
  const insertIndex = Math.max(0, Math.min(index, ids.length));
  let variantId: string | null = null;
  if (explicitVariantId !== undefined && String(explicitVariantId).trim() !== "") {
    variantId = String(explicitVariantId).trim();
  } else {
    variantId = await defaultVariantIdForSection(supabase, sectionKey);
  }

  const { data: inserted, error: insErr } = await supabase
    .from("page_sections")
    .insert({
      landing_page_id: pageId,
      section_key: sectionKey,
      sort_order: insertIndex,
      content: contentToInsert,
      visible: true,
      ...(variantId ? { variant_id: variantId } : {}),
    })
    .select("id")
    .single();

  if (insErr || !inserted) return { ok: false, error: insErr?.message ?? "שגיאה" };

  const newOrder = [...ids.slice(0, insertIndex), inserted.id, ...ids.slice(insertIndex)];
  for (let i = 0; i < newOrder.length; i++) {
    await supabase
      .from("page_sections")
      .update({ sort_order: i })
      .eq("id", newOrder[i])
      .eq("landing_page_id", pageId);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${page.slug}`);
  return { ok: true, sectionId: inserted.id };
}

export async function updateSectionContent(
  pageId: string,
  sectionId: string,
  sectionKey: string,
  content: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data: page } = await supabase
    .from("landing_pages")
    .select("slug")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!page) return { ok: false, error: "אין גישה" };

  if (isLegacyNavHeroStatsKey(sectionKey)) {
    const check = safeParseLegacyNavHeroStats(content);
    if (!check.success) return { ok: false, error: he.contentInvalid };
    await supabase
      .from("page_sections")
      .update({ content: check.data as object })
      .eq("id", sectionId)
      .eq("landing_page_id", pageId);
    revalidatePath("/dashboard");
    revalidatePath(`/${page.slug}`);
    return { ok: true };
  }

  if (!SECTION_KEYS.includes(sectionKey as SectionKey)) {
    return { ok: false, error: "סקשן לא מוכר" };
  }
  const sk = sectionKey as SectionKey;
  const check = safeParseSectionContent(sk, content);
  if (!check.success) return { ok: false, error: he.contentInvalid };

  await supabase
    .from("page_sections")
    .update({ content: check.data as object })
    .eq("id", sectionId)
    .eq("landing_page_id", pageId);

  revalidatePath("/dashboard");
  revalidatePath(`/${page.slug}`);
  return { ok: true };
}

export async function removeSectionFromPage(
  pageId: string,
  sectionId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data: page } = await supabase
    .from("landing_pages")
    .select("slug")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!page) return { ok: false, error: "אין גישה" };

  await supabase
    .from("page_sections")
    .delete()
    .eq("id", sectionId)
    .eq("landing_page_id", pageId);

  revalidatePath("/dashboard");
  revalidatePath(`/${page.slug}`);
  return { ok: true };
}
