"use client";

import { useActionState } from "react";
import { signUpWithEmail } from "@/app/actions/auth";
import { he } from "@/lib/i18n/he";

export function SignupForm() {
  const [state, action] = useActionState(signUpWithEmail, null);

  return (
    <form action={action} className="mt-8 space-y-4">
      {state?.error ? (
        <p className="rounded-lg bg-[#ff2047]/10 px-3 py-2 text-sm text-[#ff2047]">{state.error}</p>
      ) : null}
      <div>
        <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-[#f0f0f0]">
          {he.displayName}
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          className="w-full text-sm"
        />
      </div>
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
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-[#f0f0f0]">
          {he.password}
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
      <button
        type="submit"
        className="w-full rounded-full bg-white py-3 text-sm font-medium text-black hover:bg-white/90"
      >
        {he.signup}
      </button>
    </form>
  );
}
