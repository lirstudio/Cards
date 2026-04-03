# Supabase Auth: password reset emails

In this repo, run `npm run check:auth-env` to validate `NEXT_PUBLIC_*` before deploy (uses `.env.local` if present).

The app does **not** send email itself. Forgot-password calls `supabase.auth.resetPasswordForEmail` (see `src/app/actions/auth.ts`); **Supabase Auth** delivers the message (hosted default mailer or custom SMTP in the Supabase project).

**Local dev:** With `supabase start`, messages go to **Mailpit/Inbucket** (see `supabase status` for the URL). They do not leave your machine.

Use this checklist if reset emails do not arrive in production.

## 1. Confirm the user exists (Authentication → Users)

- Open the [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Users**.
- Search for the exact email used on “Forgot password”.
- If the user is missing, no reset mail is sent for that address (the UI may still show a generic success message).

## 2. URL configuration (Authentication → URL configuration)

Set **Site URL** to your **live** app origin (production or preview you actually use), e.g. `https://your-app.vercel.app` or `https://cardsbylir.example.com` — **not** `http://localhost:3000` unless you only develop locally.

If **Site URL** is `localhost`, then:

- **Password reset from the Supabase Dashboard** (Users → “Send password recovery”) generates links pointing at `localhost`, which will fail on a real device or after the link expires.
- Align **Site URL** with where users open the app, and add **Redirect URLs** for every origin you use (production, preview, local).

Under **Redirect URLs**, allow the callback used after the user clicks the email link:

- `https://<your-production-host>/auth/callback`
- `http://localhost:3000/auth/callback` (optional, for local `next dev`)

The app builds `redirectTo` as `{origin}/auth/callback?next=/reset-password` (`origin` from `NEXT_PUBLIC_SITE_URL`, else `VERCEL_URL`, else the request host). **Supabase must list every `…/auth/callback` origin** you rely on.

### Hash errors (`#error=otp_expired`)

If you land on any page with `#error=access_denied&error_code=otp_expired`, the link was invalid or expired (or pointed at the wrong host). Request a new reset after fixing **Site URL** / **Redirect URLs**. The app redirects those hash errors to `/login` with a Hebrew message.

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
- `NEXT_PUBLIC_SITE_URL` — **recommended**: set to your real public origin (production domain or exact Vercel URL). This must match an entry under **Redirect URLs** in Supabase. If unset, the app falls back to `VERCEL_URL` or the request host so links still work; custom domains should still set `NEXT_PUBLIC_SITE_URL` explicitly.
