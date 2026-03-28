"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createLandingPageFromTemplate } from "@/app/actions/pages";
import { he } from "@/lib/i18n/he";

export function NewPageForm({
  templates,
  maxTier,
}: {
  templates: { slug: string; name: string; tier: number }[];
  maxTier: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const allowed = templates.filter((t) => t.tier <= maxTier);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const templateSlug = String(fd.get("templateSlug"));
    const slug = String(fd.get("slug"));
    const title = String(fd.get("title"));
    const r = await createLandingPageFromTemplate(templateSlug, slug, title);
    setPending(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    router.push(`/dashboard/pages/${r.pageId}/edit`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-md space-y-6">
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <div>
        <label className="mb-1 block text-sm font-medium">{he.chooseTemplate}</label>
        <select
          name="templateSlug"
          required
          className="w-full text-sm"
        >
          {allowed.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{he.pageTitle}</label>
        <input
          name="title"
          type="text"
          required
          className="w-full text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{he.slug}</label>
        <input
          name="slug"
          type="text"
          placeholder="my-workshop"
          dir="ltr"
          className="w-full text-start text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending || allowed.length === 0}
        className="w-full rounded-full bg-[var(--lc-primary)] py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "יוצר..." : he.create}
      </button>
    </form>
  );
}
