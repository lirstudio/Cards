"use client";

import { useState } from "react";
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

type FaqContent = z.infer<typeof sectionSchemas.faq_accordion>;

export function FaqAccordion({
  content,
  primary,
  sectionId,
}: {
  content: unknown;
  primary: string;
  sectionId: string;
}) {
  const data = parseSectionContent("faq_accordion", content) as FaqContent;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id={landingSectionDomId(sectionId)}
      className={`${LC_SECTION_SHELL} ${LANDING_SECTION_ANCHOR_CLASS} py-12 sm:py-16`}
      dir="rtl"
    >
      <div className="mx-auto min-w-0 max-w-3xl text-center">
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
          <h2 className="mb-8 break-words text-2xl font-bold text-[#f0f0f0] sm:mb-10 sm:text-3xl md:text-4xl">
            {data.title}
          </h2>
        ) : null}
        <ul className="space-y-3 text-start">
          {data.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-4 text-start shadow-[0_0_0_1px_rgba(176,199,217,0.145)] transition-[box-shadow,background-color,transform] duration-200 hover:bg-white/[0.07] hover:shadow-[0_0_0_1px_rgba(214,235,253,0.22)] motion-safe:active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:gap-4 sm:px-5"
                  style={{ outlineColor: primary }}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="min-w-0 flex-1 break-words text-base font-semibold text-[#f0f0f0] sm:text-lg">
                    {item.question}
                  </span>
                  <span
                    className={`inline-flex size-8 shrink-0 items-center justify-center text-[0.65rem] font-normal leading-none text-[#464a4d] transition-transform duration-200 ease-out motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    ▼
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  aria-hidden={!isOpen}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="mx-2 mt-2 break-words rounded-lg bg-white/5 px-4 py-3 text-sm text-[#a1a4a5] opacity-90 sm:px-5 sm:text-base">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
