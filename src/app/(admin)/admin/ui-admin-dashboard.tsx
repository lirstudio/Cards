"use client";

import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { AdminStats, DashboardTimeSeriesPoint, RecentActivityItem } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";

// ── Design tokens ──────────────────────────────────────────────────────────
const GRID_LINE = "rgba(214,235,253,0.06)";
const CHART_BLUE = "#3b9eff";
const CHART_GREEN = "#11ff99";
const CHART_ORANGE = "#ff801f";
const CHART_YELLOW = "#ffc53d";
const CHART_COLORS = [CHART_BLUE, CHART_GREEN, CHART_ORANGE, CHART_YELLOW, "#b388ff"];

// ── Helpers ────────────────────────────────────────────────────────────────

function trendPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function formatChartDate(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parseInt(parts[2])}/${parseInt(parts[1])}`;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return he.adminTimeAgoNow;
  if (mins < 60) return he.adminTimeAgoMinutes.replace("{n}", String(mins));
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return he.adminTimeAgoHours.replace("{n}", String(hrs));
  return he.adminTimeAgoDays.replace("{n}", String(Math.floor(hrs / 24)));
}

function aggregateToWeeks(data: DashboardTimeSeriesPoint[]) {
  const weeks = [];
  for (let w = 3; w >= 0; w--) {
    const slice = data.slice(Math.max(0, data.length - (w + 1) * 7), data.length - w * 7);
    const startDate = slice[0]?.date ?? "";
    const label = startDate ? formatChartDate(startDate) : `שבוע ${4 - w}`;
    weeks.push({
      label,
      users: slice.reduce((s, d) => s + d.users, 0),
      pages: slice.reduce((s, d) => s + d.pages, 0),
      submissions: slice.reduce((s, d) => s + d.submissions, 0),
    });
  }
  return weeks;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function DarkTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[rgba(214,235,253,0.19)] bg-[#0d0d0d] px-3 py-2 text-xs shadow-xl">
      <p className="mb-1.5 text-[#a1a4a5]">{String(label ?? "")}</p>
      {Array.from(payload).map((p, i) => (
        <p key={i} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          {String(p.name)}: <span className="font-semibold tabular-nums">{String(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const pct = trendPct(current, previous);
  const isUp = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold tabular-nums ${
        isUp
          ? "bg-[#11ff99]/10 text-[#11ff99]"
          : "bg-[#ff2047]/12 text-[#ff2047]"
      }`}
    >
      {isUp ? "↑" : "↓"} {Math.abs(pct)}%
    </span>
  );
}

function BentoCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[rgba(214,235,253,0.19)] bg-transparent shadow-[0_0_0_1px_rgba(176,199,217,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-[rgba(214,235,253,0.19)] px-5 py-3.5">
      <h3 className="text-sm font-semibold tracking-[-0.01em] text-[#f0f0f0]">{title}</h3>
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  subLabel,
  subValue,
  current7,
  prev7,
  accentColor,
}: {
  label: string;
  value: number;
  subLabel?: string;
  subValue?: number;
  current7: number;
  prev7: number;
  accentColor: string;
}) {
  return (
    <BentoCard className="flex flex-col gap-3 p-5">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#a1a4a5]">
        {label}
      </p>
      <div className="flex items-end justify-between gap-2">
        <p
          className="text-4xl font-extrabold tabular-nums tracking-[-0.03em]"
          style={{ color: accentColor }}
        >
          {value.toLocaleString("he-IL")}
        </p>
        <TrendBadge current={current7} previous={prev7} />
      </div>
      {subLabel && subValue !== undefined && (
        <p className="text-xs text-[#a1a4a5]">
          <span className="font-medium text-[#f0f0f0]">{subValue.toLocaleString("he-IL")}</span>{" "}
          {subLabel}
        </p>
      )}
      <p className="text-[0.6875rem] text-[#464a4d]">{he.adminTrendVsLastWeek}</p>
    </BentoCard>
  );
}

// ── Shared chart legend (consistent icon↔label spacing across all charts) ──

type LegendPayloadEntry = { value: string; color?: string };

function ChartLegend({ payload }: { payload?: LegendPayloadEntry[] }) {
  if (!payload?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
      {payload.map((entry, i) => (
        <span key={i} className="flex items-center gap-2 text-[0.6875rem] text-[#a1a4a5]">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: entry.color }}
          />
          {entry.value}
        </span>
      ))}
    </div>
  );
}

// ── Area Chart ─────────────────────────────────────────────────────────────

