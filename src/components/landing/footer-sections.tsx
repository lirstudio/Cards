"use client";

import type { CSSProperties } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { z } from "zod";
import { parseSectionContent, sectionSchemas } from "@/lib/sections/schemas";
import { LC_SECTION_SHELL } from "@/lib/landing/section-shell";
import { landingSectionDomId, LANDING_SECTION_ANCHOR_CLASS } from "@/lib/landing/page-nav";
import { SystemLogo } from "@/components/brand/system-logo";
import { SocialGlyph } from "@/components/landing/social-glyph";
import { submitLandingLead } from "@/app/actions/forms";

type FooterMinimal = z.infer<typeof sectionSchemas.footer_minimal>;
type FooterColumns = z.infer<typeof sectionSchemas.footer_columns>;
type FooterNewsletter = z.infer<typeof sectionSchemas.footer_newsletter>;

const socialBtnClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--lc-primary)_38%,transparent)] bg-white/10 text-[var(--lc-primary)] transition-[transform,background-color,box-shadow] duration-200 hover:bg-white/5 hover:shadow-[0_0_0_1px_rgba(214,235,253,0.19)] motion-safe:hover:scale-110 motion-safe:active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lc-primary)]";

const sectionStyle = (primary: string): CSSProperties =>
  ({ "--lc-primary": primary } as CSSProperties);

async function noopLeadAction(
  _prev: { ok: boolean; message: string } | null,
  _formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  void _prev;
  void _formData;
  return { ok: true, message: "" };
}

function NewsletterSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="lc-cta-interactive shrink-0 rounded-full px-8 py-3 text-sm font-medium text-white hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 disabled:opacity-60 sm:text-base"
      style={{ backgroundColor: "var(--lc-primary)" }}
    >
      {pending ? "שולח..." : label}
    </button>
  );
}

function BrandOrLogo({
  brandText,
  siteLogoUrl,
}: {
  brandText: string;
  siteLogoUrl?: string | null;
}) {
  const t = brandText.trim();
  if (t) {
    return <span className="text-lg font-bold tracking-tight text-[#f0f0f0]">{brandText}</span>;
  }
  if (siteLogoUrl?.trim()) {
    return (
      <span className="inline-flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={siteLogoUrl.trim()}
          alt=""
          className="h-8 w-auto max-w-[180px] object-contain"
        />
      </span>
    );
  }
  return <SystemLogo variant="onDark" heightClass="h-8" />;
}

