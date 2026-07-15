import { site } from "@/data/site";
import { JourneyTrail } from "./JourneyTrail";
import { SectionHeader } from "./SectionHeader";

export function About() {
  return (
    <section
      id="about"
      className="py-24 md:py-32 border-t border-border overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="01 / About"
          heading={site.about.heading}
          subheading={site.about.intro}
        />
        <JourneyTrail entries={site.about.timeline} />
      </div>
    </section>
  );
}
