import { getSystemSettings } from "@/app/actions/admin";
import { he } from "@/lib/i18n/he";
import { SystemSettingsEditor } from "./ui-system-settings";

export default async function AdminSettingsPage() {
  const settings = await getSystemSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{he.adminSettings}</h1>
      <SystemSettingsEditor initialSettings={settings} />
    </div>
  );
}
