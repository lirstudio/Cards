import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SECTION_KEYS,
  isLegacyNavHeroStatsKey,
  safeParseLegacyNavHeroStats,
  safeParseSectionContent,
  type SectionKey,
} from "@/lib/sections/schemas";
import { he } from "@/lib/i18n/he";

export type PersistPageEditorRowInput = {
  id: string | null;
  section_key: string;
  content: Record<string, unknown>;
  visible: boolean;
  variant_id: string | null;
};

function normalizeVariantId(v: string | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
}

export type PersistPageEditorStateResult =
  | { ok: true; slug: string; orderedSectionIds: string[] }
  | { ok: false; error: string };

export async function runPersistPageEditorState(
  supabase: SupabaseClient,
  userId: string,
  pageId: string,
  rows: PersistPageEditorRowInput[],
): Promise<PersistPageEditorStateResult> {
  const { data: page, error: pageErr } = await supabase
    .from("landing_pages")
    .select("slug")
    .eq("id", pageId)
    .eq("user_id", userId)
    .maybeSingle();
  if (pageErr || !page) return { ok: false, error: "אין גישה" };
  const pageSlug = page.slug as string;

  const { data: existingRows, error: secErr } = await supabase
    .from("page_sections")
    .select("id,section_key,content,visible,variant_id")
    .eq("landing_page_id", pageId);

  if (secErr) return { ok: false, error: secErr.message };

  const dbMap = new Map(
    (existingRows ?? []).map((r) => [
      r.id as string,
      {
        section_key: r.section_key as string,
        content: r.content as Record<string, unknown>,
        visible: r.visible as boolean,
        variant_id: (r.variant_id as string | null) ?? null,
      },
    ]),
  );

  const incomingRealIds = new Set(
    rows.map((r) => r.id).filter((id): id is string => typeof id === "string" && id.length > 0),
  );

  const toDelete = [...dbMap.keys()].filter((id) => !incomingRealIds.has(id));
  if (toDelete.length > 0) {
    const { error: delErr } = await supabase
      .from("page_sections")
      .delete()
      .in("id", toDelete)
      .eq("landing_page_id", pageId);
    if (delErr) return { ok: false, error: delErr.message };
    for (const id of toDelete) dbMap.delete(id);
  }

  const sectionKeys = [...new Set(rows.map((r) => r.section_key))];
  const { data: variantRows, error: varErr } = await supabase
    .from("section_variants")
    .select("id,section_key")
    .eq("enabled", true)
    .in("section_key", sectionKeys);

  if (varErr) return { ok: false, error: varErr.message };

  const validVariantByKey = new Map<string, Set<string>>();
  for (const vr of variantRows ?? []) {
    const sk = vr.section_key as string;
    const vid = vr.id as string;
    if (!validVariantByKey.has(sk)) validVariantByKey.set(sk, new Set());
    validVariantByKey.get(sk)!.add(vid);
  }

  for (const row of rows) {
    const vid = normalizeVariantId(row.variant_id);
    if (vid !== null) {
      const allowed = validVariantByKey.get(row.section_key);
      if (!allowed?.has(vid)) {
        return { ok: false, error: "כרטיס עיצוב לא תקף" };
      }
    }
  }

  for (const row of rows) {
    if (isLegacyNavHeroStatsKey(row.section_key)) {
      const check = safeParseLegacyNavHeroStats(row.content);
      if (!check.success) return { ok: false, error: he.contentInvalid };
    } else if (!SECTION_KEYS.includes(row.section_key as SectionKey)) {
      return { ok: false, error: "סקשן לא מוכר" };
    } else {
      const check = safeParseSectionContent(row.section_key as SectionKey, row.content);
      if (!check.success) return { ok: false, error: he.contentInvalid };
    }
  }

  const insertPayload = rows
    .filter((r) => !r.id)
    .map((r) => {
      const vid = normalizeVariantId(r.variant_id);
      let contentOut: Record<string, unknown> = r.content;
      if (isLegacyNavHeroStatsKey(r.section_key)) {
        const check = safeParseLegacyNavHeroStats(r.content);
        if (check.success) contentOut = check.data as Record<string, unknown>;
      } else {
        const check = safeParseSectionContent(r.section_key as SectionKey, r.content);
        if (check.success) contentOut = check.data as Record<string, unknown>;
      }
      return {
        landing_page_id: pageId,
        section_key: r.section_key,
        sort_order: 0,
        content: contentOut as object,
        visible: r.visible,
        ...(vid ? { variant_id: vid } : {}),
      };
    });

  let insertedIds: string[] = [];
  if (insertPayload.length > 0) {
    const { data: inserted, error: insErr } = await supabase
      .from("page_sections")
      .insert(insertPayload)
      .select("id");
    if (insErr || !inserted || inserted.length !== insertPayload.length) {
      return { ok: false, error: insErr?.message ?? "שגיאה בהוספת סקשנים" };
    }
    insertedIds = inserted.map((x) => x.id as string);
  }

  let insCursor = 0;
  const orderedDbIds: string[] = [];
  for (const row of rows) {
    if (row.id) orderedDbIds.push(row.id);
    else orderedDbIds.push(insertedIds[insCursor++]!);
  }

  for (const row of rows) {
    if (!row.id) continue;
    const prev = dbMap.get(row.id);
    if (!prev) return { ok: false, error: "סקשן לא נמצא" };

    const vid = normalizeVariantId(row.variant_id);
    let contentForDb: Record<string, unknown> = row.content;
    if (isLegacyNavHeroStatsKey(row.section_key)) {
      const check = safeParseLegacyNavHeroStats(row.content);
      if (check.success) contentForDb = check.data as Record<string, unknown>;
    } else {
      const check = safeParseSectionContent(row.section_key as SectionKey, row.content);
      if (check.success) contentForDb = check.data as Record<string, unknown>;
    }

    const contentChanged = JSON.stringify(prev.content) !== JSON.stringify(contentForDb);
    const visibleChanged = prev.visible !== row.visible;
    const variantChanged = normalizeVariantId(prev.variant_id) !== vid;

    if (!contentChanged && !visibleChanged && !variantChanged) continue;

    const patch: Record<string, unknown> = {};
    if (contentChanged) patch.content = contentForDb;
    if (visibleChanged) patch.visible = row.visible;
    if (variantChanged) patch.variant_id = vid;

    const { error: upErr } = await supabase
      .from("page_sections")
      .update(patch)
      .eq("id", row.id)
      .eq("landing_page_id", pageId);
    if (upErr) return { ok: false, error: upErr.message };
  }

  const { error: rpcErr } = await supabase.rpc("reorder_page_sections", {
    p_page_id: pageId,
    p_ordered_ids: orderedDbIds,
  });
  if (rpcErr) return { ok: false, error: rpcErr.message };

  return { ok: true, slug: pageSlug, orderedSectionIds: orderedDbIds };
}
