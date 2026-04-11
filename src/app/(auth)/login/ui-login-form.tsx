"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithEmail } from "@/app/actions/auth";
import { he } from "@/lib/i18n/he";

export function LoginForm() {
  const [state, action] = useActionState(signInWithEmail, null);

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
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-[#f0f0f0]">
            {he.password}
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-[var(--lc-primary)]"
          >
            {he.forgotPassword}
          </Link>
        </div>
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
        className="w-full rounded-full bg-white py-3 text-sm font-medium text-black hover:bg-white/90"
      >
        {he.login}
      </button>
    </form>
  );
}
