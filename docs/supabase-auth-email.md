# Supabase Auth: full scenario — reset emails, links, SMTP

Run `npm run check:auth-env` before deploy (reads `.env.local` if present).

The app does **not** send SMTP itself. It calls `supabase.auth.resetPasswordForEmail` ([`src/app/actions/auth.ts`](../src/app/actions/auth.ts)); **Supabase Auth** sends the email (built-in mailer or **custom SMTP in the Supabase project only**).

**Local dev:** With `supabase start`, email goes to **Mailpit/Inbucket** (`supabase status`), not to the public internet.

---

## Who builds the link in the email?

| Source | What sets the base URL in the recovery email |
|--------|-----------------------------------------------|
| **Your app** (“Forgot password”) | `redirectTo` from code: `{origin}/auth/callback?next=/reset-password`. `origin` from [`resolvePublicOrigin`](../src/lib/public-site-url.ts): `NEXT_PUBLIC_SITE_URL`, else `VERCEL_URL`, else request host. Must be listed under **Redirect URLs**. |
| **Supabase Dashboard** (User → “Send password recovery”) | Uses **Site URL** from **Authentication → URL configuration**. If **Site URL** is `http://localhost:3000`, the email link points at localhost. |

Use one canonical **Site URL** for production (the URL users actually open). Reserve localhost only for pure local testing.

---

## 1. Rate limit: “only request this after X seconds”

If the Dashboard or API returns something like **“For security purposes, you can only request this after N seconds”** after `POST …/auth/v1/recover`, that is a **cooldown between recovery requests**, not a broken SMTP and not a missing Resend integration.

**Action:** wait at least **N seconds** (often ~10–60), then send again. Repeated rapid clicks from the UI trigger this.

If it still fails after waiting, check **Authentication → Logs** for that project.

---

## 2. Confirm the user exists (Authentication → Users)

- [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **Users**.
- Search the exact email. No user ⇒ no mail for that address (the public UI may still show a generic success).

---

## 3. URL configuration (Authentication → URL configuration)

**Site URL:** your live origin, e.g. `https://your-app.vercel.app` or `https://yourdomain.com` — **not** `http://localhost:3000` for production users.

**Redirect URLs** — add every origin where the app runs, each with `/auth/callback`:

- `https://<production-domain>/auth/callback`
- Custom domain: same pattern for that host.
- Preview (if used): `https://*.vercel.app/auth/callback` when the dashboard supports wildcards, **or** each preview URL explicitly.
- Local (optional): `http://localhost:3000/auth/callback`

The app’s `redirectTo` must match one of these entries exactly (scheme + host + path).

### Hash/query errors (`otp_expired`)

Old or wrong-host links show errors. After fixing **Site URL** / **Redirect URLs**, request a **new** reset and open the link **once**. The app maps common hash errors to `/login` with Hebrew copy ([`AuthHashRedirect`](../src/components/auth/auth-hash-redirect.tsx)).

---

## 4. Vercel / hosting environment variables

Keep **one** Supabase project per deployment environment unless you intend otherwise.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Must be `https://<project-ref>.supabase.co` for the same project you configure in the dashboard. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key from **Settings → API** for that project. |
| `NEXT_PUBLIC_SITE_URL` | **Should match** Supabase **Site URL** (canonical public origin, no trailing slash unless you always use it). Critical for custom domains. If unset on Vercel, the app falls back to `https://${VERCEL_URL}`. |

Run `npm run check:auth-env` in CI or locally; it fails the build if `NEXT_PUBLIC_SITE_URL` is localhost while deployed on Vercel.

---

## 5. Auth logs after a send attempt

- **Authentication** → **Logs** (or project **Logs** → filter Auth).
- Use after “Forgot password” or Dashboard recovery to see redirect errors, SMTP errors, or rate limits.

---

## 6. Custom SMTP (optional: Resend, SendGrid, …)

**Not required** for Supabase Cloud to send mail. Use when you need better deliverability, your own **from** domain, or fewer messages marked as spam.

- Configure in **Supabase Dashboard → Authentication → SMTP** (not in this Next.js repo; no `npm install resend` needed for Auth emails).
- Follow your provider’s SMTP hostname, port, user, and password/API key.
- **Resend:** create SMTP credentials in Resend, paste into Supabase SMTP settings.

---

## 7. Quick checklist (production)

1. **Site URL** = public app URL users use.  
2. **Redirect URLs** include `{that-url}/auth/callback` (+ previews/local if needed).  
3. **Vercel** `NEXT_PUBLIC_*` matches that project and **Site URL**.  
4. **New** recovery email after any URL change; don’t reuse old links.  
5. If many resets while testing: respect **seconds-between-requests** cooldown.  
6. Optional: **SMTP** in Supabase for production-grade deliverability.
