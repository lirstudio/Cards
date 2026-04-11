import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();
  let ok = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) ok = true;
  }

  if (!ok && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) ok = true;
  }

  if (ok) {
    const res = NextResponse.redirect(`${origin}${next}`);
    res.cookies.delete("password_recovery");
    return res;
  }

  const errRes = NextResponse.redirect(`${origin}/login?error=auth`);
  errRes.cookies.delete("password_recovery");
  return errRes;
}
