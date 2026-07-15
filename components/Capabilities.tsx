import { site } from "@/data/site";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

export function Capabilities() {
  return (
    <section
      id="what-you-get"
      className="py-24 md:py-32 border-t border-border"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="03 / Value"
          heading={site.capabilities.heading}
          subheading={site.capabilities.subheading}
        />
        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 bg-border rounded-2xl overflow-hidden border border-border">
          {site.capabilities.items.map((item, i) => (
            <div key={item.title} className="bg-card p-7 md:p-8 h-full">
              <Reveal delay={(i % 3) * 80}>
                <p className="text-xs font-mono text-muted mb-4">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="text-base font-semibold tracking-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {item.text}
                </p>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
