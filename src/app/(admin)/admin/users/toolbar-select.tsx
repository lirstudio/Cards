import type { ComponentProps } from "react";

/**
 * Skips globals.css `select` rules (underline + background chevron) via `lc-input-framed`;
 * uses appearance-none + one SVG chevron so RTL text doesn’t collide with the indicator.
 */
export function ToolbarSelect({
  wrapperClassName = "",
  children,
  ...rest
}: ComponentProps<"select"> & { wrapperClassName?: string }) {
  return (
    <div className={`relative inline-flex shrink-0 ${wrapperClassName}`}>
      <select
        className="lc-input-framed h-9 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-[rgba(214,235,253,0.19)] bg-[#0a0a0a] py-0 ps-3 pe-9 text-sm text-[#a1a4a5] focus:border-[var(--lc-primary)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        {...rest}
      >
        {children}
      </select>
      <span
        className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-[#6b7280]"
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}
