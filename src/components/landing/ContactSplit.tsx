"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { z } from "zod";
import {
  parseSectionContent,
  sectionSchemas,
} from "@/lib/sections/schemas";
import { LC_SECTION_SHELL } from "@/lib/landing/section-shell";
import {
  landingSectionDomId,
  LANDING_SECTION_ANCHOR_CLASS,
} from "@/lib/landing/page-nav";
import { SystemLogo } from "@/components/brand/system-logo";

type ContactContent = z.infer<typeof sectionSchemas.contact_split_footer>;

async function noopLeadAction(
  _prev: { ok: boolean; message: string } | null,
  _formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  void _prev;
  void _formData;
  return { ok: true, message: "" };
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full py-4 text-base font-medium text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
      style={{ backgroundColor: "var(--lc-primary)" }}
    >
      {pending ? "שולח..." : label}
    </button>
  );
}

const fieldClass =
  "w-full rounded-xl border-0 bg-neutral-100 px-4 py-3.5 text-neutral-900 outline-none ring-1 ring-neutral-200/90 placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-[color-mix(in_srgb,var(--lc-primary)_35%,transparent)] disabled:opacity-70";

function BadgePhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.57 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.72-1.14a2 2 0 0 1 2.11-.45c.76.27 1.55.45 2.36.57A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="m4 7 8 5 8-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneHandsetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.57 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.72-1.14a2 2 0 0 1 2.11-.45c.76.27 1.55.45 2.36.57A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SocialGlyph({
  network,
  className,
}: {
  network: string;
  className?: string;
}) {
  const n = network.toLowerCase();
  const stroke = "currentColor";
  const common = { className, fill: "none" as const, stroke, strokeWidth: 1.65, "aria-hidden": true as const };

  if (n.includes("linkedin")) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" {...common}>
        <path d="M16 8a6 6 0 0 1 6 6v6h-4v-6a2 2 0 0 0-4 0v6h-4v-12h4v1.5" strokeLinecap="round" />
        <rect x="2" y="9" width="4" height="11" rx="1" />
        <circle cx="4" cy="5" r="2" />
      </svg>
    );
  }
  if (n.includes("facebook")) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" {...common}>
        <path
          d="M18 2h-3a4 4 0 0 0-4 4v3H8v4h3v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3V2Z"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (n.includes("instagram")) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.2" fill={stroke} stroke="none" />
      </svg>
    );
  }
  if (n.includes("youtube")) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" {...common}>
        <path
          d="M22 8s-.2-3.7-2-4.8C18.3 2 12 2 12 2s-6.3 0-8 .2C2.2 4.4 2 8 2 8s0 3.7 2 4.9c1.7.2 8 .2 8 .2s6.3 0 8-.2c1.8-1.1 2-4.9 2-4.9Z"
          strokeLinejoin="round"
        />
        <path d="m10 9 5 3-5 3V9Z" fill={stroke} stroke="none" />
      </svg>
    );
  }
  if (n.includes("tiktok")) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" {...common}>
        <path
          d="M16.5 3v11a4 4 0 1 1-3-3.9V7a6 6 0 0 0 3 1V3Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (n.includes("whatsapp")) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" {...common}>
        <path
          d="M12 21a9 9 0 0 0 9-9c0-5-4-9-9-9S3 7 3 12c0 1.6.4 3 1.1 4.3L3 21l4.9-1.3A8.9 8.9 0 0 0 12 21Z"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 9.5c.2 1.4 1.6 3.8 3.2 5.4s4.3 3 5.7 3.2c1.4.2 2.3-.8 2.6-1.6.3-.9.3-1.6.2-1.7l-1.2-.6s-1.5-.7-2.1-.4c-.4.2-1 1-1.3 1.3-.1 0-.8-.3-1.5-.9a6 6 0 0 1-1.4-1.5c-.5-.7-.9-1.4-.8-1.6.2-.4 1.2-1.2 1.3-1.7.1-.4-.4-2-.6-2.2-.2-.3-.8-.3-1.2-.3h-1.1c-.4 0-.9.2-1 .5-.4.6-.8 1.5-.8 2.8Z"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <span className={`text-xs font-bold ${className ?? ""}`}>{network.slice(0, 2).toUpperCase()}</span>
  );
}

function autoCompleteForField(
  name: string,
  type: string,
): string | undefined {
  const lower = name.toLowerCase();
  if (type === "email" || lower.includes("email")) return "email";
  if (type === "tel" || lower.includes("phone") || lower === "tel") return "tel";
  if (lower.includes("name") || lower === "full_name") return "name";
  return undefined;
}

