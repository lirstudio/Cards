"use client";

import { useActionState } from "react";
import { signInWithEmail } from "@/app/actions/auth";
import { he } from "@/lib/i18n/he";

export function LoginForm() {
  const [state, action] = useActionState(signInWithEmail, null);

  return (
    <form action={action} className="mt-8 space-y-4">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
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
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          {he.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full text-sm"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-[var(--lc-primary)] py-3 text-sm font-medium text-white"
      >
        {he.login}
      </button>
    </form>
  );
}
