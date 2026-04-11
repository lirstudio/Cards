import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isReservedSlug } from "@/lib/reserved-slugs";
import {
  getPublishedPageRowBySlug,
  PublishedLandingRoot,
} from "@/lib/landing/published-landing";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedSlug(slug)) return {};
  if (!isSupabaseConfigured()) return { title: "Cards" };
  const page = await getPublishedPageRowBySlug(slug);
  if (!page) return { title: "לא נמצא" };
  return {
    title: page.title || slug,
    openGraph: { locale: "he_IL" },
  };
}

export default async function PublicLandingPage({ params }: Props) {
  const { slug } = await params;
  if (isReservedSlug(slug)) notFound();
  if (!isSupabaseConfigured()) notFound();

  const page = await getPublishedPageRowBySlug(slug);
  if (!page) notFound();

  return <PublishedLandingRoot slug={slug} />;
}
