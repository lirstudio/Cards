import { describe, it, expect, vi } from "vitest";
import { runPersistPageEditorState } from "./persist-page-editor-state";
import { getDefaultContent } from "@/lib/sections/defaults";
import type { SupabaseClient } from "@supabase/supabase-js";

const hero = () => getDefaultContent("hero_image_split");

describe("runPersistPageEditorState", () => {
  it("calls reorder rpc once when data unchanged", async () => {
    const existing = [
      {
        id: "sec-1",
        section_key: "hero_image_split",
        content: hero(),
        visible: true,
        variant_id: null as string | null,
      },
    ];

    const rpc = vi.fn().mockResolvedValue({ error: null });

    const supabase = {
      rpc,
      from(table: string) {
        if (table === "landing_pages") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: { slug: "slug-a" }, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === "section_variants") {
          return {
            select: () => ({
              eq: () => ({
                in: async () => ({ data: [], error: null }),
              }),
            }),
          };
        }
        if (table === "page_sections") {
          return {
            select: () => ({
              eq: async () => ({ data: existing, error: null }),
            }),
          };
        }
        throw new Error(`unexpected table ${table}`);
      },
    } as unknown as SupabaseClient;

    const r = await runPersistPageEditorState(supabase, "user-1", "page-1", [
      {
        id: "sec-1",
        section_key: "hero_image_split",
        content: hero(),
        visible: true,
        variant_id: null,
      },
    ]);

    expect(r.ok).toBe(true);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("reorder_page_sections", {
      p_page_id: "page-1",
      p_ordered_ids: ["sec-1"],
    });
  });

  it("batch-inserts new sections then reorders once", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    let pageSectionsFromCount = 0;

    const supabase = {
      rpc,
      from(table: string) {
        if (table === "landing_pages") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: { slug: "slug-b" }, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === "section_variants") {
          return {
            select: () => ({
              eq: () => ({
                in: async () => ({ data: [], error: null }),
              }),
            }),
          };
        }
        if (table === "page_sections") {
          pageSectionsFromCount++;
          if (pageSectionsFromCount === 1) {
            return {
              select: () => ({
                eq: async () => ({ data: [], error: null }),
              }),
            };
          }
          return {
            insert: () => ({
              select: async () => ({
                data: [{ id: "new-1" }, { id: "new-2" }],
                error: null,
              }),
            }),
          };
        }
        throw new Error(`unexpected table ${table}`);
      },
    } as unknown as SupabaseClient;

    const r = await runPersistPageEditorState(supabase, "user-1", "page-2", [
      {
        id: null,
        section_key: "hero_image_split",
        content: hero(),
        visible: true,
        variant_id: null,
      },
      {
        id: null,
        section_key: "hero_image_split",
        content: hero(),
        visible: true,
        variant_id: null,
      },
    ]);

    expect(r.ok).toBe(true);
    expect(pageSectionsFromCount).toBe(2);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("reorder_page_sections", {
      p_page_id: "page-2",
      p_ordered_ids: ["new-1", "new-2"],
    });
  });
});
