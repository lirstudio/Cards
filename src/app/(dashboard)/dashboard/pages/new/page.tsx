import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getUserQuota } from "@/lib/subscription";
import { he } from "@/lib/i18n/he";
import { NewPageForm } from "./ui-new-page-form";

export default async function NewPagePage() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const quota = user ? await getUserQuota(supabase, user.id) : null;
  const { data: templates } = await supabase.from("templates").select("slug,name_he,tier");

  if (!quota?.canCreate) {
    return (
      <div>
        <Link href="/dashboard" className="text-sm text-[var(--lc-primary)]">
          ← {he.back}
        </Link>
        <p className="mt-8 text-neutral-600">{he.quotaExceeded}</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-[var(--lc-primary)]">
        ← {he.back}
      </Link>
      <h1 className="mt-6 text-2xl font-bold">{he.newPage}</h1>
      <NewPageForm
        templates={(templates ?? []).map((t) => ({
          slug: t.slug,
          name: t.name_he,
          tier: t.tier,
        }))}
        maxTier={quota.allowedTier}
      />
    </div>
  );
}
