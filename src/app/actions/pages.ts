"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
import { runPersistPageEditorState } from "@/lib/pages/persist-page-editor-state";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const DEFAULT_NEW_PAGE_THEME = {
  primary: "#3b9eff",
  background: "#000000",
  heading: "#f0f0f0",
  body: "#a1a4a5",
} satisfies PageTheme;

function randomDraftSlugBase(): string {
  return `page-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** יוצר טיוטת עמוד ריקה (ללא תבנית) ומפנה לעורך. קורא מטופס/פעולת שרת בלבד — לא מ־GET. */
export async function createDraftLandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const quota = await getUserQuota(supabase, user.id);
  if (!quota?.canCreate) redirect("/dashboard");

  for (let attempt = 0; attempt < 12; attempt++) {
    const raw = attempt === 0 ? randomDraftSlugBase() : `${randomDraftSlugBase()}-${attempt}`;
    const slug = slugify(raw) || raw.replace(/[^a-z0-9-]/gi, "").toLowerCase() || `page-${attempt}`;
    if (isReservedSlug(slug)) continue;

    const { data: page, error: pageError } = await supabase
      .from("landing_pages")
      .insert({
        user_id: user.id,
        template_id: null,
        slug,
        title: "",
        status: "draft",
        theme: DEFAULT_NEW_PAGE_THEME,
      })
      .select("id")
      .single();

    if (pageError?.code === "23505") continue;
    if (pageError || !page) redirect("/dashboard");

    revalidatePath("/dashboard");
    redirect(`/dashboard/pages/${page.id}/edit?newDraft=1`);
  }

  redirect("/dashboard");
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

  const { error: rpcErr } = await supabase.rpc("reorder_page_sections", {
    p_page_id: pageId,
    p_ordered_ids: orderedSectionIds,
  });
  if (rpcErr) return { ok: false, error: rpcErr.message };

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
  revalidatePath(`/dashboard/pages/${pageId}/edit`);
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
  revalidatePath(`/dashboard/pages/${pageId}/edit`);
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

  const { data: inserted, error } = await supabase
    .from("page_sections")
    .insert({
      landing_page_id: pageId,
      section_key: sectionKey,
      sort_order: sortOrder,
      content: getDefaultContent(sectionKey),
      visible: true,
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

  const { data: inserted, error: insErr } = await supabase
    .from("page_sections")
    .insert({
      landing_page_id: pageId,
      section_key: sectionKey,
      sort_order: insertIndex,
      content: contentToInsert,
      visible: true,
    })
    .select("id")
    .single();

  if (insErr || !inserted) return { ok: false, error: insErr?.message ?? "שגיאה" };

  const newOrder = [...ids.slice(0, insertIndex), inserted.id, ...ids.slice(insertIndex)];
  const { error: rpcErr } = await supabase.rpc("reorder_page_sections", {
    p_page_id: pageId,
    p_ordered_ids: newOrder,
  });
  if (rpcErr) return { ok: false, error: rpcErr.message };

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

export async function deleteLandingPage(
  pageId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
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

  const { error } = await supabase
    .from("landing_pages")
    .delete()
    .eq("id", pageId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

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

export async function persistPageEditorState(
  pageId: string,
  rows: Parameters<typeof runPersistPageEditorState>[3],
): Promise<
  { ok: true; orderedSectionIds: string[] } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };
  const r = await runPersistPageEditorState(supabase, user.id, pageId, rows);
  if (r.ok) {
    revalidatePath("/dashboard");
    revalidatePath(`/${r.slug}`);
    return { ok: true, orderedSectionIds: r.orderedSectionIds };
  }
  return { ok: false, error: r.error };
}
