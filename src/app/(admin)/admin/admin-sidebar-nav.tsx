"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminNavItem = { href: string; label: string };

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebarNav({ items }: { items: readonly AdminNavItem[] }) {
  const pathname = usePathname() ?? "";

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={
                active
                  ? "block rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-[0_0_0_1px_var(--ring-shadow)]"
                  : "block rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-white"
              }
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