function GrowthAreaChart({ data }: { data: DashboardTimeSeriesPoint[] }) {
  const formatted = data.map((d) => ({ ...d, label: formatChartDate(d.date) }));
  const showEvery = Math.ceil(formatted.length / 8);

  return (
    <BentoCard className="flex flex-col">
      <CardHeader title={he.adminGrowthChart} />
      <div className="p-5" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_BLUE} stopOpacity={0.25} />
                <stop offset="95%" stopColor={CHART_BLUE} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_GREEN} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CHART_GREEN} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_LINE} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#464a4d", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={showEvery - 1}
            />
            <YAxis
              tick={{ fill: "#464a4d", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={(props) => <DarkTooltip {...props} />} />
            <Legend content={(props) => <ChartLegend payload={props.payload as LegendPayloadEntry[]} />} />
            <Area
              type="monotone"
              dataKey="users"
              name={he.adminChartUsers}
              stroke={CHART_BLUE}
              strokeWidth={2}
              fill="url(#gradBlue)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="pages"
              name={he.adminChartPages}
              stroke={CHART_GREEN}
              strokeWidth={2}
              fill="url(#gradGreen)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </BentoCard>
  );
}

// ── Donut Chart ────────────────────────────────────────────────────────────

function PlanDonutChart({
  planDistribution,
  totalUsers,
}: {
  planDistribution: AdminStats["planDistribution"];
  totalUsers: number;
}) {
  if (planDistribution.length === 0) {
    return (
      <BentoCard className="flex flex-col">
        <CardHeader title={he.adminPlanDistributionChart} />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-[#464a4d]">{he.adminNoSubscriptionData}</p>
        </div>
      </BentoCard>
    );
  }

  const data = planDistribution.map((p) => ({
    name: p.name_he,
    value: p.count,
  }));

  return (
    <BentoCard className="flex flex-col">
      <CardHeader title={he.adminPlanDistributionChart} />
      <div className="flex flex-col items-center gap-4 p-5">
        <div style={{ height: 180, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={(props: TooltipContentProps) => {
                  if (!props.active || !props.payload?.length) return null;
                  const entry = props.payload[0];
                  const val = typeof entry.value === "number" ? entry.value : 0;
                  const pct = totalUsers > 0 ? Math.round((val / totalUsers) * 100) : 0;
                  const fillColor = (entry.payload as Record<string, unknown>)?.fill as string | undefined;
                  return (
                    <div className="rounded-xl border border-[rgba(214,235,253,0.19)] bg-[#0d0d0d] px-3 py-2 text-xs shadow-xl">
                      <p style={{ color: fillColor }} className="font-semibold">
                        {String(entry.name ?? "")}
                      </p>
                      <p className="text-[#a1a4a5]">
                        {val} ({pct}%)
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full space-y-2">
          {data.map((entry, i) => {
            const pct = totalUsers > 0 ? Math.round((entry.value / totalUsers) * 100) : 0;
            const color = CHART_COLORS[i % CHART_COLORS.length];
            return (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: color }}
                />
                <span className="flex-1 truncate text-[#a1a4a5]">{entry.name}</span>
                <span className="tabular-nums font-medium text-[#f0f0f0]">{entry.value}</span>
                <span className="tabular-nums text-[#464a4d]">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </BentoCard>
  );
}

// ── Weekly Bar Chart ───────────────────────────────────────────────────────

function WeeklyBarChart({ data }: { data: DashboardTimeSeriesPoint[] }) {
  const weekly = aggregateToWeeks(data);

  return (
    <BentoCard className="flex flex-col">
      <CardHeader title={he.adminWeeklyActivity} />
      <div className="p-5" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekly} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_LINE} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#464a4d", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#464a4d", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={(props) => <DarkTooltip {...props} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Legend content={(props) => <ChartLegend payload={props.payload as LegendPayloadEntry[]} />} />
            <Bar
              dataKey="users"
              name={he.adminChartUsers}
              fill={CHART_BLUE}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="pages"
              name={he.adminChartPages}
              fill={CHART_GREEN}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="submissions"
              name={he.adminChartSubmissions}
              fill={CHART_ORANGE}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </BentoCard>
  );
}

// ── Activity Feed ──────────────────────────────────────────────────────────

const ACTIVITY_ICONS: Record<RecentActivityItem["type"], React.ReactNode> = {
  user: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke={CHART_BLUE} strokeWidth="1.5" />
      <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke={CHART_BLUE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  page: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2.75" y="1.75" width="10.5" height="12.5" rx="1.5" stroke={CHART_GREEN} strokeWidth="1.5" />
      <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke={CHART_GREEN} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  ),
  submission: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke={CHART_ORANGE} strokeWidth="1.5" />
      <path d="M2 4l6 5 6-5" stroke={CHART_ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const ACTIVITY_META_LABEL: Record<string, string> = {
  published: he.adminActivityPublished,
  draft: he.adminActivityDraft,
};

function ActivityFeed({ items }: { items: RecentActivityItem[] }) {
  return (
    <BentoCard className="flex flex-col">
      <CardHeader title={he.adminRecentActivity} />
      <div className="flex-1 divide-y divide-[rgba(214,235,253,0.08)] overflow-hidden">
        {items.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-[#464a4d]">{he.adminNoRecentActivity}</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 px-5 py-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.05]">
                {ACTIVITY_ICONS[item.type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#f0f0f0]">{item.label}</p>
                {item.meta && (
                  <p className="mt-0.5 text-xs text-[#464a4d]">
                    {ACTIVITY_META_LABEL[item.meta] ?? item.meta}
                  </p>
                )}
              </div>
              <time className="shrink-0 text-[0.6875rem] text-[#464a4d]">
                {timeAgo(item.createdAt)}
              </time>
            </div>
          ))
        )}
      </div>
    </BentoCard>
  );
}

// ── Quick Actions ──────────────────────────────────────────────────────────

function QuickActions() {
  const actions = [
    { label: he.adminViewAllUsers, href: "/admin/users", icon: "👥" },
    { label: he.adminViewAllPages, href: "/admin/sections", icon: "🗂" },
    { label: he.adminCategories, href: "/admin/categories", icon: "🏷" },
    { label: he.adminSettings, href: "/admin/settings", icon: "⚙️" },
  ] as const;

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(214,235,253,0.19)] bg-transparent px-4 py-2 text-sm font-medium text-[#a1a4a5] transition-colors hover:bg-white/[0.06] hover:text-[#f0f0f0]"
        >
          <span>{a.icon}</span>
          {a.label}
        </Link>
      ))}
    </div>
  );
}

// ── Root export ────────────────────────────────────────────────────────────

interface AdminDashboardProps {
  stats: AdminStats;
  timeSeries: DashboardTimeSeriesPoint[];
  activity: RecentActivityItem[];
}

export function AdminDashboard({ stats, timeSeries, activity }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-[#f0f0f0]">
            {he.adminDashboard}
          </h1>
          <p className="mt-1.5 text-sm text-[#a1a4a5]">{he.adminDashboardSubtitle}</p>
        </div>
        <QuickActions />
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label={he.adminTotalUsers}
          value={stats.totalUsers}
          subLabel={he.adminUsersThisMonth}
          subValue={stats.usersThisMonth}
          current7={stats.usersLast7Days}
          prev7={stats.usersPrev7Days}
          accentColor={CHART_BLUE}
        />
        <KpiCard
          label={he.adminTotalPages}
          value={stats.totalPages}
          subLabel={he.adminPublishedPages}
          subValue={stats.publishedPages}
          current7={stats.pagesLast7Days}
          prev7={stats.pagesPrev7Days}
          accentColor={CHART_GREEN}
        />
        <KpiCard
          label={he.adminTotalSubmissions}
          value={stats.totalSubmissions}
          subLabel={he.adminSubmissionsThisMonth}
          subValue={stats.submissionsThisMonth}
          current7={stats.submissionsLast7Days}
          prev7={stats.submissionsPrev7Days}
          accentColor={CHART_ORANGE}
        />
        <BentoCard className="flex flex-col gap-3 p-5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#a1a4a5]">
            {he.adminPlanDistribution}
          </p>
          <p className="text-4xl font-extrabold tabular-nums tracking-[-0.03em] text-[#ffc53d]">
            {stats.planDistribution.reduce((s, p) => s + p.count, 0).toLocaleString("he-IL")}
          </p>
          <div className="space-y-1.5">
            {stats.planDistribution.slice(0, 3).map((p, i) => (
              <div key={p.slug} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="flex-1 truncate text-[#a1a4a5]">{p.name_he}</span>
                <span className="tabular-nums font-medium text-[#f0f0f0]">{p.count}</span>
              </div>
            ))}
          </div>
          <p className="text-[0.6875rem] text-[#464a4d]">{he.adminPlanColSubscribers} פעילים</p>
        </BentoCard>
      </div>

      {/* Row 2: Area Chart + Donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <GrowthAreaChart data={timeSeries} />
        </div>
        <div className="lg:col-span-1">
          <PlanDonutChart
            planDistribution={stats.planDistribution}
            totalUsers={stats.totalUsers}
          />
        </div>
      </div>

      {/* Row 3: Bar Chart + Activity Feed */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyBarChart data={timeSeries} />
        <ActivityFeed items={activity} />
      </div>
    </div>
  );
}
