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
          <h1 className="text-2xl font-bold text-[#f0f0f0]">{he.myPages}</h1>
          {quota ? (
            <p className="mt-1 text-sm text-[#a1a4a5]">
              עמודים: {quota.currentCount} / {quota.maxPages}
            </p>
          ) : null}
        </div>
        {quota?.canCreate === false ? (
          <span className="rounded-full bg-[#464a4d] px-6 py-2.5 text-sm font-medium text-[#a1a4a5]">
            {he.newPage}
          </span>
        ) : (
          <CreateDraftPageForm className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60" />
        )}
      </div>

      {!pages?.length ? (
        <p className="mt-12 text-center text-[#a1a4a5]">{he.noPages}</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {pages.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[rgba(214,235,253,0.19)] bg-transparent p-4"
            >
              <div>
                <div className="font-semibold text-[#f0f0f0]">{p.title || p.slug}</div>
                <div className="text-sm text-[#a1a4a5]" dir="ltr">
                  /{p.slug}
                </div>
                <div className="mt-1 text-xs text-[#a1a4a5]">
                  {String(p.status).trim() === "published" ? he.published : he.draft}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/pages/${p.id}/edit`}
                  className="rounded-full border border-[rgba(214,235,253,0.19)] px-4 py-2 text-sm text-[#f0f0f0] hover:bg-white/10"
                >
                  {he.editPage}
                </Link>
                {String(p.status).trim() === "published" ? (
                  <Link
                    href={`/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-[rgba(214,235,253,0.19)] px-4 py-2 text-sm font-medium text-[#f0f0f0] hover:bg-white/10"
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
