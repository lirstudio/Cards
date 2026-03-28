import { listSectionDefinitions } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
import { SectionsManager } from "./ui-sections-manager";

export default async function AdminSectionsPage() {
  const sections = await listSectionDefinitions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{he.adminSections}</h1>
      <SectionsManager initialSections={sections} />
    </div>
  );
}
