"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteLandingPage } from "@/app/actions/pages";
import { he } from "@/lib/i18n/he";

export function DeleteLandingPageButton({
  pageId,
  pageLabel,
}: {
  pageId: string;
  pageLabel: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    const msg = he.deletePageConfirm.replace("{title}", pageLabel);
    if (!window.confirm(msg)) return;
    startTransition(async () => {
      const r = await deleteLandingPage(pageId);
      if (!r.ok) {
        window.alert(r.error || he.deletePageError);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={he.deletePage}
      className="rounded-full border border-[#ff2047]/30 bg-[#ff2047]/10 px-4 py-2 text-sm font-medium text-[#ff2047] transition hover:bg-[#ff2047]/20 disabled:opacity-60"
    >
      {pending ? he.deletePageDeleting : he.deletePage}
    </button>
  );
}
