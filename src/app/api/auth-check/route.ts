import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolvePublicOrigin } from "@/lib/public-site-url";

/**
 * GET /api/auth-check
 * Diagnostic: verifies SUPABASE_SERVICE_ROLE_KEY + RESEND_API_KEY are working.
 * Remove or protect this route after confirming everything works.
 */
export async function GET() {
  const results: Record<string, { ok: boolean; detail: string }> = {};

  // 1. Env vars
  const hasResendKey = Boolean(process.env.RESEND_API_KEY?.trim());
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const hasFromEmail = Boolean(process.env.RESEND_FROM_EMAIL?.trim());
  const hasSiteUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim());

  results.env = {
    ok: hasResendKey && hasServiceRole,
    detail: [
      `RESEND_API_KEY: ${hasResendKey ? "set" : "MISSING"}`,
      `SUPABASE_SERVICE_ROLE_KEY: ${hasServiceRole ? "set" : "MISSING"}`,
      `RESEND_FROM_EMAIL: ${hasFromEmail ? "set" : "not set (using onboarding@resend.dev)"}`,
      `NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL?.trim() || "not set"}`,
    ].join(", "),
  };

  // 2. Supabase Admin connection
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    results.supabase_admin = {
      ok: !error,
      detail: error ? error.message : `connected — ${data?.users?.length ?? 0} users sampled`,
    };
  } catch (e) {
    results.supabase_admin = { ok: false, detail: String(e) };
  }

  // 3. Resolved origin
  try {
    const { origin, usedEnvOverride } = await resolvePublicOrigin();
    const callbackUrl = `${origin}/auth/callback`;
    results.origin = {
      ok: !origin.includes("localhost") || !hasSiteUrl,
      detail: `${origin} (${usedEnvOverride ? "from NEXT_PUBLIC_SITE_URL" : "fallback"}) — callback: ${callbackUrl}`,
    };
  } catch (e) {
    results.origin = { ok: false, detail: String(e) };
  }

  // 4. Resend connection check (list domains — no email sent)
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { data, error } = await resend.domains.list();
    results.resend = {
      ok: !error,
      detail: error
        ? error.message
        : `connected — domains: ${(data?.data ?? []).map((d) => `${d.name}(${d.status})`).join(", ") || "none"}`,
    };
  } catch (e) {
    results.resend = { ok: false, detail: String(e) };
  }

  const allOk = Object.values(results).every((r) => r.ok);

  return NextResponse.json(
    {
      ok: allOk,
      readyForResendPath: hasResendKey && hasServiceRole,
      results,
      next_steps: allOk
        ? [
            "All checks passed.",
            "Make sure Supabase → Authentication → URL configuration → Redirect URLs contains: " +
              (process.env.NEXT_PUBLIC_SITE_URL?.trim()
                ? `${process.env.NEXT_PUBLIC_SITE_URL.trim()}/auth/callback`
                : "{NEXT_PUBLIC_SITE_URL}/auth/callback"),
            "Then try forgot-password from the app.",
          ]
        : ["Fix the failing checks above, redeploy, and try again."],
    },
    { status: allOk ? 200 : 500 },
  );
}
