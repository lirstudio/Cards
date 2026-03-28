import Link from "next/link";
import { SystemLogo } from "@/components/brand/system-logo";
import { he } from "@/lib/i18n/he";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex justify-center">
        <SystemLogo variant="onLight" heightClass="h-10" />
      </div>
      <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
        {he.tagline}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-neutral-600">
        בנו עמודי נחיתה מקצועיים בעברית, עם תבניות מוכנות ועורך גמיש — הכל תחת דומיין אחד.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/login"
          className="rounded-full bg-[var(--lc-primary)] px-8 py-3 text-sm font-medium text-white"
        >
          {he.login}
        </Link>
        <Link
          href="/signup"
          className="rounded-full border-2 border-[var(--lc-primary)] px-8 py-3 text-sm font-medium text-[var(--lc-primary)]"
        >
          {he.signup}
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-neutral-300 px-8 py-3 text-sm font-medium text-neutral-700"
        >
          {he.dashboard}
        </Link>
      </div>
    </div>
  );
}
