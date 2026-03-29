import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SectionRenderer } from "@/components/landing/SectionRenderer";
import { isReservedSlug } from "@/lib/reserved-slugs";
import type { LandingPageRow, PageSectionRow } from "@/types/landing";
import type { SectionStyleOverrides } from "@/types/admin";

type Props = { params: Promise<{ slug: string }> };

const getPublishedPageRowBySlug = cache(async (slug: string): Promise<LandingPageRow | null> => {
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return page ? (page as unknown as LandingPageRow) : null;
});

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

  const supabase = await createClient();
  const page = await getPublishedPageRowBySlug(slug);
  if (!page) notFound();

  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("landing_page_id", page.id)
    .order("sort_order", { ascending: true });

  const typedPage = page;
  const typedSections = (sections ?? []) as unknown as PageSectionRow[];

  const variantIds = typedSections.map((s) => s.variant_id).filter(Boolean) as string[];
  const variantMap = new Map<string, SectionStyleOverrides>();
  if (variantIds.length > 0) {
    const { data: variants } = await supabase
      .from("section_variants")
      .select("id, style_overrides")
      .in("id", variantIds);
    for (const v of variants ?? []) {
      variantMap.set(v.id, v.style_overrides as SectionStyleOverrides);
    }
  }

  const pageNavSections = typedSections.map((s) => ({
    sectionKey: s.section_key,
    sectionId: s.id,
    visible: s.visible,
  }));

  return (
    <div
      id="lc-page-top"
      className="lc-page-root min-h-full overflow-x-clip"
      style={{
        backgroundColor: typedPage.theme?.background ?? "#f8f9fa",
      }}
    >
      {typedSections.map((s) => (
        <SectionRenderer
          key={s.id}
          sectionKey={s.section_key}
          content={s.content as Record<string, unknown>}
          visible={s.visible}
          theme={typedPage.theme ?? {}}
          landingPageId={typedPage.id}
          sectionId={s.id}
          variantStyleOverrides={s.variant_id ? variantMap.get(s.variant_id) : undefined}
          pageNavSections={pageNavSections}
        />
      ))}
    </div>
  );
}
