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
      <Link
        href="/admin/sections"
        className="inline-block text-sm text-blue-600 hover:underline"
      >
        ← {he.adminSections}
      </Link>
      <SectionEditor
        definition={definition}
        initialVariants={variants}
        categories={categories}
      />
    </div>
  );
}
