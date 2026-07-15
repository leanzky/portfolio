import { Reveal } from "./Reveal";

export function SectionHeader({
  eyebrow,
  heading,
  subheading,
}: {
  eyebrow: string;
  heading: string;
  subheading?: string;
}) {
  return (
    <Reveal>
      <div className="mb-12 md:mb-16 max-w-2xl">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted mb-4">
          {eyebrow}
        </p>
        <h2 className="font-display uppercase text-3xl md:text-5xl font-bold tracking-tight text-balance">
          {heading}
        </h2>
        {subheading && (
          <p className="mt-4 text-base md:text-lg text-muted leading-relaxed">
            {subheading}
          </p>
        )}
      </div>
    </Reveal>
  );
}
