import { SystemLogo } from "@/components/brand/system-logo";
import { he } from "@/lib/i18n/he";
import { UpdatePasswordForm } from "./ui-update-password-form";

export default function UpdatePasswordPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 flex justify-center">
        <SystemLogo heightClass="h-9" />
      </div>
      <h1 className="text-2xl font-bold text-[#f0f0f0]">{he.updatePasswordTitle}</h1>
      <p className="mt-2 text-sm text-[#a1a4a5]">{he.updatePasswordSubtitle}</p>
      <UpdatePasswordForm />
    </div>
  );
}
