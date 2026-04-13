"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { uploadLandingAsset } from "@/app/actions/media";
import { imageSrcIsProvided } from "@/components/landing/image-placeholder";
import { he } from "@/lib/i18n/he";

export type GalleryImageItem = { src: string; alt?: string };

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

export function GalleryImagesEditor({
  pageId,
  images,
  onChange,
  label = he.galleryEditorImagesLabel,
}: {
  pageId: string;
  images: GalleryImageItem[];
  onChange: (next: GalleryImageItem[]) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (images.length === 0) return;
    if (!images.some((im) => imageSrcIsProvided(im.src))) {
      onChangeRef.current([]);
    }
  }, [images]);

  function pickFiles() {
    inputRef.current?.click();
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList).filter((f) => f.size > 0);
    if (!files.length) return;

    startTransition(async () => {
      const appended: GalleryImageItem[] = [];
      let lastErr: string | null = null;
      for (const file of files) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("pageId", pageId);
        const r = await uploadLandingAsset(fd);
        if (r.ok) appended.push({ src: r.publicUrl, alt: "" });
        else lastErr = r.error ?? he.galleryUploadPartial;
      }

      if (appended.length > 0) {
        const existing = images.filter((im) => imageSrcIsProvided(im.src));
        onChange([...existing, ...appended]);
        if (appended.length === files.length) setMsg(he.uploadDone);
        else setMsg(lastErr ? `${he.galleryUploadPartial} (${lastErr})` : he.galleryUploadPartial);
      } else if (lastErr) {
        setMsg(lastErr);
      }
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(images.filter((_, j) => j !== index));
  }

  function updateAlt(index: number, alt: string) {
    const next = [...images];
    next[index] = { ...next[index], alt };
    onChange(next);
  }

  const indexedWithSrc = images
    .map((im, i) => ({ im, i }))
    .filter(({ im }) => imageSrcIsProvided(im.src));
  const hasPhotos = indexedWithSrc.length > 0;

  return (
    <div className="space-y-3 text-sm">
      <div className="text-[#a1a4a5]">{label}</div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={pending}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={pickFiles}
          className="rounded-xl border border-[rgba(214,235,253,0.19)] bg-white/5 px-4 py-2 text-xs font-medium text-[#a1a4a5] transition hover:border-[var(--lc-primary)]/40 hover:bg-white/10 disabled:opacity-50"
        >
          {hasPhotos ? he.galleryAddMoreImages : he.uploadImagesMultiple}
        </button>
        {pending ? <span className="text-xs text-[#a1a4a5]">…</span> : null}
        {msg ? <span className="text-xs text-[#a1a4a5]">{msg}</span> : null}
      </div>
      {!hasPhotos ? (
        <p className="text-xs leading-relaxed text-[#464a4d]">{he.imageUploadEmptyHint}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {indexedWithSrc.map(({ im, i }) => (
            <div
              key={`${im.src}-${i}`}
              className="space-y-1.5 rounded-lg border border-[rgba(214,235,253,0.19)] bg-white/5 p-2"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.src.trim()} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  title={he.imageRemove}
                  aria-label={he.imageRemove}
                  className="absolute end-1 top-1 flex h-7 w-7 items-center justify-center rounded-md bg-black/70 text-sm text-white ring-1 ring-white/20 transition hover:bg-red-900/90"
                  onClick={() => removeAt(i)}
                >
                  ×
                </button>
              </div>
              <input
                className="w-full rounded border border-[rgba(214,235,253,0.15)] bg-transparent px-2 py-1 text-xs text-[#f0f0f0] outline-none focus:border-[var(--lc-primary)]/50"
                placeholder={he.imageAltPlaceholder}
                value={im.alt ?? ""}
                onFocus={selectOnFocus}
                onChange={(e) => updateAlt(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
