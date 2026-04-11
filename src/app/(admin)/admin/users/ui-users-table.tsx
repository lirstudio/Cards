"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { listUsers, exportUsersCsv } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
import type { AdminUserRow, ListUsersOpts } from "@/types/admin";
import { ToolbarSelect } from "./toolbar-select";

type SortBy = NonNullable<ListUsersOpts["sortBy"]>;
type SortDir = "asc" | "desc";

function relativeTime(iso: string | null): string {
  if (!iso) return he.adminNeverLoggedIn;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return "עכשיו";
  if (mins < 60) return `לפני ${mins} דקות`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `לפני ${hrs} שעות`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `לפני ${days} ימים`;
  const months = Math.floor(days / 30);
  if (months < 12) return `לפני ${months} חודשים`;
  return `לפני ${Math.floor(months / 12)} שנים`;
}

function initialsFor(displayName: string | null, email: string): string {
  const name = (displayName ?? "").trim();
  if (name.length >= 2) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0]! + parts[parts.length - 1][0]!).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  const local = email.split("@")[0] ?? "";
  return local.length >= 2 ? local.slice(0, 2).toUpperCase() : (local[0] ?? "?").toUpperCase();
}

const PAGE_SIZES = [25, 50, 100];

interface Props {
  initialRows: AdminUserRow[];
  initialTotal: number;
  availablePlans: { id: string; slug: string; name_he: string }[];
}

