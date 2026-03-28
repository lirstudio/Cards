"use client";

import Image from "next/image";
import { SYSTEM_LOGO_ON_DARK_BG, SYSTEM_LOGO_ON_LIGHT_BG } from "@/lib/brand";
import { he } from "@/lib/i18n/he";

type Variant = "onLight" | "onDark";

export function SystemLogo({
  variant = "onLight",
  className,
  heightClass = "h-8",
}: {
  variant?: Variant;
  /** Tailwind height + w-auto, e.g. h-7, h-10 */
  className?: string;
  heightClass?: string;
}) {
  const src = variant === "onLight" ? SYSTEM_LOGO_ON_LIGHT_BG : SYSTEM_LOGO_ON_DARK_BG;
  return (
    <Image
      src={src}
      alt={he.siteName}
      width={653}
      height={156}
      className={`w-auto ${heightClass} ${className ?? ""}`.trim()}
      priority={false}
    />
  );
}
