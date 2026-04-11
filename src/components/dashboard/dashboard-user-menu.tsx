"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { he } from "@/lib/i18n/he";

function initialsFromDisplay(displayName: string | null, email: string) {
  const name = (displayName ?? "").trim();
  if (name.length >= 2) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2);
  }
  const local = email.split("@")[0] ?? "";
  return local.length >= 2 ? local.slice(0, 2).toUpperCase() : (local[0] ?? "?").toUpperCase();
}

export function DashboardUserMenu({
  displayName,
  email,
  avatarUrl,
  isAdmin,
}: {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const initials = initialsFromDisplay(displayName, email);
  const showAvatarImage =
    Boolean(avatarUrl?.trim()) && !avatarUrl!.startsWith("data:");

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-[rgba(214,235,253,0.19)] bg-transparent py-1 ps-1 pe-2 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lc-primary)]"
        aria-label={he.userAccountMenu}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--lc-primary)] text-xs font-semibold text-white">
          {showAvatarImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL חיצוני ממטא־דאטה
            <img
              src={avatarUrl!}
              alt=""
              className="h-full w-full object-cover"
              width={36}
              height={36}
            />
          ) : (
            <span aria-hidden>{initials}</span>
          )}
        </span>
        <span className="max-w-[10rem] truncate text-start text-sm font-medium text-[#f0f0f0]">
          {displayName?.trim() || email.split("@")[0]}
        </span>
        <span className="text-[#a1a4a5]" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 min-w-[14rem] rounded-xl border border-[rgba(214,235,253,0.19)] bg-[#0a0a0a] py-1 shadow-[0_0_0_1px_rgba(176,199,217,0.145)]"
        >
          <div className="border-b border-[rgba(214,235,253,0.19)] px-3 py-2" dir="ltr">
            <p className="truncate text-xs text-[#a1a4a5]">{email}</p>
          </div>
          <Link
            href="/dashboard/settings/profile"
            role="menuitem"
            className="block px-3 py-2 text-sm text-[#f0f0f0] hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            {he.settings}
          </Link>
          <Link
            href="/dashboard/billing"
            role="menuitem"
            className="block px-3 py-2 text-sm text-[#f0f0f0] hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            {he.billing}
          </Link>
          {isAdmin ? (
            <Link
              href="/admin"
              role="menuitem"
              className="block px-3 py-2 text-sm font-medium text-[var(--lc-primary)] hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              {he.adminDashboard}
            </Link>
          ) : null}
          <form action={signOut} className="border-t border-[rgba(214,235,253,0.19)] pt-1">
            <button
              type="submit"
              role="menuitem"
              className="w-full px-3 py-2 text-start text-sm text-[#a1a4a5] hover:bg-white/10 hover:text-[#f0f0f0]"
            >
              {he.logout}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
