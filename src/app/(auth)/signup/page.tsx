import Link from "next/link";
import { SystemLogo } from "@/components/brand/system-logo";
import { he } from "@/lib/i18n/he";
import { SignupForm } from "./ui-signup-form";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 flex justify-center">
        <SystemLogo heightClass="h-9" />
      </div>
      <h1 className="text-2xl font-bold text-[#f0f0f0]">{he.signupTitle}</h1>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-[#a1a4a5]">
        כבר רשומים?{" "}
        <Link href="/login" className="font-medium text-[var(--lc-primary)]">
          {he.login}
        </Link>
      </p>
    </div>
  );
}
