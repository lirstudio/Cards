import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getUserQuota } from "@/lib/subscription";
import { he } from "@/lib/i18n/he";
import { CreateDraftPageForm } from "./create-draft-page-form";
import { DeleteLandingPageButton } from "./delete-landing-page-button";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const quota = await getUserQuota(supabase, user.id);

  const { data: pages } = await supabase
    .from("landing_pages")
    .select("id,slug,title,status,updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{he.myPages}</h1>
          {quota ? (
            <p className="mt-1 text-sm text-neutral-600">
              עמודים: {quota.currentCount} / {quota.maxPages}
            </p>
          ) : null}
        </div>
        {quota?.canCreate === false ? (
          <span className="rounded-full bg-neutral-400 px-6 py-2.5 text-sm font-medium text-white">
            {he.newPage}
          </span>
        ) : (
          <CreateDraftPageForm className="rounded-full bg-[var(--lc-primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-60" />
        )}
      </div>

      {!pages?.length ? (
        <p className="mt-12 text-center text-neutral-600">{he.noPages}</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {pages.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div>
                <div className="font-semibold">{p.title || p.slug}</div>
                <div className="text-sm text-neutral-500" dir="ltr">
                  /{p.slug}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {String(p.status).trim() === "published" ? he.published : he.draft}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/pages/${p.id}/edit`}
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm"
                >
                  {he.editPage}
                </Link>
                {String(p.status).trim() === "published" ? (
                  <Link
                    href={`/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                  >
                    {he.openPage}
                  </Link>
                ) : null}
                <DeleteLandingPageButton
                  pageId={p.id}
                  pageLabel={(p.title || p.slug).trim() || p.slug}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
