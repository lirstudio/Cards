"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
import type { AdminUserRow } from "@/types/admin";

export function UsersTable({ initialRows }: { initialRows: AdminUserRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [pending, startTransition] = useTransition();

  function handleRoleChange(userId: string, currentRole: string) {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    startTransition(async () => {
      const res = await updateUserRole(userId, nextRole as "user" | "admin");
      if (res.ok) {
        setRows((prev) =>
          prev.map((r) => (r.id === userId ? { ...r, role: nextRole } : r)),
        );
      }
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(214,235,253,0.19)]">
      <table className="w-full text-sm">
        <thead className="border-b border-[rgba(214,235,253,0.19)] bg-white/5">
          <tr>
            <th className="px-4 py-3 text-start font-medium text-[#a1a4a5]">{he.displayName}</th>
            <th className="px-4 py-3 text-start font-medium text-[#a1a4a5]">{he.adminUserEmail}</th>
            <th className="px-4 py-3 text-start font-medium text-[#a1a4a5]">{he.adminRole}</th>
            <th className="px-4 py-3 text-start font-medium text-[#a1a4a5]">{he.adminUserPlan}</th>
            <th className="px-4 py-3 text-start font-medium text-[#a1a4a5]">{he.adminUserPages}</th>
            <th className="px-4 py-3 text-start font-medium text-[#a1a4a5]">{he.adminUserCreated}</th>
            <th className="px-4 py-3 text-start font-medium text-[#a1a4a5]">{he.adminChangeRole}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => (
            <tr
              key={user.id}
              className="border-b border-[rgba(214,235,253,0.19)] last:border-none"
            >
              <td className="px-4 py-3 font-medium">{user.display_name ?? "—"}</td>
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
              <td className="px-4 py-3 text-[#464a4d] text-xs" dir="ltr">
                {new Date(user.created_at).toLocaleDateString("he-IL")}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleRoleChange(user.id, user.role)}
                  className="rounded-lg border border-[rgba(214,235,253,0.19)] px-3 py-1 text-xs font-medium text-[#a1a4a5] transition hover:bg-white/10 disabled:opacity-50"
                >
                  {user.role === "admin" ? he.adminRoleUser : he.adminRoleAdmin}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
