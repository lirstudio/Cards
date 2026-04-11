import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserDetail } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
import { UserDetailView } from "./ui-user-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getUserDetail(id);

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/users"
          className="text-sm text-[#a1a4a5] transition hover:text-[#f0f0f0]"
        >
          ← {he.adminUserBackToList}
        </Link>
      </div>
      <UserDetailView user={user} />
    </div>
  );
}
