import { listCategories, listSectionDefinitions } from "@/app/actions/admin";
import { SectionsManager } from "./ui-sections-manager";

export default async function AdminSectionsPage() {
  const [sections, categories] = await Promise.all([
    listSectionDefinitions(),
    listCategories(),
  ]);

  return (
    <div className="space-y-6">
      <SectionsManager initialSections={sections} initialCategories={categories} />
    </div>
  );
}
