"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/settings";
import { he } from "@/lib/i18n/he";

export function PasswordResetForm() {
  const [state, action] = useActionState(requestPasswordReset, null);

  return (
    <form action={action} className="mt-4">
      {state?.error ? (
        <p className="mb-2 text-sm text-red-600">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <div className="mb-2 space-y-2">
          <p className="text-sm text-green-700">{he.passwordResetSent}</p>
          {state.warnNoExplicitSiteUrl ? (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {he.passwordResetSiteUrlHint}
            </p>
          ) : null}
        </div>
      ) : null}
      <button
        type="submit"
        className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium hover:bg-neutral-50"
      >
        שליחת מייל לאיפוס סיסמה
      </button>
    </form>
  );
}
