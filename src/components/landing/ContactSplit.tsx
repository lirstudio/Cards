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
import { SocialGlyph } from "@/components/landing/social-glyph";

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
      className="lc-cta-interactive w-full rounded-full py-4 text-base font-medium text-white hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 disabled:opacity-60"
      style={{ backgroundColor: "var(--lc-primary)" }}
    >
      {pending ? "שולח..." : label}
    </button>
  );
}

/** עיצוב שדות מותאם ל־globals.css — קו תחתון בלבד */
const fieldClass =
  "w-full text-[#f0f0f0] placeholder:text-[#464a4d] disabled:opacity-70";

const ICON_STROKE = 1.5;

function BadgePhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.57 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.72-1.14a2 2 0 0 1 2.11-.45c.76.27 1.55.45 2.36.57A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth={ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6Z"
        stroke="currentColor"
        strokeWidth={ICON_STROKE}
        strokeLinejoin="round"
      />
      <path
        d="m4 7 8 5 8-5"
        stroke="currentColor"
        strokeWidth={ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneHandsetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.57 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.72-1.14a2 2 0 0 1 2.11-.45c.76.27 1.55.45 2.36.57A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth={ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
            <label className="mb-2 block text-sm font-medium text-[#a1a4a5]" htmlFor={`lc-${sectionId}-${field.name}`}>
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
      className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} min-w-0 py-12 sm:py-16`}
      style={
        {
          "--lc-primary": primary,
        } as React.CSSProperties
      }
    >
      {/* dir=ltr כדי שטופס יופיע משמאל וטקסט מימין כמו רפרנס; תוכן עברית נשאר rtl בתוך העמודות */}
      <div className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 gap-12 @min-[1024px]:grid-cols-2 @min-[1024px]:gap-10" dir="ltr">
        <div className="order-2 min-w-0 rounded-[1.75rem] bg-white/5 p-8 shadow-[0_0_0_1px_rgba(176,199,217,0.145)] ring-1 ring-[rgba(176,199,217,0.145)] transition-[box-shadow,transform] duration-300 @min-[1024px]:order-1 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_0_0_1px_rgba(214,235,253,0.18),0_24px_56px_-30px_rgba(0,0,0,0.45)]" dir="rtl">
          {state?.message && !editorPreview ? (
            <p
              className={`mb-4 text-sm font-medium ${state.ok ? "text-[#11ff99]" : "text-[#ff2047]"}`}
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
                className="w-full cursor-not-allowed rounded-full bg-[#464a4d] py-4 text-base font-medium text-white opacity-90"
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
        <div className="order-1 min-w-0 space-y-8 @min-[1024px]:order-2" dir="rtl">
          {!data.__hidden?.includes("badge") && data.badge?.trim() ? (
            <div
              className="group inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm font-medium ring-1 ring-[rgba(214,235,253,0.19)] transition-[transform,background-color] duration-200 motion-safe:hover:scale-[1.02] motion-safe:hover:bg-white/[0.08]"
              style={{ color: primary }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200 motion-safe:group-hover:scale-110"
                style={{ backgroundColor: `${primary}18`, color: primary }}
              >
                <BadgePhoneIcon className="shrink-0" />
              </span>
              {data.badge}
            </div>
          ) : null}
          {!data.__hidden?.includes("headline") && data.headline?.trim() ? (
            <h2 className="break-words text-2xl font-bold leading-tight tracking-tight text-[#f0f0f0] sm:text-3xl md:text-4xl">
              {data.headline}
            </h2>
          ) : null}
          <div
            className="grid w-fit max-w-full grid-cols-3 gap-2 @min-[480px]:grid-cols-6"
            aria-label="רשתות חברתיות"
          >
            {data.social.map((s, i) => (
              <a
                key={`${s.network}-${s.href}-${i}`}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--lc-primary)_38%,transparent)] bg-white/10 text-[var(--lc-primary)] transition-[transform,background-color,box-shadow] duration-200 hover:bg-white/5 hover:shadow-[0_0_0_1px_rgba(214,235,253,0.19)] motion-safe:hover:scale-110 motion-safe:active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lc-primary)]"
                aria-label={s.network}
              >
                <SocialGlyph network={s.network} />
              </a>
            ))}
          </div>
          <div className="space-y-3 text-base sm:text-lg">
            {!data.__hidden?.includes("email") && data.email?.trim() ? (
              <div className="flex min-w-0 justify-start">
                <p
                  className="flex min-w-0 max-w-full flex-row flex-wrap items-center gap-3 sm:gap-3.5"
                  dir="ltr"
                >
                  <a
                    href={`mailto:${data.email}`}
                    className="min-w-0 break-words font-medium text-[#f0f0f0] decoration-[color-mix(in_srgb,var(--lc-primary)_55%,transparent)] underline-offset-2 hover:underline"
                  >
                    {data.email}
                  </a>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--lc-primary)_38%,transparent)] bg-white/10 text-[var(--lc-primary)]">
                    <MailIcon />
                  </span>
                </p>
              </div>
            ) : null}
            {!data.__hidden?.includes("phone") && data.phone?.trim() ? (
              <div className="flex min-w-0 justify-start">
                <p
                  className="flex min-w-0 max-w-full flex-row flex-wrap items-center gap-3 sm:gap-3.5"
                  dir="ltr"
                >
                  <a
                    href={`tel:${data.phone.replace(/\D/g, "")}`}
                    className="shrink-0 font-medium text-[#f0f0f0] decoration-[color-mix(in_srgb,var(--lc-primary)_55%,transparent)] underline-offset-2 hover:underline"
                  >
                    {data.phone}
                  </a>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--lc-primary)_38%,transparent)] bg-white/10 text-[var(--lc-primary)]">
                    <PhoneHandsetIcon />
                  </span>
                </p>
              </div>
            ) : null}
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
