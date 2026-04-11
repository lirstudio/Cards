import { SystemLogo } from "@/components/brand/system-logo";
import { he } from "@/lib/i18n/he";
import { ForgotPasswordForm } from "./ui-forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 flex justify-center">
        <SystemLogo heightClass="h-9" />
      </div>
      <h1 className="text-2xl font-bold text-[#f0f0f0]">{he.forgotPasswordTitle}</h1>
      <p className="mt-2 text-sm text-[#a1a4a5]">{he.forgotPasswordSubtitle}</p>
      <ForgotPasswordForm />
    </div>
  );
}
