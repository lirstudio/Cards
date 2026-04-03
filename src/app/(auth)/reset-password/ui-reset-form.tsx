"use client";

import { useActionState } from "react";
import { updatePasswordAfterReset } from "@/app/actions/auth";
import { he } from "@/lib/i18n/he";

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePasswordAfterReset, null);

  return (
    <form action={action} className="mt-8 space-y-4">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          {he.newPassword}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full text-sm"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
          {he.confirmPassword}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full text-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-[var(--lc-primary)] py-3 text-sm font-medium text-white"
      >
        {he.setNewPassword}
      </button>
    </form>
  );
}
