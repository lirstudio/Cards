import Link from "next/link";
import { SystemLogo } from "@/components/brand/system-logo";
import { he } from "@/lib/i18n/he";
import { LoginForm } from "./ui-login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 flex justify-center">
        <SystemLogo variant="onLight" heightClass="h-9" />
      </div>
      <h1 className="text-2xl font-bold">{he.loginTitle}</h1>
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
