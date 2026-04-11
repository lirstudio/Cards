import { getAdminStats, getDashboardTimeSeries, getRecentActivity } from "@/app/actions/admin";
import { AdminDashboard } from "./ui-admin-dashboard";

export default async function AdminDashboardPage() {
  const [stats, timeSeries, activity] = await Promise.all([
    getAdminStats(),
    getDashboardTimeSeries(),
    getRecentActivity(),
  ]);

  return <AdminDashboard stats={stats} timeSeries={timeSeries} activity={activity} />;
}
