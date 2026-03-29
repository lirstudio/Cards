import { test, expect } from "@playwright/test";

function supabaseRestHost(): string | null {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!u) return null;
  try {
    return new URL(u).host;
  } catch {
    return null;
  }
}

function trackSupabaseRequests(page: import("@playwright/test").Page, host: string): () => string[] {
  const urls: string[] = [];
  const sub = (req: import("@playwright/test").Request) => {
    try {
      if (new URL(req.url()).host === host) urls.push(req.url());
    } catch {
      /* ignore */
    }
  };
  page.on("request", sub);
  return () => {
    page.off("request", sub);
    return urls;
  };
}

const PERF_PUBLIC_SLUG = process.env.E2E_PUBLIC_SLUG?.trim() ?? "";
const PERF_SUPABASE_HOST = supabaseRestHost();
const PERF_EDIT_PAGE_ID = process.env.E2E_EDIT_PAGE_ID?.trim() ?? "";
const PERF_STORAGE_STATE = process.env.PLAYWRIGHT_STORAGE_STATE?.trim() ?? "";

test.describe("load metrics — public slug (optional env)", () => {
  test.skip(
    !PERF_PUBLIC_SLUG || !PERF_SUPABASE_HOST,
    "Set E2E_PUBLIC_SLUG and NEXT_PUBLIC_SUPABASE_URL; run `npx playwright install chromium` once",
  );

  test("navigation time + Supabase REST count", async ({ page }) => {
    const host = PERF_SUPABASE_HOST as string;
    const slug = PERF_PUBLIC_SLUG;

    const stopTrack = trackSupabaseRequests(page, host);
    const t0 = performance.now();
    await page.goto(`/${slug}`, { waitUntil: "domcontentloaded" });
    const ms = performance.now() - t0;
    const apiUrls = stopTrack();

    expect(ms).toBeLessThan(120_000);
    expect(apiUrls.length).toBeGreaterThan(0);

    console.log(`[perf] public /${slug} domcontentloaded=${ms.toFixed(0)}ms supabase_requests=${apiUrls.length}`);
  });
});

test.describe("load metrics — edit page (optional env)", () => {
  test.skip(
    !PERF_EDIT_PAGE_ID || !PERF_STORAGE_STATE || !PERF_SUPABASE_HOST,
    "Set E2E_EDIT_PAGE_ID, PLAYWRIGHT_STORAGE_STATE, NEXT_PUBLIC_SUPABASE_URL; `npx playwright install chromium`",
  );

  test("navigation time + Supabase REST count", async ({ page }) => {
    const host = PERF_SUPABASE_HOST as string;
    const pageId = PERF_EDIT_PAGE_ID;

    const stopTrack = trackSupabaseRequests(page, host);
    const t0 = performance.now();
    await page.goto(`/dashboard/pages/${pageId}/edit`, { waitUntil: "domcontentloaded" });
    const ms = performance.now() - t0;
    const apiUrls = stopTrack();

    expect(ms).toBeLessThan(120_000);
    console.log(
      `[perf] edit /dashboard/pages/${pageId}/edit domcontentloaded=${ms.toFixed(0)}ms supabase_requests=${apiUrls.length}`,
    );
  });
});
