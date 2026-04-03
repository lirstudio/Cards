import Link from "next/link";
import { SystemLogo } from "@/components/brand/system-logo";
import { he } from "@/lib/i18n/he";
import { ForgotPasswordForm } from "./ui-forgot-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 flex justify-center">
        <SystemLogo variant="onLight" heightClass="h-9" />
      </div>
      <h1 className="text-2xl font-bold">{he.forgotPasswordTitle}</h1>
      <p className="mt-2 text-sm text-neutral-600">{he.forgotPasswordHint}</p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-neutral-600">
        <Link href="/login" className="font-medium text-[var(--lc-primary)]">
          {he.backToLogin}
        </Link>
      </p>
    </div>
  );
}
