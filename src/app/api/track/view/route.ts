import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const landingPageId = typeof body?.landing_page_id === "string" ? body.landing_page_id : null;
    if (!landingPageId) {
      return NextResponse.json({ error: "missing landing_page_id" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("page_views")
      .insert({ landing_page_id: landingPageId });

    if (error) {
      console.error("[api/track/view] insert failed", {
        landingPageId,
        message: error.message,
        code: error.code,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
