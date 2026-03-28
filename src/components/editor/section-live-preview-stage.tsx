"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** גובה מינימלי לבימה — כדי שסקשנים נמוכים ייושרו למרכז האנכי */
  minHeightClass?: string;
  className?: string;
};

/**
 * מעטפת לתצוגה מקדימה חיה (ללא scale) — מרכוז התוכן בתוך אזור העורך/מודאל.
 */
export function SectionLivePreviewStage({
  children,
  minHeightClass = "min-h-[min(72vh,780px)]",
  className = "",
}: Props) {
  return (
    <div
      className={`flex w-full min-w-0 items-start justify-start p-4 sm:p-6 ${minHeightClass} ${className}`}
    >
      <div className="w-full min-w-0 max-w-full">{children}</div>
    </div>
  );
}
