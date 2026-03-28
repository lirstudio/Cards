"use server";

import { createClient } from "@/lib/supabase/server";
import { he } from "@/lib/i18n/he";

export async function submitLandingLead(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const landingPageId = String(formData.get("landing_page_id") ?? "");
  const sectionId = String(formData.get("section_id") ?? "");
  if (!landingPageId) {
    return { ok: false, message: he.contactError };
  }

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("landing_pages")
    .select("id,status")
    .eq("id", landingPageId)
    .eq("status", "published")
    .maybeSingle();

  if (!page) {
    return { ok: false, message: he.contactError };
  }

  const payload: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "landing_page_id" || key === "section_id") return;
    payload[key] = value;
  });

  const { error } = await supabase.from("form_submissions").insert({
    landing_page_id: landingPageId,
    section_id: sectionId || null,
    payload,
  });

  if (error) {
    return { ok: false, message: he.contactError };
  }
  return { ok: true, message: he.contactSuccess };
}
