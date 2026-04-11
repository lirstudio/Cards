import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { LandingPageRow, PageSectionRow } from "@/types/landing";
import type { SectionDefinitionRow, SectionStyleOverrides } from "@/types/admin";
import { he } from "@/lib/i18n/he";
import { normalizeSectionDefinitionRow } from "@/lib/sections/catalog";
import { PageEditor } from "./ui-page-editor";

export default async function EditPagePage({
  params,
  searchParams,
}: {
  params: Promise<{ pageId: string }>;
  searchParams?: Promise<{ newDraft?: string }>;
}) {
  if (!isSupabaseConfigured()) return null;

  const { pageId } = await params;
  const sp = (await searchParams) ?? {};
  const showNewDraftHint = sp.newDraft === "1";
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

  const [{ data: sections }, { data: sectionDefs }] = await Promise.all([
    supabase
      .from("page_sections")
      .select("*")
      .eq("landing_page_id", pageId)
      .order("sort_order", { ascending: true }),
    supabase.from("section_definitions").select("*").order("sort_order"),
  ]);

  const typedPage = page as unknown as LandingPageRow;
  const typedSections = (sections ?? []) as unknown as PageSectionRow[];
  const typedDefs = (sectionDefs ?? []).map((r) => {
    const raw = r as Record<string, unknown>;
    const normalized = normalizeSectionDefinitionRow(r as SectionDefinitionRow);
    return {
      ...normalized,
      style_overrides: (raw.style_overrides as SectionStyleOverrides) ?? {},
    } as SectionDefinitionRow;
  });

  const definitionStyleBySectionKey: Record<string, SectionStyleOverrides> = {};
  for (const d of typedDefs) {
    definitionStyleBySectionKey[d.key] = d.style_overrides ?? {};
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
        showNewDraftHint={showNewDraftHint}
        initialTitle={typedPage.title}
        initialTheme={{
          primary: theme.primary ?? "#3b9eff",
          background: theme.background ?? "#000000",
          heading: theme.heading ?? "#f0f0f0",
          body: theme.body ?? "#a1a4a5",
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
        definitionStyleBySectionKey={definitionStyleBySectionKey}
      />
    </div>
  );
}
