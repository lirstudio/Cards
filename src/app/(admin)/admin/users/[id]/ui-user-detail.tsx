"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  updateUserRole,
  updateUserPlan,
  disableUser,
  enableUser,
  deleteUser,
  impersonateUser,
  sendAdminPasswordReset,
} from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
import type { AdminUserDetail } from "@/types/admin";
import { ToolbarSelect } from "../toolbar-select";

// ── Helpers ──

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

function formatStorage(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return he.adminNeverLoggedIn;
  return new Date(iso).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Sub-components ──

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 p-4">
      <p className="text-xs text-[#a1a4a5]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#f0f0f0]">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[#464a4d]">{sub}</p>}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/[0.03] p-5">
      <h3 className="mb-4 text-sm font-semibold text-[#a1a4a5] uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FeedbackBadge({ state }: { state: "success" | "error" | null }) {
  if (!state) return null;
  return (
    <span
      className={`text-xs font-medium ${state === "success" ? "text-green-400" : "text-red-400"}`}
    >
      {state === "success" ? he.adminActionSuccess : he.adminActionFailed}
    </span>
  );
}

// ── Main component ──

export function UserDetailView({ user: initial }: { user: AdminUserDetail }) {
  const router = useRouter();
  const [user, setUser] = useState(initial);
  const [isPending, startTransition] = useTransition();

  // Role
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [roleFeedback, setRoleFeedback] = useState<"success" | "error" | null>(null);

  // Plan
  const [selectedPlanId, setSelectedPlanId] = useState(user.subscription_plan_id ?? "");
  const [planFeedback, setPlanFeedback] = useState<"success" | "error" | null>(null);

  // Password reset
  const [resetFeedback, setResetFeedback] = useState<"success" | "error" | null>(null);

  // Disable/Enable
  const [disableFeedback, setDisableFeedback] = useState<"success" | "error" | null>(null);

  // Impersonate
  const [impersonateLink, setImpersonateLink] = useState<string | null>(null);
  const [impersonateCopied, setImpersonateCopied] = useState(false);
  const [impersonateFeedback, setImpersonateFeedback] = useState<"success" | "error" | null>(null);

  // Delete
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<"success" | "error" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleRoleChange() {
    if (selectedRole === user.role) return;
    setRoleFeedback(null);
    startTransition(async () => {
      const res = await updateUserRole(user.id, selectedRole as "user" | "admin");
      if (res.ok) {
        setUser((u) => ({ ...u, role: selectedRole }));
        setRoleFeedback("success");
      } else {
        setRoleFeedback("error");
      }
    });
  }

  function handlePlanChange() {
    if (!selectedPlanId || selectedPlanId === user.subscription_plan_id) return;
    setPlanFeedback(null);
    startTransition(async () => {
      const res = await updateUserPlan(user.id, selectedPlanId);
      if (res.ok) {
        const plan = user.available_plans.find((p) => p.id === selectedPlanId);
        setUser((u) => ({
          ...u,
          subscription_plan_id: selectedPlanId,
          plan_id: selectedPlanId,
          plan_name: plan?.name_he ?? u.plan_name,
          plan_slug: plan?.slug ?? u.plan_slug,
        }));
        setPlanFeedback("success");
      } else {
        setPlanFeedback("error");
      }
    });
  }

  function handlePasswordReset() {
    setResetFeedback(null);
    startTransition(async () => {
      const res = await sendAdminPasswordReset(user.id);
      setResetFeedback(res.ok ? "success" : "error");
    });
  }

  function handleDisable() {
    if (!confirm(he.adminDisableUserConfirm)) return;
    setDisableFeedback(null);
    startTransition(async () => {
      const res = await disableUser(user.id);
      if (res.ok) {
        setUser((u) => ({ ...u, is_banned: true }));
        setDisableFeedback("success");
      } else {
        setDisableFeedback("error");
      }
    });
  }

  function handleEnable() {
    if (!confirm(he.adminEnableUserConfirm)) return;
    setDisableFeedback(null);
    startTransition(async () => {
      const res = await enableUser(user.id);
      if (res.ok) {
        setUser((u) => ({ ...u, is_banned: false }));
        setDisableFeedback("success");
      } else {
        setDisableFeedback("error");
      }
    });
  }

  function handleImpersonate() {
    setImpersonateFeedback(null);
    setImpersonateLink(null);
    startTransition(async () => {
      const res = await impersonateUser(user.id);
      if (res.ok && res.link) {
        setImpersonateLink(res.link);
        setImpersonateFeedback("success");
      } else {
        setImpersonateFeedback("error");
      }
    });
  }

  function handleCopyLink() {
    if (!impersonateLink) return;
    navigator.clipboard.writeText(impersonateLink).then(() => {
      setImpersonateCopied(true);
      setTimeout(() => setImpersonateCopied(false), 2000);
    });
  }

  async function handleDelete() {
    if (deleteEmail !== user.email) return;
    setIsDeleting(true);
    setDeleteFeedback(null);
    const res = await deleteUser(user.id);
    if (res.ok) {
      router.push("/admin/users");
    } else {
      setDeleteFeedback("error");
      setIsDeleting(false);
    }
  }

  const publishedCount = user.pages.filter((p) => p.status === "published").length;
  const draftCount = user.pages.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Header: avatar + basic info */}
      <div className="flex items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--lc-primary)]/20 text-xl font-bold text-[var(--lc-primary)]">
          {initialsFor(user.display_name, user.email)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-[#f0f0f0] truncate">
              {user.display_name ?? user.email}
            </h1>
            <span
              className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                user.role === "admin"
                  ? "bg-[var(--lc-primary)]/20 text-[var(--lc-primary)]"
                  : "bg-white/5 text-[#a1a4a5]"
              }`}
            >
              {user.role === "admin" ? he.adminRoleAdmin : he.adminRoleUser}
            </span>
            <span
              className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                user.is_banned
                  ? "bg-red-500/20 text-red-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {user.is_banned ? he.adminUserBanned : he.adminUserActive}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#a1a4a5]" dir="ltr">
            {user.email}
          </p>
          <div className="mt-1 flex flex-wrap gap-4 text-xs text-[#464a4d]">
            <span>{he.adminMemberSince}: {new Date(user.created_at).toLocaleDateString("he-IL")}</span>
            <span>{he.adminUserLastLogin}: {formatDate(user.last_sign_in_at)}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label={he.adminUserStatPages}
          value={user.page_count}
          sub={`${publishedCount} ${he.published} / ${draftCount} ${he.draft}`}
        />
        <StatCard
          label={he.adminUserStatSubmissions}
          value={user.total_submissions.toLocaleString("he-IL")}
        />
        <StatCard
          label={he.adminUserStatStorage}
          value={formatStorage(user.storage_bytes)}
        />
        <StatCard
          label={he.adminUserStatPlan}
          value={user.plan_name ?? "—"}
          sub={
            user.current_period_end
              ? `${he.adminRenewalDate}: ${new Date(user.current_period_end).toLocaleDateString("he-IL")}`
              : he.adminNoRenewalDate
          }
        />
      </div>

      {/* Pages table */}
      <SectionCard title={he.adminUserPagesSection}>
        {user.pages.length === 0 ? (
          <p className="text-sm text-[#464a4d]">{he.adminUserPagesEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[rgba(214,235,253,0.19)]">
                <tr>
                  <th className="pb-2 text-start font-medium text-[#a1a4a5]">{he.pageTitle}</th>
                  <th className="pb-2 text-start font-medium text-[#a1a4a5]">{he.adminPageSlug}</th>
                  <th className="pb-2 text-start font-medium text-[#a1a4a5]">{he.adminUserStatus}</th>
                  <th className="pb-2 text-start font-medium text-[#a1a4a5]">{he.adminUserCreated}</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {user.pages.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[rgba(214,235,253,0.06)] last:border-none"
                  >
                    <td className="py-2.5 font-medium text-[#f0f0f0]">
                      {p.title || <span className="text-[#464a4d]">—</span>}
                    </td>
                    <td className="py-2.5 text-[#a1a4a5]" dir="ltr">
                      {p.slug}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === "published"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/5 text-[#464a4d]"
                        }`}
                      >
                        {p.status === "published" ? he.published : he.draft}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs text-[#464a4d]" dir="ltr">
                      {new Date(p.created_at).toLocaleDateString("he-IL")}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        {p.status === "published" && (
                          <a
                            href={`/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--lc-primary)] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {he.adminOpenPage}
                          </a>
                        )}
                        <Link
                          href={`/dashboard/pages/${p.id}/edit`}
                          className="text-xs text-[#a1a4a5] hover:text-[#f0f0f0] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {he.adminEditPageLink}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Admin actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Change role */}
        <SectionCard title={he.adminChangeRoleSection}>
          <div className="flex items-center gap-3">
            <ToolbarSelect
              wrapperClassName="min-w-0 flex-1"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={isPending}
            >
              <option value="user">{he.adminRoleUser}</option>
              <option value="admin">{he.adminRoleAdmin}</option>
            </ToolbarSelect>
            <button
              type="button"
              onClick={handleRoleChange}
              disabled={isPending || selectedRole === user.role}
              className="h-9 rounded-lg bg-[var(--lc-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {he.adminChangeRoleBtn}
            </button>
          </div>
          <div className="mt-2">
            <FeedbackBadge state={roleFeedback} />
          </div>
        </SectionCard>

        {/* Change plan */}
        <SectionCard title={he.adminChangePlanSection}>
          <div className="flex items-center gap-3">
            <ToolbarSelect
              wrapperClassName="min-w-0 flex-1"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              disabled={isPending}
            >
              <option value="">— {he.adminUsersFilterAll} —</option>
              {user.available_plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name_he}
                </option>
              ))}
            </ToolbarSelect>
            <button
              type="button"
              onClick={handlePlanChange}
              disabled={isPending || !selectedPlanId || selectedPlanId === user.subscription_plan_id}
              className="h-9 rounded-lg bg-[var(--lc-primary)] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {he.adminChangePlanBtn}
            </button>
          </div>
          <div className="mt-2">
            <FeedbackBadge state={planFeedback} />
          </div>
        </SectionCard>

        {/* Password reset */}
        <SectionCard title={he.adminSendPasswordResetSection}>
          <p className="mb-3 text-xs text-[#464a4d]">{user.email}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={isPending}
              className="h-9 rounded-lg border border-[rgba(214,235,253,0.19)] px-4 text-sm font-medium text-[#a1a4a5] transition hover:bg-white/10 disabled:opacity-50"
            >
              {he.adminSendPasswordResetBtn}
            </button>
            <FeedbackBadge state={resetFeedback} />
          </div>
        </SectionCard>

        {/* Disable / Enable */}
        <SectionCard title={he.adminDisableUserSection}>
          <p className="mb-3 text-xs text-[#464a4d]">
            {user.is_banned ? he.adminUserBanned : he.adminUserActive}
          </p>
          <div className="flex items-center gap-3">
            {user.is_banned ? (
              <button
                type="button"
                onClick={handleEnable}
                disabled={isPending}
                className="h-9 rounded-lg border border-green-500/30 px-4 text-sm font-medium text-green-400 transition hover:bg-green-500/10 disabled:opacity-50"
              >
                {he.adminEnableUserBtn}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDisable}
                disabled={isPending}
                className="h-9 rounded-lg border border-orange-500/30 px-4 text-sm font-medium text-orange-400 transition hover:bg-orange-500/10 disabled:opacity-50"
              >
                {he.adminDisableUserBtn}
              </button>
            )}
            <FeedbackBadge state={disableFeedback} />
          </div>
        </SectionCard>

        {/* Impersonate */}
        <SectionCard title={he.adminImpersonateSection}>
          <p className="mb-3 text-xs text-[#464a4d]">{he.adminImpersonateWarning}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleImpersonate}
              disabled={isPending}
              className="h-9 rounded-lg border border-[rgba(214,235,253,0.19)] px-4 text-sm font-medium text-[#a1a4a5] transition hover:bg-white/10 disabled:opacity-50"
            >
              {he.adminImpersonateBtn}
            </button>
            {impersonateLink && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="h-9 rounded-lg border border-[var(--lc-primary)]/40 px-3 text-sm font-medium text-[var(--lc-primary)] transition hover:bg-[var(--lc-primary)]/10"
              >
                {impersonateCopied ? he.adminImpersonateCopied : he.adminImpersonateCopy}
              </button>
            )}
            <FeedbackBadge state={impersonateFeedback} />
          </div>
        </SectionCard>

        {/* Delete user */}
        <SectionCard title={he.adminDeleteUserSection}>
          {!deleteConfirming ? (
            <button
              type="button"
              onClick={() => setDeleteConfirming(true)}
              className="h-9 rounded-lg border border-red-500/30 px-4 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
            >
              {he.adminDeleteUserBtn}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#a1a4a5]">{he.adminDeleteUserConfirmPrompt}</p>
              <input
                type="email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                placeholder={user.email}
                dir="ltr"
                className="h-9 w-full rounded-lg border border-red-500/30 bg-transparent px-3 text-sm text-[#f0f0f0] placeholder:text-[#464a4d] focus:border-red-400 focus:outline-none"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteEmail !== user.email || isDeleting}
                  className="h-9 rounded-lg bg-red-500 px-4 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-40"
                >
                  {isDeleting ? he.adminDeleteUserDeleting : he.adminDeleteUserConfirmBtn}
                </button>
                <button
                  type="button"
                  onClick={() => { setDeleteConfirming(false); setDeleteEmail(""); }}
                  className="h-9 rounded-lg border border-[rgba(214,235,253,0.19)] px-4 text-sm text-[#a1a4a5] transition hover:bg-white/10"
                >
                  {he.cancel}
                </button>
                <FeedbackBadge state={deleteFeedback} />
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
