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
};

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
    .select("id,section_key,content,visible")
    .eq("landing_page_id", pageId);

  if (secErr) return { ok: false, error: secErr.message };

  const dbMap = new Map(
    (existingRows ?? []).map((r) => [
      r.id as string,
      {
        section_key: r.section_key as string,
        content: r.content as Record<string, unknown>,
        visible: r.visible as boolean,
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

  const insertPayload = rows.filter((r) => !r.id).map((r) => {
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

    if (!contentChanged && !visibleChanged) continue;

    const patch: Record<string, unknown> = {};
    if (contentChanged) patch.content = contentForDb;
    if (visibleChanged) patch.visible = row.visible;

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
