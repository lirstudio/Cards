import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SystemLogo } from "@/components/brand/system-logo";
import { he } from "@/lib/i18n/he";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  getPublishedPageRowBySlug,
  PublishedLandingRoot,
} from "@/lib/landing/published-landing";

export const dynamic = "force-dynamic";

function marketingLandingSlug() {
  return process.env.NEXT_PUBLIC_MARKETING_LANDING_SLUG?.trim() ?? "";
}

export async function generateMetadata(): Promise<Metadata> {
  const slug = marketingLandingSlug();
  if (slug && isSupabaseConfigured()) {
    const page = await getPublishedPageRowBySlug(slug);
    if (page) {
      return {
        title: page.title || he.tagline,
        openGraph: { locale: "he_IL" },
      };
    }
  }
  return {
    title: he.tagline,
    openGraph: { locale: "he_IL" },
  };
}

export default async function HomePage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }

  const slug = marketingLandingSlug();
  if (slug && isSupabaseConfigured()) {
    const published = await getPublishedPageRowBySlug(slug);
    if (published) {
      return <PublishedLandingRoot slug={slug} />;
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex justify-center">
        <SystemLogo heightClass="h-10" />
      </div>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#f0f0f0] md:text-5xl">
        {he.tagline}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-[#a1a4a5]">
        בנו עמודי נחיתה מקצועיים בעברית, עם תבניות מוכנות ועורך גמיש — הכל תחת דומיין אחד.
      </p>
      <p className="mt-4 max-w-xl text-sm text-[#464a4d]">
        לעמוד שיווקי מלא: פרסמו עמוד במערכת והגדירו בקובץ{" "}
        <code className="rounded bg-white/10 px-1" dir="ltr">
          .env.local
        </code>{" "}
        את{" "}
        <code className="rounded bg-white/10 px-1" dir="ltr">
          NEXT_PUBLIC_MARKETING_LANDING_SLUG
        </code>{" "}
        לערך ה-slug של העמוד (למשל אותו slug כמו בכתובת הציבורית).
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/login"
          className="rounded-full bg-white px-8 py-3 text-sm font-medium text-black hover:bg-white/90"
        >
          {he.login}
        </Link>
        <Link
          href="/signup"
          className="rounded-full border border-[rgba(214,235,253,0.19)] px-8 py-3 text-sm font-medium text-[#f0f0f0] hover:bg-white/10"
        >
          {he.signup}
        </Link>
      </div>
    </div>
  );
}
