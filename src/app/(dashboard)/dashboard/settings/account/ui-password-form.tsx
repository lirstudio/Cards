"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/settings";
import { he } from "@/lib/i18n/he";

export function PasswordResetForm() {
  const [state, action] = useActionState(requestPasswordReset, null);

  return (
    <form action={action} className="mt-4">
      {state?.error ? (
        <p className="mb-2 text-sm text-[#ff2047]">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="mb-2 text-sm text-[#11ff99]">{he.passwordResetSent}</p>
      ) : null}
      <button
        type="submit"
        className="rounded-full border border-[rgba(214,235,253,0.19)] px-5 py-2 text-sm font-medium text-[#f0f0f0] hover:bg-white/10"
      >
        שליחת מייל לאיפוס סיסמה
      </button>
    </form>
  );
}
