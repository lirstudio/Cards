"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "הועתק!" : "העתק קישור"}
      aria-label="העתק קישור לעמוד"
      className="group rounded-md p-1 transition hover:bg-white/10"
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-4 text-[#11ff99]"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-4 text-[#464a4d] transition group-hover:text-[#a1a4a5]"
          aria-hidden
        >
          <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Z" />
          <path d="M5 7.775a.75.75 0 0 0-1.06-1.06l-1.25 1.25a3.5 3.5 0 0 0 4.95 4.95l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95.75.75 0 0 0 1.06 1.06 2 2 0 0 1 2.83 0l-2.5 2.5a2 2 0 0 1-2.83-2.83l1.25-1.25Z" />
        </svg>
      )}
    </button>
  );
}
