import Link from "next/link";
import { notFound } from "next/navigation";
import { getSectionDefinition } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
import { SectionEditor } from "./ui-section-editor";

export default async function AdminSectionDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const { definition, variants, categories } = await getSectionDefinition(key);

  if (!definition) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/sections"
          className="text-sm text-blue-600 hover:underline"
        >
          ← {he.adminSections}
        </Link>
        <h1 className="text-2xl font-bold">{definition.title_he}</h1>
        <code className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
          {definition.key}
        </code>
      </div>
      <SectionEditor
        definition={definition}
        initialVariants={variants}
        categories={categories}
      />
    </div>
  );
}
