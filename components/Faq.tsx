"use client";

import { useState } from "react";
import { site } from "@/data/site";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 md:py-32 border-t border-border">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="04 / FAQ"
          heading={site.faq.heading}
          subheading={site.faq.subheading}
        />
        <div className="max-w-3xl divide-y divide-border border-y border-border">
          {site.faq.items.map((item, i) => {
            const open = openIndex === i;
            return (
              <Reveal key={item.question}>
                <div>
                  <button
                    className="w-full flex items-center justify-between gap-6 py-6 text-left group"
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span className="text-base md:text-lg font-medium tracking-tight group-hover:text-foreground transition-colors">
                      {item.question}
                    </span>
                    <span
                      className={`text-muted transition-transform duration-300 shrink-0 ${
                        open ? "rotate-45" : ""
                      }`}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-6 text-muted leading-relaxed max-w-xl">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