export function UsersTable({ initialRows, initialTotal, availablePlans }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(
    (opts: ListUsersOpts) => {
      startTransition(async () => {
        const result = await listUsers(opts);
        setRows(result.rows);
        setTotal(result.total);
      });
    },
    [],
  );

  function applyFilters(overrides: Partial<ListUsersOpts> = {}) {
    const opts: ListUsersOpts = {
      page,
      pageSize,
      search,
      roleFilter: roleFilter as ListUsersOpts["roleFilter"],
      planFilter,
      sortBy,
      sortDir,
      ...overrides,
    };
    fetchData(opts);
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      applyFilters({ page: 0, search });
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleRoleFilter(value: string) {
    setRoleFilter(value);
    setPage(0);
    applyFilters({ page: 0, roleFilter: value as ListUsersOpts["roleFilter"] });
  }

  function handlePlanFilter(value: string) {
    setPlanFilter(value);
    setPage(0);
    applyFilters({ page: 0, planFilter: value });
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(0);
    applyFilters({ page: 0, pageSize: value });
  }

  function handleSort(col: SortBy) {
    const newDir: SortDir = sortBy === col && sortDir === "asc" ? "desc" : "asc";
    setSortBy(col);
    setSortDir(newDir);
    setPage(0);
    applyFilters({ page: 0, sortBy: col, sortDir: newDir });
  }

  function handlePage(newPage: number) {
    setPage(newPage);
    applyFilters({ page: newPage });
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const result = await exportUsersCsv();
      if (result.ok && result.csv) {
        const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsExporting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function SortIcon({ col }: { col: SortBy }) {
    if (sortBy !== col) return <span className="ms-1 text-[#464a4d]">↕</span>;
    return <span className="ms-1 text-[var(--lc-primary)]">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={he.adminUsersSearch}
          className="h-9 flex-1 min-w-48 rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5 px-3 text-sm text-[#f0f0f0] placeholder:text-[#464a4d] focus:border-[var(--lc-primary)] focus:outline-none"
        />

        <ToolbarSelect
          wrapperClassName="min-w-[11rem]"
          value={roleFilter}
          onChange={(e) => handleRoleFilter(e.target.value)}
        >
          <option value="all">{he.adminUsersFilterRole}: {he.adminUsersFilterAll}</option>
          <option value="user">{he.adminRoleUser}</option>
          <option value="admin">{he.adminRoleAdmin}</option>
        </ToolbarSelect>

        <ToolbarSelect
          wrapperClassName="min-w-[12rem]"
          value={planFilter}
          onChange={(e) => handlePlanFilter(e.target.value)}
        >
          <option value="all">{he.adminUsersFilterPlan}: {he.adminUsersFilterAll}</option>
          {availablePlans.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name_he}</option>
          ))}
        </ToolbarSelect>

        <ToolbarSelect
          wrapperClassName="w-[4.75rem]"
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </ToolbarSelect>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="h-9 rounded-lg border border-[rgba(214,235,253,0.19)] px-3 text-sm font-medium text-[#a1a4a5] transition hover:bg-white/10 disabled:opacity-50"
        >
          {isExporting ? "..." : he.adminUsersExportCsv}
        </button>
      </div>

      {/* Table */}
      <div className={`overflow-x-auto rounded-xl border border-[rgba(214,235,253,0.19)] transition-opacity ${isPending ? "opacity-60" : ""}`}>
        <table className="w-full text-sm">
          <thead className="border-b border-[rgba(214,235,253,0.19)] bg-white/5">
            <tr>
              <th
                className="cursor-pointer px-4 py-3 text-start font-medium text-[#a1a4a5] hover:text-[#f0f0f0]"
                onClick={() => handleSort("display_name")}
              >
                {he.displayName}<SortIcon col="display_name" />
              </th>
              <th className="px-4 py-3 text-start font-medium text-[#a1a4a5]">{he.adminUserEmail}</th>
              <th className="px-4 py-3 text-start font-medium text-[#a1a4a5]">{he.adminRole}</th>
              <th className="px-4 py-3 text-start font-medium text-[#a1a4a5]">{he.adminUserPlan}</th>
              <th
                className="cursor-pointer px-4 py-3 text-start font-medium text-[#a1a4a5] hover:text-[#f0f0f0]"
                onClick={() => handleSort("page_count")}
              >
                {he.adminUserPages}<SortIcon col="page_count" />
              </th>
              <th className="px-4 py-3 text-start font-medium text-[#a1a4a5]">{he.adminUserLastLogin}</th>
              <th className="px-4 py-3 text-start font-medium text-[#a1a4a5]">{he.adminUserStatus}</th>
              <th
                className="cursor-pointer px-4 py-3 text-start font-medium text-[#a1a4a5] hover:text-[#f0f0f0]"
                onClick={() => handleSort("created_at")}
              >
                {he.adminUserCreated}<SortIcon col="created_at" />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[#464a4d]">
                  {he.adminUsersNoResults}
                </td>
              </tr>
            ) : (
              rows.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                  className="cursor-pointer border-b border-[rgba(214,235,253,0.19)] transition hover:bg-white/5 last:border-none"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--lc-primary)]/20 text-xs font-semibold text-[var(--lc-primary)]">
                        {initialsFor(user.display_name, user.email)}
                      </span>
                      <span className="font-medium text-[#f0f0f0]">
                        {user.display_name ?? <span className="text-[#464a4d]">—</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#a1a4a5]" dir="ltr">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-[var(--lc-primary)]/20 text-[var(--lc-primary)]"
                          : "bg-white/5 text-[#a1a4a5]"
                      }`}
                    >
                      {user.role === "admin" ? he.adminRoleAdmin : he.adminRoleUser}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#a1a4a5]">{user.plan_name ?? "—"}</td>
                  <td className="px-4 py-3 text-[#a1a4a5]">{user.page_count}</td>
                  <td className="px-4 py-3 text-xs text-[#464a4d]">
                    {relativeTime(user.last_sign_in_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.is_banned
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {user.is_banned ? he.adminUserBanned : he.adminUserActive}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#464a4d]" dir="ltr">
                    {new Date(user.created_at).toLocaleDateString("he-IL")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#a1a4a5]">
        <span>
          {total.toLocaleString("he-IL")} {he.adminTotalUsers}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePage(page - 1)}
            disabled={page === 0 || isPending}
            className="rounded-lg border border-[rgba(214,235,253,0.19)] px-3 py-1 transition hover:bg-white/10 disabled:opacity-40"
          >
            {he.adminUsersPrev}
          </button>
          <span>
            {page + 1} {he.adminUsersPageOf} {totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePage(page + 1)}
            disabled={page >= totalPages - 1 || isPending}
            className="rounded-lg border border-[rgba(214,235,253,0.19)] px-3 py-1 transition hover:bg-white/10 disabled:opacity-40"
          >
            {he.adminUsersNext}
          </button>
        </div>
      </div>
    </div>
  );
}
