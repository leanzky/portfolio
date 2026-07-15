import { site, type Project } from "@/data/site";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const number = String(index + 1).padStart(2, "0");

  const card = (
    <article className="group h-full flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
      {/* Static preview — image if provided, otherwise a quiet placeholder */}
      <div className="relative aspect-[16/10] bg-[linear-gradient(135deg,#f0f0f0,#e2e2e2)] overflow-hidden">
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt={project.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl md:text-5xl font-semibold tracking-tighter text-black/10 select-none">
              {project.name}
            </span>
          </div>
        )}
        <span className="absolute top-4 left-4 text-xs font-mono bg-background/85 backdrop-blur px-2.5 py-1 rounded-full border border-border">
          {number}
        </span>
      </div>

      <div className="p-6 flex flex-col gap-3 grow">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold tracking-tight">
            {project.name}
          </h3>
          {project.url && (
            <span className="text-xs text-muted group-hover:text-foreground transition-colors shrink-0">
              Visit ↗
            </span>
          )}
        </div>
        <p className="text-sm text-muted leading-relaxed grow">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono uppercase tracking-wider text-muted border border-border rounded-full px-2.5 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );

  return (
    <Reveal delay={(index % 2) * 100}>
      {project.url ? (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full"
        >
          {card}
        </a>
      ) : (
        card
      )}
    </Reveal>
  );
}

export function Projects() {
  return (
    <section id="projects" className="py-24 md:py-32 border-t border-border">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="02 / Work"
          heading={site.projects.heading}
          subheading={site.projects.subheading}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {site.projects.items.map((project, i) => (
            <ProjectCard key={project.name} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
