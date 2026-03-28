"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadLandingAsset(
  formData: FormData,
): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> {
  const file = formData.get("file");
  const pageId = String(formData.get("pageId") ?? "");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "קובץ לא תקין" };
  }
  if (!pageId) return { ok: false, error: "חסר מזהה עמוד" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data: page } = await supabase
    .from("landing_pages")
    .select("id")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!page) return { ok: false, error: "אין גישה" };

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safeExt = ext.match(/^[a-z0-9]+$/) ? ext : "bin";
  const path = `${user.id}/${pageId}/${crypto.randomUUID()}.${safeExt}`;

  const buf = await file.arrayBuffer();
  const { error: upErr } = await supabase.storage.from("landing-media").upload(path, buf, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (upErr) return { ok: false, error: upErr.message };

  const { data: pub } = supabase.storage.from("landing-media").getPublicUrl(path);
  return { ok: true, publicUrl: pub.publicUrl };
}
