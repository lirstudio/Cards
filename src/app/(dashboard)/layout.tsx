import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthSessionMissingError } from "@supabase/auth-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { he } from "@/lib/i18n/he";
import { SystemLogo } from "@/components/brand/system-logo";
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";

/** מונע prerender בזמן build עם cookies / Supabase. */
export const dynamic = "force-dynamic";

export default async function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-full px-4 py-16">
        <p className="mx-auto max-w-lg text-center text-neutral-700">
          כדי להשתמש בלוח הבקרה חובה לחבר את Supabase: צרו קובץ{" "}
          <code className="rounded bg-neutral-200 px-1">.env.local</code> והעתיקו אליו את{" "}
          <code className="rounded bg-neutral-200 px-1">NEXT_PUBLIC_SUPABASE_URL</code> ו־
          <code className="rounded bg-neutral-200 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> מפרויקט
          ה־API בדשבורד.
        </p>
        <p className="mt-4 text-center">
          <Link href="/" className="text-[var(--lc-primary)] underline">
            חזרה לדף הבית
          </Link>
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    // אין סשן — לא מציגים "שגיאת התחברות"; מפנים להתחברות
    if (authError && !isAuthSessionMissingError(authError)) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const isLocalDev =
        url.includes("127.0.0.1") || url.includes("localhost") || url.includes("::1");
      return (
        <div className="min-h-full px-4 py-16">
          <p className="mx-auto max-w-lg text-center text-neutral-700">
            {isLocalDev ? (
              <>
                {he.supabaseLocalUnavailable}{" "}
                <code className="rounded bg-neutral-200 px-1">npm run supabase:start</code>
              </>
            ) : (
              <>
                {he.supabaseAuthError}: {authError.message}
              </>
            )}
          </p>
          <p className="mt-4 text-center">
            <Link href="/" className="text-[var(--lc-primary)] underline">
              {he.back} לדף הבית
            </Link>
          </p>
        </div>
      );
    }
    redirect("/login");
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = (profileRow?.display_name as string | null) ?? null;
  const isAdmin = profileRow?.role === "admin";
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const avatarUrlRaw =
    (typeof meta?.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta?.picture === "string" && meta.picture) ||
    null;

  return (
    <div className="min-h-full">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/dashboard" className="inline-flex items-center" aria-label={he.siteName}>
            <SystemLogo variant="onLight" heightClass="h-9" />
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-neutral-700 hover:text-black">
              {he.myPages}
            </Link>
            <DashboardUserMenu
              displayName={displayName}
              email={user.email ?? ""}
              avatarUrl={avatarUrlRaw}
              isAdmin={isAdmin}
            />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
