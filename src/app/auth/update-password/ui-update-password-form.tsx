"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/actions/auth";
import { he } from "@/lib/i18n/he";

export function UpdatePasswordForm() {
  const [state, action, isPending] = useActionState(updatePassword, null);

  return (
    <form action={action} className="mt-8 space-y-4">
      {state?.error ? (
        <p className="rounded-lg bg-[#ff2047]/10 px-3 py-2 text-sm text-[#ff2047]">{state.error}</p>
      ) : null}
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#f0f0f0]">
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
        <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-[#f0f0f0]">
          {he.confirmPassword}
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-white py-3 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60"
      >
        {isPending ? he.updatePasswordSaving : he.updatePasswordSave}
      </button>
    </form>
  );
}
