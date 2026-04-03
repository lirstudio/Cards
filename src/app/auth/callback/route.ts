import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next") ?? "/dashboard";
  const next = nextRaw.startsWith("/") ? nextRaw : `/${nextRaw}`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  const errCode = url.searchParams.get("error_code");
  const err = url.searchParams.get("error");
  let authError = "auth_callback";
  if (errCode === "otp_expired") authError = "otp_expired";
  else if (err === "access_denied") authError = "access_denied";

  return NextResponse.redirect(
    new URL(`/login?auth_error=${encodeURIComponent(authError)}`, url.origin),
  );
}
