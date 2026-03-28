import { listCategories } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
import { CategoriesManager } from "./ui-categories-manager";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{he.adminCategories}</h1>
      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
