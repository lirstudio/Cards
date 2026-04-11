"use client";

import { useActionState } from "react";
import { updateProfileDisplayName } from "@/app/actions/settings";
import { he } from "@/lib/i18n/he";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [state, action] = useActionState(updateProfileDisplayName, null);

  return (
    <form action={action} className="mt-8 max-w-md space-y-4">
      {state?.error ? (
        <p className="rounded-lg bg-[#ff2047]/10 px-3 py-2 text-sm text-[#ff2047]">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-lg bg-[#11ff99]/10 px-3 py-2 text-sm text-[#11ff99]">{he.profileUpdated}</p>
      ) : null}
      <div>
        <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-[#f0f0f0]">
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
        className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-white/90"
      >
        {he.save}
      </button>
    </form>
  );
}
