"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetPublic } from "@/app/actions/auth";
import { he } from "@/lib/i18n/he";

export function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState(requestPasswordResetPublic, null);

  if (state?.success) {
    return (
      <div className="mt-8 space-y-4 text-center">
        <div className="rounded-lg bg-[#11ff99]/10 px-4 py-5 text-sm text-[#11ff99]">
          <p className="mb-1 font-medium">{he.forgotPasswordSent}</p>
          <p className="text-[#11ff99]/80">{he.forgotPasswordSentDetail}</p>
        </div>
        <Link
          href="/login"
          className="block text-sm font-medium text-[var(--lc-primary)]"
        >
          {he.forgotPasswordBackToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-4">
      {state?.error ? (
        <p className="rounded-lg bg-[#ff2047]/10 px-3 py-2 text-sm text-[#ff2047]">{state.error}</p>
      ) : null}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#f0f0f0]">
          {he.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          dir="ltr"
          className="w-full text-start text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-white py-3 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60"
      >
        {isPending ? he.forgotPasswordSending : he.forgotPasswordSend}
      </button>
      <p className="text-center text-sm text-[#a1a4a5]">
        <Link href="/login" className="font-medium text-[var(--lc-primary)]">
          {he.forgotPasswordBackToLogin}
        </Link>
      </p>
    </form>
  );
}
