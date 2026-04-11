/** אייקון רשת חברתית לפי מחרוזת network (למשל instagram, linkedin). */
export function SocialGlyph({
  network,
  className,
}: {
  network: string;
  className?: string;
}) {
  const n = network.toLowerCase();
  const stroke = "currentColor";
  const sw = 1.5;
  const svgProps = {
    className: className ?? "h-[18px] w-[18px] shrink-0",
    viewBox: "0 0 24 24" as const,
    width: 18,
    height: 18,
    fill: "none" as const,
    stroke,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (n.includes("linkedin")) {
    return (
      <svg {...svgProps}>
        <path d="M16 8a6 6 0 0 1 6 6v6h-4v-6a2 2 0 0 0-4 0v6h-4v-12h4v1.5" />
        <rect x="2" y="9" width="4" height="11" rx="1" />
        <circle cx="4" cy="5" r="2" />
      </svg>
    );
  }
  if (n.includes("facebook")) {
    return (
      <svg {...svgProps}>
        <path d="M18 2h-3a4 4 0 0 0-4 4v3H8v4h3v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3V2Z" />
      </svg>
    );
  }
  if (n.includes("instagram")) {
    return (
      <svg {...svgProps}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.2" cy="6.8" r="0.9" fill={stroke} stroke="none" />
      </svg>
    );
  }
  if (n.includes("youtube")) {
    return (
      <svg {...svgProps}>
        <path d="M22 8s-.2-3.7-2-4.8C18.3 2 12 2 12 2s-6.3 0-8 .2C2.2 4.4 2 8 2 8s0 3.7 2 4.9c1.7.2 8 .2 8 .2s6.3 0 8-.2c1.8-1.1 2-4.9 2-4.9Z" />
        <path d="m10 9 5 3-5 3V9Z" fill={stroke} stroke="none" />
      </svg>
    );
  }
  if (n.includes("tiktok")) {
    return (
      <svg {...svgProps}>
        <path d="M16.65 3.05v10.9a3.35 3.35 0 1 1-2.5-3.24V7.1a5.55 5.55 0 0 0 2.5.85V3.05Z" />
      </svg>
    );
  }
  if (n.includes("whatsapp")) {
    return (
      <svg {...svgProps}>
        <path d="M12 20.5a8.5 8.5 0 0 0 4.12-15.97A8.5 8.5 0 0 0 5.03 16.9L3.5 20.5l3.78-1.04A8.44 8.44 0 0 0 12 20.5Z" />
        <path d="M8.35 9.35c.15 1.2 1.45 3.35 2.85 4.75s3.65 2.75 4.85 2.9c.95.12 1.55-.55 1.8-1.15.28-.68.28-1.2.2-1.28l-1.05-.55s-1.25-.6-1.75-.38c-.35.16-.85.75-1.1.98-.08.02-.65-.28-1.25-.82a5.6 5.6 0 0 1-1.15-1.25c-.45-.62-.78-1.18-.72-1.28.12-.22.95-1.05 1.05-1.48.08-.35-.32-1.72-.48-1.92-.14-.18-.68-.2-1.02-.2h-.95c-.32 0-.84.1-.98.42-.35.75-.72 1.4-.72 2.48Z" />
      </svg>
    );
  }
  if (n.includes("twitter") || n === "x" || n.includes("x.com")) {
    return (
      <svg
        className={svgProps.className}
        viewBox="0 0 24 24"
        width={18}
        height={18}
        fill={stroke}
        aria-hidden
      >
        <path d="M4 4l7.2 9.6L4 20h1.8l6.3-6.75L17.5 20H20l-7.5-10L19.5 4h-1.8l-5.7 6.09L6.5 4H4Z" />
      </svg>
    );
  }
  return (
    <svg {...svgProps}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}
