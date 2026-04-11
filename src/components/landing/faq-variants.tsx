"use client";

import type { z } from "zod";
import { parseSectionContent, sectionSchemas } from "@/lib/sections/schemas";
import { LC_SECTION_SHELL } from "@/lib/landing/section-shell";
import { landingSectionDomId, LANDING_SECTION_ANCHOR_CLASS } from "@/lib/landing/page-nav";

type FaqBlock = z.infer<(typeof sectionSchemas)["faq_two_column"]>;

function FaqSectionHeader({
  data,
  primary,
}: {
  data: FaqBlock;
  primary: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
      {!data.__hidden?.includes("badge") && data.badge?.trim() ? (
        <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-[#a1a4a5]">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-white transition-[transform,filter] duration-200 motion-safe:hover:scale-110 motion-safe:hover:brightness-110"
            style={{ backgroundColor: primary }}
          >
            ?
          </span>
          {data.badge}
        </div>
      ) : null}
      {!data.__hidden?.includes("title") && data.title?.trim() ? (
        <h2 className="break-words text-2xl font-bold text-[#f0f0f0] sm:text-3xl md:text-4xl">{data.title}</h2>
      ) : null}
    </div>
  );
}

export function FaqTwoColumnSection({
  content,
  primary,
  sectionId,
}: {
  content: unknown;
  primary: string;
  sectionId: string;
}) {
  const data = parseSectionContent("faq_two_column", content) as FaqBlock;
  return (
    <section
      id={landingSectionDomId(sectionId)}
      className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} py-12 sm:py-16`}
      dir="rtl"
    >
      <FaqSectionHeader data={data} primary={primary} />
      <div className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 gap-x-8 gap-y-2 @md:grid-cols-2 @md:gap-y-6">
        {data.items.map((item, i) => (
          <article
            key={i}
            className="border-t border-[rgba(176,199,217,0.16)] py-5 first:border-t-0 @md:odd:pe-4 @md:even:ps-4"
          >
            <h3 className="break-words text-base font-semibold text-[#f0f0f0] sm:text-lg">{item.question}</h3>
            <p className="mt-2 break-words text-sm leading-relaxed text-[#a1a4a5] sm:text-base">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FaqCardsSection({
  content,
  primary,
  sectionId,
}: {
  content: unknown;
  primary: string;
  sectionId: string;
}) {
  const data = parseSectionContent("faq_cards", content) as FaqBlock;
  return (
    <section
      id={landingSectionDomId(sectionId)}
      className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} py-12 sm:py-16`}
      dir="rtl"
    >
      <FaqSectionHeader data={data} primary={primary} />
      <div className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 gap-4 @md:grid-cols-2 @lg:gap-5">
        {data.items.map((item, i) => (
          <article
            key={i}
            className="relative overflow-hidden rounded-2xl border border-[rgba(59,158,255,0.28)] p-5 transition-[box-shadow,transform] duration-200 motion-safe:hover:-translate-y-0.5"
            style={{
              boxShadow:
                "0 0 0 1px rgba(59,158,255,0.08), 0 0 32px -6px rgba(59,158,255,0.25), inset 0 1px 0 rgba(59,158,255,0.13)",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 10%, rgba(59,158,255,0.6) 50%, transparent 90%)",
              }}
            />
            <h3 className="break-words text-base font-semibold text-[#f0f0f0] sm:text-lg">{item.question}</h3>
            <p className="mt-3 break-words text-sm leading-relaxed text-[#a1a4a5]">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FaqExpandedSection({
  content,
  primary,
  sectionId,
}: {
  content: unknown;
  primary: string;
  sectionId: string;
}) {
  const data = parseSectionContent("faq_expanded", content) as FaqBlock;
  return (
    <section
      id={landingSectionDomId(sectionId)}
      className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} py-12 sm:py-16`}
      dir="rtl"
    >
      <FaqSectionHeader data={data} primary={primary} />
      <div className="mx-auto min-w-0 max-w-3xl divide-y divide-[rgba(176,199,217,0.16)]">
        {data.items.map((item, i) => (
          <div key={i} className="py-6 first:pt-0 last:pb-0">
            <h3 className="break-words text-lg font-bold text-[#f0f0f0] sm:text-xl">{item.question}</h3>
            <p
              className="mt-3 break-words text-sm leading-relaxed text-[#a1a4a5] sm:text-base"
              style={{ borderInlineStart: `3px solid ${primary}`, paddingInlineStart: "1rem" }}
            >
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
