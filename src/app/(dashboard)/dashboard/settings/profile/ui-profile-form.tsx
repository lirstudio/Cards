"use client";

import { useActionState } from "react";
import { updateProfileDisplayName } from "@/app/actions/settings";
import { he } from "@/lib/i18n/he";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [state, action] = useActionState(updateProfileDisplayName, null);

  return (
    <form action={action} className="mt-8 max-w-md space-y-4">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{he.profileUpdated}</p>
      ) : null}
      <div>
        <label htmlFor="displayName" className="mb-1 block text-sm font-medium">
          {he.displayName}
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          defaultValue={initialName}
          className="w-full text-sm"
        />
      </div>
      <button
        type="submit"
        className="rounded-full bg-[var(--lc-primary)] px-6 py-2.5 text-sm font-medium text-white"
      >
        {he.save}
      </button>
    </form>
  );
}
