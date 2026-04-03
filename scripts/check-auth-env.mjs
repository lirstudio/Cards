#!/usr/bin/env node
/**
 * Validates env vars used for Supabase Auth (reset links, callbacks).
 * Loads .env.local when present; merges with process.env.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(scriptDir, "..");
const envPath = path.join(root, ".env.local");

function loadDotEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const fromFile = loadDotEnv(envPath);
const env = { ...fromFile, ...process.env };

const issues = [];
const hints = [];

if (!env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
  issues.push("Missing NEXT_PUBLIC_SUPABASE_URL");
}
if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
  issues.push("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

if (!env.NEXT_PUBLIC_SITE_URL?.trim()) {
  if (env.VERCEL === "1" && env.VERCEL_URL) {
    hints.push(
      `NEXT_PUBLIC_SITE_URL unset — will fall back to https://${env.VERCEL_URL} at runtime. For custom domains, set NEXT_PUBLIC_SITE_URL explicitly.`,
    );
  } else if (env.VERCEL === "1") {
    hints.push("NEXT_PUBLIC_SITE_URL unset on Vercel — set it to your canonical public URL.");
  } else {
    hints.push(
      "NEXT_PUBLIC_SITE_URL unset — local default http://localhost:3000. Supabase Site URL must match where users open links.",
    );
  }
} else {
  const u = env.NEXT_PUBLIC_SITE_URL.trim();
  if (u.includes("localhost") && env.VERCEL === "1") {
    issues.push(
      "NEXT_PUBLIC_SITE_URL points to localhost on Vercel — email links will break for real users.",
    );
  }
  const supa = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (supa && !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supa.replace(/\/$/, ""))) {
    hints.push(
      "NEXT_PUBLIC_SUPABASE_URL should be https://<project-ref>.supabase.co — verify it matches Dashboard → Settings → API.",
    );
  }
}

console.log("Auth / Supabase env check\n");
console.log("  NEXT_PUBLIC_SUPABASE_URL:", env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "MISSING");
console.log(
  "  NEXT_PUBLIC_SUPABASE_ANON_KEY:",
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "MISSING",
);
console.log("  NEXT_PUBLIC_SITE_URL:", env.NEXT_PUBLIC_SITE_URL?.trim() || "(unset)");
if (env.VERCEL_URL) console.log("  VERCEL_URL:", env.VERCEL_URL);

const hasResend = env.RESEND_API_KEY?.trim() && env.SUPABASE_SERVICE_ROLE_KEY?.trim();
console.log("\n  Email delivery mode:", hasResend ? "Resend (bypasses Supabase rate limits)" : "Supabase built-in mailer (rate limited; add RESEND_API_KEY + SUPABASE_SERVICE_ROLE_KEY to enable Resend)");

if (!hasResend) {
  hints.push("Password reset emails are sent via Supabase built-in mailer (max ~2/hour on free tier). Add RESEND_API_KEY + SUPABASE_SERVICE_ROLE_KEY to switch to Resend.");
}

hints.forEach((h) => console.log("\nHint:", h));

if (issues.length) {
  console.error("\nProblems:");
  issues.forEach((i) => console.error("  -", i));
  console.error(
    "\nSupabase Dashboard → Authentication → URL configuration:\n" +
      "  - Site URL = your real app URL (not localhost in production)\n" +
      "  - Redirect URLs must include: {that-origin}/auth/callback\n",
  );
  process.exit(1);
}

console.log("\nOK — no blocking issues found.");
process.exit(0);
