"use client";

import { useState, useTransition } from "react";
import { uploadLandingAsset } from "@/app/actions/media";
import { settingsLabelClass } from "@/components/ui/form-styles";
import { he } from "@/lib/i18n/he";

function fileInput(onPick: (file: File) => void, pending: boolean) {
  return (
    <input
      type="file"
      accept="image/*"
      className="hidden"
      disabled={pending}
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onPick(f);
        e.target.value = "";
      }}
    />
  );
}

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
  const trimmed = value.trim();
  const hasImage = trimmed.length > 0;

  function uploadFile(f: File) {
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
  }

  return (
    <div className="space-y-2">
      <label className={`block ${settingsLabelClass}`}>{label}</label>
      {hasImage ? (
        <div className="space-y-2">
          <div className="flex justify-center rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/[0.03] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- כתובת אחסון משתמש */}
            <img
              src={trimmed}
              alt=""
              className="max-h-40 max-w-full object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 px-4 py-2 text-xs font-medium text-[#a1a4a5] transition hover:border-[var(--lc-primary)]/40 hover:bg-white/10">
              {he.uploadImage}
              {fileInput(uploadFile, pending)}
            </label>
            <button
              type="button"
              className="rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 px-4 py-2 text-xs font-medium text-[#a1a4a5] transition hover:border-red-400/30 hover:bg-red-950/30 hover:text-red-200"
              onClick={() => {
                onChange("");
                setMsg(null);
              }}
            >
              {he.imageRemove}
            </button>
            {msg ? <span className="text-xs text-[#a1a4a5]">{msg}</span> : null}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-[rgba(214,235,253,0.25)] bg-white/[0.02] px-4 py-6">
          <p className="text-center text-xs text-[#464a4d]">{he.imageUploadEmptyHint}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <label className="cursor-pointer rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 px-4 py-2 text-xs font-medium text-[#a1a4a5] transition hover:border-[var(--lc-primary)]/40 hover:bg-white/10">
              {he.uploadImage}
              {fileInput(uploadFile, pending)}
            </label>
            {msg ? <span className="text-xs text-[#a1a4a5]">{msg}</span> : null}
          </div>
        </div>
      )}
    </div>
  );
}
