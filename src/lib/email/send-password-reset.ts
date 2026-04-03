"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, FROM_EMAIL } from "@/lib/email/resend";
import { resolvePublicOrigin } from "@/lib/public-site-url";

/**
 * Generate a Supabase recovery link (Admin API, no rate limit) and send it
 * via Resend — bypassing the Supabase SMTP/rate-limit entirely.
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY + RESEND_API_KEY in env.
 *
 * Returns null on success, error string on failure.
 */
export async function sendPasswordResetEmail(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const { origin } = await resolvePublicOrigin();
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", "/reset-password");

  const { data, error: genError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: callback.toString() },
  });

  if (genError || !data?.properties?.action_link) {
    return genError?.message ?? "לא ניתן ליצור קישור איפוס";
  }

  const actionLink = data.properties.action_link;

  const resend = createResendClient();
  const { error: mailError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "איפוס סיסמה — Cards",
    html: `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f8f9fa;margin:0;padding:32px">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px">
    <tr>
      <td style="text-align:center;padding-bottom:28px">
        <span style="font-size:26px;font-weight:700;letter-spacing:-1px">cards</span>
      </td>
    </tr>
    <tr>
      <td>
        <h1 style="font-size:22px;font-weight:700;margin:0 0 12px">איפוס סיסמה</h1>
        <p style="color:#555;margin:0 0 28px;line-height:1.6">
          קיבלנו בקשה לאפס את הסיסמה שלך. לחץ על הכפתור כדי להגדיר סיסמה חדשה.
          הקישור בתוקף ל-60 דקות.
        </p>
        <a href="${actionLink}"
           style="display:inline-block;background:#2563eb;color:#fff;padding:13px 32px;border-radius:100px;text-decoration:none;font-size:15px;font-weight:600">
          איפוס סיסמה
        </a>
        <p style="color:#888;font-size:13px;margin:28px 0 0;line-height:1.5">
          אם לא ביקשת איפוס סיסמה, אפשר להתעלם ממייל זה.<br>
          הקישור לא יפעל אחרי 60 דקות.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    text: `איפוס סיסמה — Cards\n\nלחץ על הקישור לאיפוס הסיסמה:\n${actionLink}\n\nהקישור בתוקף ל-60 דקות.`,
  });

  if (mailError) return mailError.message ?? "שגיאה בשליחת המייל";

  return null;
}
