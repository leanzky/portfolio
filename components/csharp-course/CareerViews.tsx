"use client";

import {
  courseStats,
  formatMinutes,
  interviewBank,
  modules,
  moduleMinutes,
  plan,
  projects,
  readiness,
  resources,
  type ProjectIdea,
} from "@/data/csharp-course";

/* ---------- shared bits ---------- */

export function ViewHeader({
  eyebrow,
  title,
  blurb,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
}) {
  return (
    <header className="border-b border-violet-500/15 pb-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-violet-400/70">
        {eyebrow}
      </p>
      <h2 className="mt-2.5 font-mono text-2xl font-bold text-violet-50 sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-violet-100/70">{blurb}</p>
    </header>
  );
}

/* ---------- overview ---------- */

export function OverviewView({
  onOpenModule,
  percent,
  lessonsComplete,
}: {
  onOpenModule: (moduleId: string) => void;
  percent: number;
  lessonsComplete: number;
}) {
  return (
    <div>
      <ViewHeader
        eyebrow="Start here"
        title="From first console app to hired .NET developer"
        blurb="Twelve modules, ordered so each one is usable on its own and every one feeds a project. The material is chosen for two audiences at once: the code reviewer who will read your work, and the interviewer who will ask you why you did it that way."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { value: String(courseStats.modules), label: "modules" },
          { value: String(courseStats.lessons), label: "lessons" },
          { value: formatMinutes(courseStats.minutes), label: "of focused study" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-5"
          >
            <p className="font-mono text-3xl font-bold text-violet-100">{stat.value}</p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-violet-400/70">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-5">
        <div className="flex items-center justify-between font-mono text-xs text-violet-300/70">
          <span>your progress</span>
          <span>
            {lessonsComplete}/{courseStats.lessons} &middot; {percent}%
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-500/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400 transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <section className="mt-12">
        <h3 className="font-mono text-lg font-bold text-violet-100">How to use this</h3>
        <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-violet-100/75">
          {[
            "Work in order. Every module assumes the one before it, and the projects are sequenced to match.",
            "Do the practice task before ticking a lesson off. Reading about async and writing async are different skills, and only one of them survives an interview.",
            "Build the project attached to each phase as you go. Finished, deployed projects are the entire argument for hiring you.",
            "Read the interview questions before you think you are ready for them. They tell you what depth the material is actually needed at.",
            "Progress is saved in this browser only — no account, nothing sent anywhere.",
          ].map((line, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-mono text-violet-400/60">{String(i + 1).padStart(2, "0")}</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h3 className="font-mono text-lg font-bold text-violet-100">The 16-week plan</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-violet-100/70">
          Sized for two or three focused hours on weekdays plus a longer weekend session. Slower is
          fine; skipping the deliverable is not.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-violet-500/20 font-mono text-[11px] uppercase tracking-[0.16em] text-violet-400/70">
                <th className="py-3 pr-4 font-normal">When</th>
                <th className="py-3 pr-4 font-normal">Focus</th>
                <th className="py-3 pr-4 font-normal">Modules</th>
                <th className="py-3 font-normal">Deliverable</th>
              </tr>
            </thead>
            <tbody>
              {plan.map((phase) => (
                <tr key={phase.weeks} className="border-b border-violet-500/10 align-top">
                  <td className="py-3.5 pr-4 font-mono text-violet-300/90">{phase.weeks}</td>
                  <td className="py-3.5 pr-4 text-violet-100/85">{phase.focus}</td>
                  <td className="py-3.5 pr-4 font-mono text-violet-400/70">{phase.modules}</td>
                  <td className="py-3.5 text-violet-100/65">{phase.deliverable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h3 className="font-mono text-lg font-bold text-violet-100">The curriculum</h3>
        <div className="mt-5 grid gap-3">
          {modules.map((module) => (
            <button
              key={module.id}
              type="button"
              onClick={() => onOpenModule(module.id)}
              className="group rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-5 text-left transition hover:border-violet-400/50 hover:bg-violet-500/[0.07]"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-2xl font-bold text-violet-500/50 transition-colors group-hover:text-violet-400">
                  {module.number}
                </span>
                <div className="min-w-0">
                  <h4 className="font-mono text-base font-bold text-violet-50">{module.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-violet-100/65">{module.blurb}</p>
                  <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-violet-400/60">
                    {module.lessons.length} lessons &middot; {formatMinutes(moduleMinutes(module))}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- projects ---------- */

const LEVEL_STYLE: Record<ProjectIdea["level"], string> = {
  "Warm-up": "border-slate-400/40 text-slate-300",
  Core: "border-sky-400/40 text-sky-300",
  Standout: "border-violet-400/50 text-violet-300",
  Capstone: "border-amber-400/50 text-amber-300",
};

export function ProjectsView() {
  return (
    <div>
      <ViewHeader
        eyebrow="Build these"
        title="Six projects, in the order that builds an argument"
        blurb="Each one adds exactly one layer of difficulty, and every one is defensible in an interview. Two of these finished properly beat ten abandoned repositories — depth is the signal, not count."
      />

      <div className="mt-8 space-y-6">
        {projects.map((project, index) => (
          <article
            key={project.id}
            className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xl font-bold text-violet-500/50">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-mono text-xl font-bold text-violet-50">{project.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${LEVEL_STYLE[project.level]}`}
                >
                  {project.level}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-violet-400/60">
                  {project.duration}
                </span>
              </div>
            </div>

            <p className="mt-4 text-[15px] leading-relaxed text-violet-100/85">{project.pitch}</p>

            <p className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-4 text-[15px] leading-relaxed text-violet-100/80">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-300/80">
                What it proves&nbsp;
              </span>
              {project.proves}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-violet-500/25 px-2.5 py-1 font-mono text-[11px] text-violet-300/70"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-300/80">
                  Version 1 is not done until
                </p>
                <ul className="mt-3 space-y-2">
                  {project.requirements.map((requirement, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[14.5px] leading-relaxed text-violet-100/75"
                    >
                      <span aria-hidden className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-violet-400/60" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-300/50">
                  Then, if you want more
                </p>
                <ul className="mt-3 space-y-2">
                  {project.stretch.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[14.5px] leading-relaxed text-violet-100/55"
                    >
                      <span aria-hidden className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-violet-400/30" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-6 border-l-2 border-sky-400/40 pl-4 text-[15px] leading-relaxed text-sky-100/80">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-sky-300/80">
                How to talk about it&nbsp;
              </span>
              {project.talkingPoint}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ---------- interview bank ---------- */

export function InterviewView() {
  return (
    <div>
      <ViewHeader
        eyebrow="Rehearse these"
        title="The question bank"
        blurb="Grouped by the round they show up in. Read the answers as a starting shape, then say them in your own words — a memorised answer is audible, and follow-up questions find the seams."
      />

      <div className="mt-8 space-y-10">
        {interviewBank.map((group) => (
          <section key={group.category}>
            <h3 className="font-mono text-lg font-bold text-violet-100">{group.category}</h3>
            <div className="mt-4 space-y-2">
              {group.questions.map((qa, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-violet-500/20 bg-violet-500/[0.03] px-5 py-4"
                >
                  <summary className="cursor-pointer list-none font-medium text-violet-50 marker:content-none">
                    <span className="mr-2.5 font-mono text-violet-400/60 group-open:hidden">+</span>
                    <span className="mr-2.5 hidden font-mono text-violet-400/60 group-open:inline">
                      &minus;
                    </span>
                    {qa.q}
                  </summary>
                  <p className="mt-3.5 border-l-2 border-violet-400/30 pl-4 text-[15px] leading-relaxed text-violet-100/75">
                    {qa.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ---------- readiness checklist ---------- */

export function ReadinessView({
  checked,
  onToggle,
}: {
  checked: ReadonlySet<string>;
  onToggle: (id: string) => void;
}) {
  const complete = readiness.filter((item) => checked.has(item.id)).length;

  return (
    <div>
      <ViewHeader
        eyebrow="Be honest"
        title="Job-readiness checklist"
        blurb="Tick these only when they are genuinely true. The point is to find the two or three that are not, and fix those instead of learning another framework."
      />

      <div className="mt-6 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-violet-500/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-[width] duration-500"
            style={{ width: `${(complete / readiness.length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-xs text-violet-300/70">
          {complete}/{readiness.length}
        </span>
      </div>

      <ul className="mt-8 space-y-3">
        {readiness.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                aria-pressed={isChecked}
                className={`flex w-full gap-4 rounded-xl border p-4 text-left transition ${
                  isChecked
                    ? "border-emerald-400/40 bg-emerald-400/[0.06]"
                    : "border-violet-500/20 bg-violet-500/[0.03] hover:border-violet-400/50"
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border font-mono text-xs ${
                    isChecked
                      ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-200"
                      : "border-violet-500/40 text-transparent"
                  }`}
                >
                  x
                </span>
                <span className="min-w-0">
                  <span
                    className={`block font-medium ${isChecked ? "text-emerald-100/90" : "text-violet-50"}`}
                  >
                    {item.label}
                  </span>
                  <span className="mt-1.5 block text-[14.5px] leading-relaxed text-violet-100/60">
                    {item.detail}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- resources ---------- */

export function ResourcesView() {
  return (
    <div>
      <ViewHeader
        eyebrow="Go deeper"
        title="Resources worth your time"
        blurb="Deliberately short. A curated dozen you actually finish beats a list of fifty you bookmark."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {resources.map((resource) => (
          <a
            key={resource.name}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-5 transition hover:border-violet-400/50 hover:bg-violet-500/[0.07]"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-mono text-[15px] font-bold text-violet-50">{resource.name}</h3>
              <span className="shrink-0 rounded-full border border-violet-500/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-violet-400/70">
                {resource.kind}
              </span>
            </div>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-violet-100/65">
              {resource.note}
            </p>
            <span className="mt-3 inline-block font-mono text-[11px] text-violet-400/50 transition-colors group-hover:text-violet-300">
              open &rarr;
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
