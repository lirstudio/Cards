import { listUsers } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
import { UsersTable } from "./ui-users-table";

export default async function AdminUsersPage() {
  const { rows, total, availablePlans } = await listUsers({ page: 0, pageSize: 50 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#f0f0f0]">{he.adminUsers}</h1>
      </div>
      <UsersTable initialRows={rows} initialTotal={total} availablePlans={availablePlans} />
    </div>
  );
}
