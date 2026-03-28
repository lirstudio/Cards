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
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50">
          <tr>
            <th className="px-4 py-3 text-start font-medium text-neutral-600">{he.displayName}</th>
            <th className="px-4 py-3 text-start font-medium text-neutral-600">{he.adminUserEmail}</th>
            <th className="px-4 py-3 text-start font-medium text-neutral-600">{he.adminRole}</th>
            <th className="px-4 py-3 text-start font-medium text-neutral-600">{he.adminUserPlan}</th>
            <th className="px-4 py-3 text-start font-medium text-neutral-600">{he.adminUserPages}</th>
            <th className="px-4 py-3 text-start font-medium text-neutral-600">{he.adminUserCreated}</th>
            <th className="px-4 py-3 text-start font-medium text-neutral-600">{he.adminChangeRole}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => (
            <tr
              key={user.id}
              className="border-b border-neutral-100 last:border-none"
            >
              <td className="px-4 py-3 font-medium">{user.display_name ?? "—"}</td>
              <td className="px-4 py-3 text-neutral-600" dir="ltr">{user.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {user.role === "admin" ? he.adminRoleAdmin : he.adminRoleUser}
                </span>
              </td>
              <td className="px-4 py-3 text-neutral-600">{user.plan_name ?? "—"}</td>
              <td className="px-4 py-3 text-neutral-600">{user.page_count}</td>
              <td className="px-4 py-3 text-neutral-500 text-xs" dir="ltr">
                {new Date(user.created_at).toLocaleDateString("he-IL")}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleRoleChange(user.id, user.role)}
                  className="rounded-lg border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
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
