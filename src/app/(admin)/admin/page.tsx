import { getAdminStats } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-neutral-900">{value.toLocaleString("he-IL")}</p>
      {sub && <p className="mt-1 text-xs text-neutral-400">{sub}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{he.adminDashboard}</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{he.adminTotalUsers}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={he.adminTotalUsers} value={stats.totalUsers} />
          <StatCard label={he.adminUsersToday} value={stats.usersToday} />
          <StatCard label={he.adminUsersThisWeek} value={stats.usersThisWeek} />
          <StatCard label={he.adminUsersThisMonth} value={stats.usersThisMonth} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{he.adminTotalPages}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label={he.adminTotalPages} value={stats.totalPages} />
          <StatCard label={he.adminPublishedPages} value={stats.publishedPages} />
          <StatCard label={he.adminDraftPages} value={stats.draftPages} />
          <StatCard label={he.adminPagesToday} value={stats.pagesToday} />
          <StatCard label={he.adminPagesThisWeek} value={stats.pagesThisWeek} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{he.adminTotalSubmissions}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label={he.adminTotalSubmissions} value={stats.totalSubmissions} />
          <StatCard label={he.adminPagesThisMonth} value={stats.pagesThisMonth} sub="עמודים חדשים" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{he.adminPlanDistribution}</h2>
        {stats.planDistribution.length === 0 ? (
          <p className="text-sm text-neutral-500">אין נתוני מנויים</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium text-neutral-600">תוכנית</th>
                  <th className="px-4 py-3 text-start font-medium text-neutral-600">מנויים</th>
                  <th className="px-4 py-3 text-start font-medium text-neutral-600">חלק</th>
                </tr>
              </thead>
              <tbody>
                {stats.planDistribution.map((plan) => {
                  const pct =
                    stats.totalUsers > 0
                      ? Math.round((plan.count / stats.totalUsers) * 100)
                      : 0;
                  return (
                    <tr key={plan.slug} className="border-b border-neutral-100 last:border-none">
                      <td className="px-4 py-3 font-medium">{plan.name_he}</td>
                      <td className="px-4 py-3">{plan.count}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-neutral-100">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-neutral-500">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
