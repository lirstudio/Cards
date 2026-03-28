#!/usr/bin/env node
/**
 * דוחף מיגרציות מ־supabase/migrations לפרויקט Supabase בענן.
 *
 * סדר עדיפות ב־.env.local:
 * 1) DATABASE_URL — מחרוזת מלאה (Settings → Database → Connect)
 * 2) SUPABASE_ACCESS_TOKEN — מ־Account → Access Tokens, ואז link + db push (לרוב בלי סיסמת DB)
 * 3) SUPABASE_DB_PASSWORD — סיסמת Postgres + גזירת host מ־NEXT_PUBLIC_SUPABASE_URL
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const p = join(root, ".env.local");
  let text;
  try {
    text = readFileSync(p, "utf8");
  } catch {
    console.error("חסר קובץ .env.local בשורש הפרויקט");
    process.exit(1);
  }
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined || process.env[k] === "") {
      process.env[k] = v;
    }
  }
}

loadEnvLocal();

const publicUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
let dbUrl = (process.env.DATABASE_URL ?? "").trim();
const pat = (process.env.SUPABASE_ACCESS_TOKEN ?? "").trim();
const pass = (process.env.SUPABASE_DB_PASSWORD ?? "").trim();

function projectRefFromUrl() {
  if (!publicUrl.includes("supabase.co")) return null;
  const hostMatch = publicUrl.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i);
  return hostMatch ? hostMatch[1] : null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function verifyRest() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!publicUrl || !key) {
    console.log("מיגרציה הושלמה (לא בוצע אימות REST — חסר מפתח/URL).");
    return;
  }
  console.log("מאמת שטבלת profiles קיימת דרך REST…");
  for (let attempt = 1; attempt <= 8; attempt++) {
    const res = await fetch(`${publicUrl}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    const body = await res.text();
    if (res.ok) {
      console.log("אימות OK —", res.status, body.slice(0, 80));
      return;
    }
    if (res.status === 404 && body.includes("PGRST205") && attempt < 8) {
      console.log("ממתין לרענון מטמון PostgREST… (" + attempt + "/8)");
      await sleep(2000);
      continue;
    }
    console.error("אימות נכשל:", res.status, body.slice(0, 300));
    process.exit(1);
  }
}

function runPushWithDbUrl(url) {
  console.log("מריץ supabase db push עם db-url…");
  const push = spawnSync(
    "npx",
    ["supabase", "db", "push", "--db-url", url, "--yes"],
    {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env },
      shell: process.platform === "win32",
    },
  );
  return push.status ?? 1;
}

if (dbUrl) {
  const code = runPushWithDbUrl(dbUrl);
  if (code !== 0) process.exit(code);
  await verifyRest();
  process.exit(0);
}

const ref = projectRefFromUrl();
if (!ref) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL חייב להיות כתובת פרויקט Supabase בענן (…supabase.co)",
  );
  process.exit(1);
}

if (pat) {
  console.log("מריץ supabase link + db push עם SUPABASE_ACCESS_TOKEN…");
  const env = { ...process.env, SUPABASE_ACCESS_TOKEN: pat };
  const link = spawnSync(
    "npx",
    ["supabase", "link", "--project-ref", ref, "--yes"],
    { cwd: root, stdio: "inherit", env, shell: process.platform === "win32" },
  );
  if ((link.status ?? 1) !== 0) process.exit(link.status ?? 1);
  const push = spawnSync("npx", ["supabase", "db", "push", "--yes"], {
    cwd: root,
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });
  if ((push.status ?? 1) !== 0) process.exit(push.status ?? 1);
  await verifyRest();
  process.exit(0);
}

if (!pass) {
  console.error(
    [
      "חסר אמצעי חיבור למסד. הוסיפו ל־.env.local אחד מהבאים:",
      "  • SUPABASE_ACCESS_TOKEN — https://supabase.com/dashboard/account/tokens (מומלץ)",
      "  • SUPABASE_DB_PASSWORD — Project Settings → Database",
      "  • DATABASE_URL — מחרוזת מלאה מ־Connect",
      "",
      "ואז: npm run db:push:remote",
    ].join("\n"),
  );
  process.exit(1);
}

dbUrl = `postgresql://postgres:${encodeURIComponent(pass)}@db.${ref}.supabase.co:5432/postgres`;
const code = runPushWithDbUrl(dbUrl);
if (code !== 0) process.exit(code);
await verifyRest();
