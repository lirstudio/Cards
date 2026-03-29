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
        <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-neutral-700">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm"
            style={{ backgroundColor: primary }}
          >
            ?
          </span>
          {data.badge}
        </div>
        <h2 className="mb-8 break-words text-2xl font-bold text-black sm:mb-10 sm:text-3xl md:text-4xl">
          {data.title}
        </h2>
        <ul className="space-y-3 text-start">
          {data.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl bg-white px-4 py-4 text-start shadow-sm transition hover:shadow-md sm:gap-4 sm:px-5"
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="min-w-0 flex-1 break-words text-base font-semibold text-black sm:text-lg">
                    {item.question}
                  </span>
                  <span className="shrink-0 text-2xl font-light text-neutral-500">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? (
                  <div className="mx-2 mt-2 break-words rounded-lg bg-white/80 px-4 py-3 text-sm text-neutral-600 shadow-inner sm:px-5 sm:text-base">
                    {item.answer}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
