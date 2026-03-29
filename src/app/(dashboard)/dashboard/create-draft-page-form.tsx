"use client";

import { useFormStatus } from "react-dom";
import { createDraftLandingPage } from "@/app/actions/pages";
import { he } from "@/lib/i18n/he";

function SubmitLabel() {
  const { pending } = useFormStatus();
  return <>{pending ? he.newPageCreating : he.newPage}</>;
}

export function CreateDraftPageForm({ className }: { className?: string }) {
  return (
    <form action={createDraftLandingPage}>
      <button type="submit" className={className}>
        <SubmitLabel />
      </button>
    </form>
  );
}
