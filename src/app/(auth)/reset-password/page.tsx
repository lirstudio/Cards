import Link from "next/link";
import { SystemLogo } from "@/components/brand/system-logo";
import { createClient } from "@/lib/supabase/server";
import { he } from "@/lib/i18n/he";
import { ResetPasswordForm } from "./ui-reset-form";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 flex justify-center">
        <SystemLogo variant="onLight" heightClass="h-9" />
      </div>
      <h1 className="text-2xl font-bold">{he.resetPasswordTitle}</h1>
      <p className="mt-2 text-sm text-neutral-600">{he.resetPasswordHint}</p>
      {user ? (
        <ResetPasswordForm />
      ) : (
        <p className="mt-8 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {he.resetSessionMissing}{" "}
          <Link href="/forgot-password" className="font-medium text-[var(--lc-primary)] underline">
            {he.forgotPasswordTitle}
          </Link>
        </p>
      )}
      <p className="mt-6 text-center text-sm text-neutral-600">
        <Link href="/login" className="font-medium text-[var(--lc-primary)]">
          {he.backToLogin}
        </Link>
      </p>
    </div>
  );
}
