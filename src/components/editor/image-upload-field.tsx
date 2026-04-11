"use client";

import { useState, useTransition } from "react";
import { uploadLandingAsset } from "@/app/actions/media";
import { settingsLabelClass, settingsTextInputClass } from "@/components/ui/form-styles";
import { he } from "@/lib/i18n/he";

export function ImageUploadField({
  pageId,
  label,
  value,
  onChange,
}: {
  pageId: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <label className={`block ${settingsLabelClass}`}>{label}</label>
      <input
        type="url"
        dir="ltr"
        className={`${settingsTextInputClass} mt-0`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={he.imageUrlFieldPlaceholder}
      />
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 px-4 py-2 text-xs font-medium text-[#a1a4a5] transition hover:border-[var(--lc-primary)]/40 hover:bg-white/10">
          {he.uploadImage}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={pending}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const fd = new FormData();
              fd.set("file", f);
              fd.set("pageId", pageId);
              startTransition(async () => {
                const r = await uploadLandingAsset(fd);
                if (r.ok) {
                  onChange(r.publicUrl);
                  setMsg(he.uploadDone);
                } else setMsg(r.error);
              });
              e.target.value = "";
            }}
          />
        </label>
        {msg ? <span className="text-xs text-[#a1a4a5]">{msg}</span> : null}
      </div>
    </div>
  );
}
