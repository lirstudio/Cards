"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { he } from "@/lib/i18n/he";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, null);

  return (
    <form action={action} className="mt-8 space-y-4">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{he.passwordResetSent}</p>
      ) : null}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
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
        className="w-full rounded-full bg-[var(--lc-primary)] py-3 text-sm font-medium text-white"
      >
        {he.forgotPasswordSubmit}
      </button>
    </form>
  );
}
