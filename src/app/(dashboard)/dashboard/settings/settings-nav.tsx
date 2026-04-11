"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { he } from "@/lib/i18n/he";

const links = [
  { href: "/dashboard/settings/profile", label: he.settingsProfile },
  { href: "/dashboard/settings/account", label: he.settingsAccount },
  { href: "/dashboard/settings/subscription", label: he.settingsSubscription },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex shrink-0 flex-wrap gap-2 border-b border-[rgba(214,235,253,0.19)] pb-4 lg:w-52 lg:flex-col lg:border-b-0 lg:border-e lg:pb-0 lg:pe-6">
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-full px-4 py-2 text-sm transition ${
              active
                ? "bg-white text-black"
                : "text-[#a1a4a5] hover:bg-white/10 hover:text-[#f0f0f0]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
