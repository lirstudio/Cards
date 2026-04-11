import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getUserQuota } from "@/lib/subscription";
import { he } from "@/lib/i18n/he";
import { CreateDraftPageForm } from "./create-draft-page-form";
import { DeleteLandingPageButton } from "./delete-landing-page-button";

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

  const [subCountRows, secCountRows, viewCountRows, { count: totalLeads }] =
    pageIds.length > 0
      ? await Promise.all([
          supabase.from("form_submissions").select("landing_page_id").in("landing_page_id", pageIds).then((r) => r.data ?? []),
          supabase.from("page_sections").select("landing_page_id").in("landing_page_id", pageIds).then((r) => r.data ?? []),
          supabase.from("page_views").select("landing_page_id").in("landing_page_id", pageIds).then((r) => r.data ?? []),
          supabase.from("form_submissions").select("id", { count: "exact", head: true }).in("landing_page_id", pageIds),
        ])
      : [[], [], [], { count: 0 }];

  const submissionsMap = new Map<string, number>();
  for (const row of subCountRows as { landing_page_id: string }[]) {
    submissionsMap.set(row.landing_page_id, (submissionsMap.get(row.landing_page_id) ?? 0) + 1);
  }
  const sectionsMap = new Map<string, number>();
  for (const row of secCountRows as { landing_page_id: string }[]) {
    sectionsMap.set(row.landing_page_id, (sectionsMap.get(row.landing_page_id) ?? 0) + 1);
  }
  const viewsMap = new Map<string, number>();
  for (const row of viewCountRows as { landing_page_id: string }[]) {
    viewsMap.set(row.landing_page_id, (viewsMap.get(row.landing_page_id) ?? 0) + 1);
  }

  const publishedCount = allPages.filter((p) => String(p.status).trim() === "published").length;
  const draftCount = allPages.length - publishedCount;

  const kpis = [
    {
      label: he.dashboardTotalPages,
      value: quota ? `${quota.currentCount} / ${quota.maxPages}` : String(allPages.length),
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
          <div
            key={kpi.label}
            className="rounded-2xl border border-[rgba(214,235,253,0.19)] px-4 py-3"
          >
            <p className="text-xs text-[#a1a4a5]">{kpi.label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-[#f0f0f0]">{kpi.value}</p>
          </div>
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
        <ul className="mt-6 space-y-3">
          {allPages.map((p) => {
            const isPublished = String(p.status).trim() === "published";
            const submissionCount = submissionsMap.get(p.id) ?? 0;
            const sectionCount = sectionsMap.get(p.id) ?? 0;
            const viewCount = viewsMap.get(p.id) ?? 0;

            return (
              <li
                key={p.id}
                className="rounded-2xl border border-[rgba(214,235,253,0.19)] bg-transparent p-5 transition hover:bg-white/[0.03]"
              >
                {/* Title + status badge */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-base font-semibold text-[#f0f0f0]">
                    {p.title || p.slug}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isPublished
                        ? "bg-[#11ff99]/15 text-[#11ff99]"
                        : "bg-white/10 text-[#a1a4a5]"
                    }`}
                  >
                    {isPublished ? he.published : he.draft}
                  </span>
                </div>

                {/* Slug + last updated */}
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-sm text-[#a1a4a5]" dir="ltr">
                    /{p.slug}
                  </span>
                  <span className="text-[#464a4d]" aria-hidden>·</span>
                  <span className="text-xs text-[#a1a4a5]">
                    {he.dashboardLastUpdated} {formatRelativeDate(p.updated_at)}
                  </span>
                </div>

                {/* Metrics row */}
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[rgba(214,235,253,0.09)] pt-3">
                  <MetricItem label={he.dashboardViews} value={viewCount} />
                  <MetricItem label={he.dashboardLeads} value={submissionCount} />
                  <MetricItem label={he.dashboardSections} value={sectionCount} />
                  <div className="ms-auto">
                    {isPublished && p.published_at ? (
                      <span className="text-xs text-[#a1a4a5]">
                        {he.dashboardPublishedAt}: {formatShortDate(p.published_at)}
                      </span>
                    ) : (
                      <span className="text-xs text-[#464a4d]">{he.dashboardNeverPublished}</span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/pages/${p.id}/edit`}
                    className="rounded-full border border-[rgba(214,235,253,0.19)] px-4 py-2 text-sm text-[#f0f0f0] transition hover:bg-white/10"
                  >
                    {he.editPage}
                  </Link>
                  {isPublished ? (
                    <Link
                      href={`/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-[rgba(214,235,253,0.19)] px-4 py-2 text-sm font-medium text-[#f0f0f0] transition hover:bg-white/10"
                    >
                      {he.openPage}
                    </Link>
                  ) : null}
                  <DeleteLandingPageButton
                    pageId={p.id}
                    pageLabel={(p.title || p.slug).trim() || p.slug}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-bold tabular-nums text-[#f0f0f0]">
        {value.toLocaleString("he-IL")}
      </span>
      <span className="text-xs text-[#a1a4a5]">{label}</span>
    </div>
  );
}
