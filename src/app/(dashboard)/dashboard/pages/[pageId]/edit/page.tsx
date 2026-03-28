import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { LandingPageRow, PageSectionRow } from "@/types/landing";
import type {
  SectionDefinitionRow,
  SectionStyleOverrides,
  SectionVariantPickerRow,
} from "@/types/admin";
import { he } from "@/lib/i18n/he";
import { PageEditor } from "./ui-page-editor";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  if (!isSupabaseConfigured()) return null;

  const { pageId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: page } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!page) notFound();

  const [{ data: sections }, { data: sectionDefs }, { data: allVariants }] = await Promise.all([
    supabase
      .from("page_sections")
      .select("*")
      .eq("landing_page_id", pageId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("section_definitions")
      .select("*")
      .order("sort_order"),
    supabase
      .from("section_variants")
      .select("id, section_key, name_he, style_overrides, is_default, sort_order")
      .eq("enabled", true),
  ]);

  const typedPage = page as unknown as LandingPageRow;
  const typedSections = (sections ?? []) as unknown as PageSectionRow[];
  const typedDefs = (sectionDefs ?? []) as unknown as SectionDefinitionRow[];

  const variantIds = [
    ...new Set(typedSections.map((s) => s.variant_id).filter(Boolean)),
  ] as string[];
  let variantStyleBySectionId: Record<string, SectionStyleOverrides> = {};
  if (variantIds.length > 0) {
    const { data: vars } = await supabase
      .from("section_variants")
      .select("id, style_overrides")
      .in("id", variantIds);
    const byVariantId = new Map(
      (vars ?? []).map((v) => [v.id as string, v.style_overrides as SectionStyleOverrides]),
    );
    for (const s of typedSections) {
      if (s.variant_id && byVariantId.has(s.variant_id)) {
        variantStyleBySectionId[s.id] = byVariantId.get(s.variant_id)!;
      }
    }
  }

  const variantsBySectionKey: Record<string, SectionVariantPickerRow[]> = {};
  const variantRows = [...(allVariants ?? [])] as Array<{
    id: string;
    section_key: string;
    name_he: string;
    style_overrides: unknown;
    is_default: boolean;
    sort_order: number;
  }>;
  variantRows.sort((a, b) => {
    const cmp = String(a.section_key).localeCompare(String(b.section_key));
    if (cmp !== 0) return cmp;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  for (const row of variantRows) {
    const k = row.section_key;
    if (!variantsBySectionKey[k]) variantsBySectionKey[k] = [];
    variantsBySectionKey[k].push({
      id: row.id,
      section_key: k,
      name_he: row.name_he,
      style_overrides: row.style_overrides as SectionStyleOverrides,
      is_default: row.is_default,
      sort_order: row.sort_order,
    });
  }

  const theme = typedPage.theme ?? {};

  const sectionsFingerprint = [...typedSections]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s) => `${s.id}:${JSON.stringify(s.content)}:${s.visible}`)
    .join("|");

  return (
    <div>
      <PageEditor
        key={`${typedPage.updated_at}-${sectionsFingerprint}`}
        pageId={pageId}
        slug={typedPage.slug}
        status={typedPage.status}
        initialTitle={typedPage.title}
        initialTheme={{
          primary: theme.primary ?? "#0b43b4",
          background: theme.background ?? "#f8f9fa",
          heading: theme.heading ?? "#000000",
          body: theme.body ?? "#4b5563",
          siteLogoUrl: theme.siteLogoUrl ?? "",
          noSectionAnimations: theme.noSectionAnimations === true,
        }}
        pageHeadline={typedPage.title || he.editPage}
        sections={typedSections.map((s) => ({
          id: s.id,
          section_key: s.section_key,
          content: s.content as Record<string, unknown>,
          visible: s.visible,
        }))}
        sectionDefs={typedDefs}
        variantStyleBySectionId={variantStyleBySectionId}
        variantsBySectionKey={variantsBySectionKey}
      />
    </div>
  );
}
