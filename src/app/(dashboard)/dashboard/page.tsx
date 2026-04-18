import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getUserQuota, type Quota } from "@/lib/subscription";
import { he } from "@/lib/i18n/he";
import { CreateDraftPageForm } from "./create-draft-page-form";
import { DashboardPageList } from "./dashboard-page-list";

function formatRelativeDate(dateStr: string): string {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diffDays === 0) return "היום";
  if (diffDays === 1) return "אתמול";
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
  if (diffDays < 365) return `לפני ${Math.floor(diffDays / 30)} חודשים`;
  return `לפני ${Math.floor(diffDays / 365)} שנים`;
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ltrNum(n: number): string {
  return `\u200E${n}\u200E`;
}

function dashboardQuotaKpiValue(quota: Quota | null, allPagesLen: number): string {
  if (!quota) return ltrNum(allPagesLen);
  if (quota.unlimited) {
    return `${ltrNum(quota.currentCount)} · ${he.dashboardQuotaUnlimited}`;
  }
  return he.dashboardPagesQuotaTotal
    .replace("{current}", ltrNum(quota.currentCount))
    .replace("{max}", ltrNum(quota.maxPages));
}

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [quota, { data: pages }] = await Promise.all([
    getUserQuota(supabase, user.id),
    supabase
      .from("landing_pages")
      .select("id,slug,title,status,created_at,updated_at,published_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  const allPages = pages ?? [];
  const pageIds = allPages.map((p) => p.id);

  const [subCountRows, viewCountRows, { count: totalLeads }] =
    pageIds.length > 0
      ? await Promise.all([
          supabase.from("form_submissions").select("landing_page_id").in("landing_page_id", pageIds).then((r) => r.data ?? []),
          supabase.rpc("get_my_landing_page_view_counts").then((r) => r.data ?? []),
          supabase.from("form_submissions").select("id", { count: "exact", head: true }).in("landing_page_id", pageIds),
        ])
      : [[], [], { count: 0 }];

  const submissionsMap = new Map<string, number>();
  for (const row of subCountRows as { landing_page_id: string }[]) {
    submissionsMap.set(row.landing_page_id, (submissionsMap.get(row.landing_page_id) ?? 0) + 1);
  }
  const viewsMap = new Map<string, number>();
  for (const row of viewCountRows as { landing_page_id: string; view_count: number | string }[]) {
    viewsMap.set(row.landing_page_id, Number(row.view_count));
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const publishedCount = allPages.filter((p) => String(p.status).trim() === "published").length;
  const draftCount = allPages.length - publishedCount;

  const pageCards = allPages.map((p) => {
    const isPublished = String(p.status).trim() === "published";
    return {
      id: p.id,
      slug: p.slug,
      title: p.title || p.slug,
      isPublished,
      updatedRelative: formatRelativeDate(p.updated_at),
      publishedShort: p.published_at ? formatShortDate(p.published_at) : null,
      viewCount: viewsMap.get(p.id) ?? 0,
      submissionCount: submissionsMap.get(p.id) ?? 0,
      pageUrl: `${siteUrl}/${p.slug}`,
      pageLabel: (p.title || p.slug).trim() || p.slug,
    };
  });

  const kpis = [
    {
      label: he.dashboardTotalPages,
      value: dashboardQuotaKpiValue(quota, allPages.length),
    },
    { label: he.dashboardPublished, value: String(publishedCount) },
    { label: he.dashboardDrafts, value: String(draftCount) },
    { label: he.dashboardTotalLeads, value: String(totalLeads ?? 0) },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#f0f0f0]">{he.myPages}</h1>
        {quota?.canCreate === false ? (
          <span className="rounded-full bg-[#464a4d] px-6 py-2.5 text-sm font-medium text-[#a1a4a5]">
            {he.newPage}
          </span>
        ) : (
          <CreateDraftPageForm className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60" />
        )}
      </div>

      {/* KPI strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} />
        ))}
      </div>

      {/* Page list / empty state */}
      {!allPages.length ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(214,235,253,0.19)] text-2xl text-[#a1a4a5]">
            ✦
          </div>
          <div>
            <p className="text-lg font-semibold text-[#f0f0f0]">{he.dashboardEmptyTitle}</p>
            <p className="mt-1 text-sm text-[#a1a4a5]">{he.dashboardEmptySubtitle}</p>
          </div>
          {quota?.canCreate !== false && (
            <CreateDraftPageForm className="mt-2 rounded-full bg-white px-8 py-3 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60" />
          )}
        </div>
      ) : (
        <DashboardPageList pages={pageCards} />
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[rgba(59,158,255,0.28)] px-4 py-3"
      style={{
        boxShadow:
          "0 0 0 1px rgba(59,158,255,0.08), 0 0 32px -6px rgba(59,158,255,0.25), inset 0 1px 0 rgba(59,158,255,0.13)",
      }}
    >
      {/* top-edge shine streak */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 10%, rgba(59,158,255,0.6) 50%, transparent 90%)",
        }}
      />
      <p className="text-xs text-[#a1a4a5]">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-[#f0f0f0]" dir="auto">
        {value}
      </p>
    </div>
  );
}

