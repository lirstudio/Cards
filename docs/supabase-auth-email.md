# Supabase Auth: password reset emails

The app does **not** send email itself. Forgot-password calls `supabase.auth.resetPasswordForEmail` (see `src/app/actions/auth.ts`); **Supabase Auth** delivers the message (hosted default mailer or custom SMTP in the Supabase project).

**Local dev:** With `supabase start`, messages go to **Mailpit/Inbucket** (see `supabase status` for the URL). They do not leave your machine.

Use this checklist if reset emails do not arrive in production.

## 1. Confirm the user exists (Authentication → Users)

- Open the [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Users**.
- Search for the exact email used on “Forgot password”.
- If the user is missing, no reset mail is sent for that address (the UI may still show a generic success message).

## 2. URL configuration (Authentication → URL configuration)

Set **Site URL** to your live app origin, e.g. `https://your-app.vercel.app` (no trailing slash unless you always use it consistently).

Under **Redirect URLs**, allow the callback used after the user clicks the email link:

- `https://<your-production-host>/auth/callback`
- For local testing: `http://localhost:3000/auth/callback`

The app builds `redirectTo` as `{NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`. Ensure `NEXT_PUBLIC_SITE_URL` in Vercel (or your host) matches the **Site URL** you expect users to use.

## 3. Auth logs after a send attempt

- **Authentication** → **Logs** (or project **Logs** filtered for Auth).
- Trigger “Forgot password” again and check for errors (rate limits, SMTP, invalid redirect, etc.).

## 4. Optional: custom SMTP (e.g. Resend)

Not required for Supabase Cloud to send mail, but recommended for deliverability and branding.

- **Authentication** → **SMTP settings** (or **Settings** → email, depending on dashboard version).
- Configure your provider (Resend, SendGrid, etc.) per their SMTP docs.
- Resend is configured **in Supabase**, not in this Next.js repo, for Auth emails.

## Environment variables (hosting)

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — must point to the same Supabase project you checked above.
- `NEXT_PUBLIC_SITE_URL` — public site origin for correct `redirectTo` in reset links.
