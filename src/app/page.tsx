import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { he } from "@/lib/i18n/he";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { MarketingLanding } from "@/components/marketing/marketing-landing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${he.siteName} — ${he.tagline}`,
  description:
    "בנו עמודי נחיתה מקצועיים בעברית עם עורך ויזואלי, ספריית סקשנים, טפסי לידים ופרסום מיידי.",
  openGraph: { locale: "he_IL" },
};

export default async function HomePage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }

  return <MarketingLanding />;
}