export function FooterMinimalSection({
  content,
  primary,
  sectionId,
  siteLogoUrl,
}: {
  content: unknown;
  primary: string;
  sectionId: string;
  siteLogoUrl?: string | null;
}) {
  const data = parseSectionContent("footer_minimal", content) as FooterMinimal;
  return (
    <section
      id={landingSectionDomId(sectionId)}
      className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} border-t border-[rgba(176,199,217,0.145)] py-10 sm:py-12`}
      dir="rtl"
      style={sectionStyle(primary)}
    >
      <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col items-center gap-8 @md:flex-row @md:items-center @md:justify-between">
        <div className="flex flex-col items-center gap-3 @md:items-start">
          <BrandOrLogo brandText={data.brandText} siteLogoUrl={siteLogoUrl} />
        </div>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-[#a1a4a5]"
          aria-label="קישורי פוטר"
        >
          {data.links.map((l, i) => (
            <a
              key={`${l.href}-${i}`}
              href={l.href}
              className="text-[#f0f0f0] decoration-[color-mix(in_srgb,var(--lc-primary)_55%,transparent)] underline-offset-2 transition hover:text-white hover:underline"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-[#a1a4a5] @md:text-start">
        {data.copyright}
      </p>
    </section>
  );
}

export function FooterColumnsSection({
  content,
  primary,
  sectionId,
}: {
  content: unknown;
  primary: string;
  sectionId: string;
}) {
  const data = parseSectionContent("footer_columns", content) as FooterColumns;
  return (
    <section
      id={landingSectionDomId(sectionId)}
      className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} border-t border-[rgba(176,199,217,0.145)] py-12 sm:py-16`}
      dir="rtl"
      style={sectionStyle(primary)}
    >
      <div className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 gap-10 @md:grid-cols-2 @lg:grid-cols-4 @lg:gap-12">
        <div className="min-w-0 space-y-3">
          <p className="text-lg font-bold text-[#f0f0f0]">{data.brandText}</p>
          <h3 className="text-sm font-semibold text-[#f0f0f0]">{data.aboutTitle}</h3>
          <p className="text-sm leading-relaxed text-[#a1a4a5]">{data.aboutBody}</p>
        </div>
        <div className="min-w-0 space-y-3">
          <h3 className="text-sm font-semibold text-[#f0f0f0]">{data.linksTitle}</h3>
          <ul className="space-y-2 text-sm">
            {data.links.map((l, i) => (
              <li key={`${l.href}-${i}`}>
                <a
                  href={l.href}
                  className="text-[#a1a4a5] decoration-[color-mix(in_srgb,var(--lc-primary)_55%,transparent)] underline-offset-2 transition hover:text-[#f0f0f0] hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 space-y-4">
          <h3 className="text-sm font-semibold text-[#f0f0f0]">{data.contactTitle}</h3>
          <div className="space-y-2 text-sm" dir="ltr">
            <a
              href={`mailto:${data.email}`}
              className="block font-medium text-[#f0f0f0] decoration-[color-mix(in_srgb,var(--lc-primary)_55%,transparent)] underline-offset-2 hover:underline"
            >
              {data.email}
            </a>
            <a
              href={`tel:${data.phone.replace(/\D/g, "")}`}
              className="block font-medium text-[#f0f0f0] decoration-[color-mix(in_srgb,var(--lc-primary)_55%,transparent)] underline-offset-2 hover:underline"
            >
              {data.phone}
            </a>
          </div>
        </div>
        <div className="min-w-0 space-y-3">
          <p className="text-sm font-semibold text-[#f0f0f0]">רשתות חברתיות</p>
          <div
            className="flex flex-wrap gap-2"
            aria-label="רשתות חברתיות"
          >
            {data.social.map((s, i) => (
              <a
                key={`${s.network}-${s.href}-${i}`}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={socialBtnClass}
                aria-label={s.network}
              >
                <SocialGlyph network={s.network} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-[rgba(176,199,217,0.12)] pt-8 text-center text-xs text-[#a1a4a5] @md:text-start">
        {data.bottomBar}
      </div>
    </section>
  );
}

export function FooterNewsletterSection({
  content,
  primary,
  sectionId,
  landingPageId,
  editorPreview = false,
}: {
  content: unknown;
  primary: string;
  sectionId: string;
  landingPageId: string;
  editorPreview?: boolean;
}) {
  const data = parseSectionContent("footer_newsletter", content) as FooterNewsletter;
  const formAction = editorPreview ? noopLeadAction : submitLandingLead;
  const [state, dispatch] = useActionState(formAction, null);

  return (
    <section
      id={landingSectionDomId(sectionId)}
      className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} border-t border-[rgba(176,199,217,0.145)] py-12 sm:py-16`}
      dir="rtl"
      style={sectionStyle(primary)}
    >
      <div className="mx-auto w-full min-w-0 max-w-3xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#f0f0f0] sm:text-3xl">{data.headline}</h2>
        <p className="mt-2 text-sm text-[#a1a4a5] sm:text-base">{data.subheadline}</p>
        <p className="mx-auto mt-6 max-w-xl text-xl font-bold leading-snug text-[#f0f0f0] sm:text-2xl">
          {data.brandTagline}
        </p>

        {state?.message && !editorPreview ? (
          <p
            className={`mt-6 text-sm font-medium ${state.ok ? "text-[#11ff99]" : "text-[#ff2047]"}`}
            role="status"
          >
            {state.message}
          </p>
        ) : null}

        {editorPreview ? (
          <form
            className="mx-auto mt-8 flex max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            onSubmit={(e) => e.preventDefault()}
          >
            <input type="hidden" name="landing_page_id" value={landingPageId} />
            <input type="hidden" name="section_id" value={sectionId} />
            <label className="sr-only" htmlFor={`footer-nl-${sectionId}`}>
              {data.emailLabel}
            </label>
            <input
              id={`footer-nl-${sectionId}`}
              name="email"
              type="email"
              required={false}
              readOnly
              disabled
              dir="ltr"
              placeholder={data.emailLabel}
              className="min-h-[48px] flex-1 rounded-full border border-[rgba(176,199,217,0.22)] bg-white/5 px-5 text-start text-sm text-[#f0f0f0] placeholder:text-[#464a4d]"
            />
            <button
              type="button"
              disabled
              className="rounded-full bg-[#464a4d] px-8 py-3 text-sm font-medium text-white opacity-90"
            >
              {data.submitLabel}
            </button>
          </form>
        ) : (
          <form action={dispatch} className="mx-auto mt-8 flex max-w-lg flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <input type="hidden" name="landing_page_id" value={landingPageId} />
            <input type="hidden" name="section_id" value={sectionId} />
            <label className="sr-only" htmlFor={`footer-nl-${sectionId}`}>
              {data.emailLabel}
            </label>
            <input
              id={`footer-nl-${sectionId}`}
              name="email"
              type="email"
              required
              dir="ltr"
              autoComplete="email"
              placeholder={data.emailLabel}
              className="min-h-[48px] flex-1 rounded-full border border-[rgba(176,199,217,0.22)] bg-white/5 px-5 text-start text-sm text-[#f0f0f0] placeholder:text-[#464a4d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lc-primary)]"
            />
            <NewsletterSubmitButton label={data.submitLabel} />
          </form>
        )}

        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
          aria-label="רשתות חברתיות"
        >
          {data.social.map((s, i) => (
            <a
              key={`${s.network}-${s.href}-${i}`}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={socialBtnClass}
              aria-label={s.network}
            >
              <SocialGlyph network={s.network} />
            </a>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-lg text-xs leading-relaxed text-[#464a4d]">{data.privacyNote}</p>
      </div>
    </section>
  );
}
