import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { he } from "@/lib/i18n/he";
import { SystemLogo } from "@/components/brand/system-logo";
import { AdminSidebarNav } from "./admin-sidebar-nav";

/** מונע prerender בזמן build בלי Supabase / session (Vercel). */
export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { href: "/admin", label: he.adminDashboard },
  { href: "/admin/users", label: he.adminUsers },
  { href: "/admin/sections", label: he.adminSections },
  { href: "/admin/categories", label: he.adminCategories },
  { href: "/admin/settings", label: he.adminSettings },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-[var(--background)]" dir="rtl">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-e border-[var(--frost-border)] bg-[#0a0a0a]">
        <div className="border-b border-[var(--frost-border)] px-4 py-4">
          <Link href="/admin" aria-label={he.siteName}>
            <SystemLogo heightClass="h-8" />
          </Link>
          <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">{he.admin}</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <AdminSidebarNav items={NAV_ITEMS} />
        </nav>
        <div className="border-t border-[var(--frost-border)] p-3">
          <Link
            href="/dashboard"
            className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-white"
          >
            ← {he.adminBackToDashboard}
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