export function ContactSplit({
  content,
  primary,
  landingPageId,
  sectionId,
  action,
  editorPreview = false,
  siteLogoUrl,
}: {
  content: unknown;
  primary: string;
  landingPageId: string;
  sectionId: string;
  action: (
    prev: { ok: boolean; message: string } | null,
    formData: FormData,
  ) => Promise<{ ok: boolean; message: string }>;
  editorPreview?: boolean;
  /** מ־theme.siteLogoUrl — דורס SystemLogo בפוטר כשאין footerCredit */
  siteLogoUrl?: string;
}) {
  const data = parseSectionContent("contact_split_footer", content) as ContactContent;
  const [state, formAction] = useActionState(
    editorPreview ? noopLeadAction : action,
    null,
  );

  const formFields = (
    <>
      {data.formFields.map((field) => {
        const ac = autoCompleteForField(field.name, field.type);
        return (
          <div key={field.name}>
            <label className="mb-2 block text-sm font-medium text-neutral-800" htmlFor={`lc-${sectionId}-${field.name}`}>
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={`lc-${sectionId}-${field.name}`}
                name={field.name}
                required={field.required && !editorPreview}
                dir="rtl"
                rows={5}
                placeholder={field.placeholder}
                readOnly={editorPreview}
                disabled={editorPreview}
                autoComplete={ac}
                className={`${fieldClass} min-h-[7.5rem] resize-y`}
              />
            ) : (
              <input
                id={`lc-${sectionId}-${field.name}`}
                name={field.name}
                type={
                  field.type === "email"
                    ? "email"
                    : field.type === "tel"
                      ? "tel"
                      : "text"
                }
                required={field.required && !editorPreview}
                placeholder={field.placeholder}
                dir={field.type === "email" ? "ltr" : "rtl"}
                readOnly={editorPreview}
                disabled={editorPreview}
                autoComplete={ac}
                inputMode={field.type === "tel" ? "tel" : undefined}
                className={`${fieldClass} ${field.type === "email" ? "text-start" : ""}`}
              />
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <section
      id={landingSectionDomId(sectionId)}
      className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} min-w-0 bg-[#f0f0f0] py-12 sm:py-16`}
      style={
        {
          "--lc-primary": primary,
        } as React.CSSProperties
      }
    >
      {/* dir=ltr כדי שטופס יופיע משמאל וטקסט מימין כמו רפרנס; תוכן עברית נשאר rtl בתוך העמודות */}
      <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-12 lg:grid-cols-2 lg:gap-10" dir="ltr">
        <div className="order-2 min-w-0 rounded-[1.75rem] bg-white p-8 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.18)] ring-1 ring-neutral-900/[0.04] lg:order-1" dir="rtl">
          {state?.message && !editorPreview ? (
            <p
              className={`mb-4 text-sm font-medium ${state.ok ? "text-green-700" : "text-red-600"}`}
              role="status"
            >
              {state.message}
            </p>
          ) : null}
          {editorPreview ? (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input type="hidden" name="landing_page_id" value={landingPageId} />
              <input type="hidden" name="section_id" value={sectionId} />
              {formFields}
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-full bg-neutral-300 py-4 text-base font-medium text-white opacity-90"
              >
                {data.submitLabel}
              </button>
            </form>
          ) : (
            <form action={formAction} className="space-y-5">
              <input type="hidden" name="landing_page_id" value={landingPageId} />
              <input type="hidden" name="section_id" value={sectionId} />
              {formFields}
              <SubmitButton label={data.submitLabel} />
            </form>
          )}
        </div>
        <div className="order-1 min-w-0 space-y-8 lg:order-2" dir="rtl">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium shadow-sm ring-1 ring-neutral-200/80"
            style={{ color: primary }}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: `${primary}18`, color: primary }}
            >
              <BadgePhoneIcon className="shrink-0" />
            </span>
            {data.badge}
          </div>
          <h2 className="break-words text-2xl font-bold leading-tight tracking-tight text-black sm:text-3xl md:text-4xl">
            {data.headline}
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.social.map((s) => (
              <a
                key={s.network}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white/80 transition hover:bg-white hover:opacity-95"
                style={{ borderColor: primary, color: primary }}
                aria-label={s.network}
              >
                <SocialGlyph network={s.network} />
              </a>
            ))}
          </div>
          <div className="space-y-4 text-lg">
            <div className="flex min-w-0 justify-start">
              <p className="flex min-w-0 max-w-full flex-row flex-wrap items-center gap-3" dir="ltr">
                <a
                  href={`mailto:${data.email}`}
                  className="min-w-0 break-words hover:underline"
                >
                  {data.email}
                </a>
                <span className="flex shrink-0 items-center" style={{ color: primary }}>
                  <MailIcon />
                </span>
              </p>
            </div>
            <div className="flex min-w-0 justify-start">
              <p className="flex min-w-0 max-w-full flex-row flex-wrap items-center gap-3" dir="ltr">
                <a
                  href={`tel:${data.phone.replace(/\D/g, "")}`}
                  className="shrink-0 hover:underline"
                >
                  {data.phone}
                </a>
                <span className="flex shrink-0 items-center" style={{ color: primary }}>
                  <PhoneHandsetIcon />
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="mt-16 px-3 py-6 text-center text-sm font-medium leading-normal text-white"
        style={{ backgroundColor: primary }}
      >
        {data.footerCredit ? (
          data.footerCredit
        ) : siteLogoUrl ? (
          <span className="inline-flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- URL משתמש חיצוני */}
            <img
              src={siteLogoUrl}
              alt=""
              className="h-6 w-auto max-w-[160px] object-contain"
            />
          </span>
        ) : (
          <span className="inline-flex items-center justify-center">
            <SystemLogo variant="onDark" heightClass="h-6" />
          </span>
        )}
      </div>
    </section>
  );
}
