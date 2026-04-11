import { getAdminStats } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";

const statGrid =
  "grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(11rem,1fr))]";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="group flex min-h-[8rem] flex-col justify-between rounded-2xl border border-[var(--frost-border)] p-5 shadow-[0_0_0_1px_var(--ring-shadow)] transition-colors duration-200 hover:bg-white/[0.04]">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
        {label}
      </p>
      <p className="text-5xl font-extrabold tabular-nums tracking-[-0.03em] text-[var(--foreground)]">
        {value.toLocaleString("he-IL")}
      </p>
    </div>
  );
}

function SectionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-[var(--frost-border)] shadow-[0_0_0_1px_var(--ring-shadow)]">
      <header className="border-b border-[var(--frost-border)] px-5 py-4 lg:px-6">
        <h2 className="text-base font-semibold tracking-[-0.01em] text-[var(--foreground)]">
          {title}
        </h2>
      </header>
      <div className="p-5 lg:p-6">{children}</div>
    </section>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.02em] text-[var(--foreground)]">
          {he.adminDashboard}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{he.adminDashboardSubtitle}</p>
      </header>

      <SectionPanel title={he.adminTotalUsers}>
        <div className={statGrid}>
          <StatCard label={he.adminTotalUsers} value={stats.totalUsers} />
          <StatCard label={he.adminUsersToday} value={stats.usersToday} />
          <StatCard label={he.adminUsersThisWeek} value={stats.usersThisWeek} />
          <StatCard label={he.adminUsersThisMonth} value={stats.usersThisMonth} />
        </div>
      </SectionPanel>

      <SectionPanel title={he.adminTotalPages}>
        <div className={statGrid}>
          <StatCard label={he.adminTotalPages} value={stats.totalPages} />
          <StatCard label={he.adminPublishedPages} value={stats.publishedPages} />
          <StatCard label={he.adminDraftPages} value={stats.draftPages} />
          <StatCard label={he.adminPagesToday} value={stats.pagesToday} />
          <StatCard label={he.adminPagesThisWeek} value={stats.pagesThisWeek} />
          <StatCard label={he.adminPagesThisMonth} value={stats.pagesThisMonth} />
        </div>
      </SectionPanel>

      <SectionPanel title={he.adminTotalSubmissions}>
        <div className={statGrid}>
          <StatCard label={he.adminTotalSubmissions} value={stats.totalSubmissions} />
          <StatCard label={he.adminSubmissionsToday} value={stats.submissionsToday} />
          <StatCard label={he.adminSubmissionsThisWeek} value={stats.submissionsThisWeek} />
          <StatCard label={he.adminSubmissionsThisMonth} value={stats.submissionsThisMonth} />
        </div>
      </SectionPanel>

      <SectionPanel title={he.adminPlanDistribution}>
        {stats.planDistribution.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">{he.adminNoSubscriptionData}</p>
        ) : (
          <div
            className="overflow-hidden rounded-3xl border border-[var(--frost-border)] bg-[#0a0a0a] shadow-[0_0_0_1px_var(--ring-shadow)]"
          >
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--frost-border)] bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-start font-medium text-[var(--text-secondary)]">
                    {he.adminPlanColPlan}
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-[var(--text-secondary)]">
                    {he.adminPlanColSubscribers}
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-[var(--text-secondary)]">
                    {he.adminPlanColShare}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.planDistribution.map((plan) => {
                  const pct =
                    stats.totalUsers > 0
                      ? Math.round((plan.count / stats.totalUsers) * 100)
                      : 0;
                  return (
                    <tr
                      key={plan.slug}
                      className="border-b border-[var(--frost-border)] last:border-none"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                        {plan.name_he}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{plan.count}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 min-w-[6rem] flex-1 rounded-full bg-white/10">
                            <div
                              className="h-2 rounded-full bg-[var(--lc-primary)]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-xs tabular-nums text-[var(--text-secondary)]">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>
    </div>
  );
}
