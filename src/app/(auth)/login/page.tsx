import Link from "next/link";
import { SystemLogo } from "@/components/brand/system-logo";
import { he } from "@/lib/i18n/he";
import { LoginForm } from "./ui-login-form";

type Props = {
  searchParams?: Promise<{ error?: string; auth_error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const authErr = sp.auth_error ?? sp.error;
  const authMessage =
    authErr === "otp_expired"
      ? he.authOtpExpired
      : authErr === "access_denied"
        ? he.authAccessDenied
        : authErr === "auth_callback"
          ? he.authCallbackError
          : null;

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 flex justify-center">
        <SystemLogo variant="onLight" heightClass="h-9" />
      </div>
      <h1 className="text-2xl font-bold">{he.loginTitle}</h1>
      {authMessage ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{authMessage}</p>
      ) : null}
      <LoginForm />
      <p className="mt-6 text-center text-sm text-neutral-600">
        אין חשבון?{" "}
        <Link href="/signup" className="font-medium text-[var(--lc-primary)]">
          {he.signup}
        </Link>
      </p>
    </div>
  );
}
