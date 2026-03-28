"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** רוחב הקנבס לפני ה-scale (Tailwind) */
  canvasWidthClass?: string;
  scale: number;
  className?: string;
};

/**
 * שכבת תצוגה מקדימה ממוזערת — ממורכזת אנכית ואופקית בתוך המסגרת (אדמין, וריאנטים, פלטה).
 */
export function ScaledSectionPreviewLayer({
  children,
  canvasWidthClass = "w-[min(840px,200vw)]",
  scale,
  className = "",
}: Props) {
  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-1/2 max-w-none ${canvasWidthClass} ${className}`}
      style={{
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: "center center",
      }}
      aria-hidden
    >
      {children}
    </div>
  );
}
