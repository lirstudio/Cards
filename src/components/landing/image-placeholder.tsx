import { he } from "@/lib/i18n/he";

export function imageSrcIsProvided(src: string | undefined | null): boolean {
  return typeof src === "string" && src.trim().length > 0;
}

/** אזור אפור עם × — כשאין עדיין URL/העלאה */
export function LandingImagePlaceholder({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={he.imageSlotAria}
      className={`flex items-center justify-center bg-white/5 text-[#464a4d] ${className}`}
    >
      <span
        className="select-none text-3xl font-extralight leading-none tracking-tight md:text-4xl"
        aria-hidden
      >
        ×
      </span>
    </div>
  );
}
