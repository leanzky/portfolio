"use client";

import type { Lesson } from "@/data/csharp-course";
import { CodeBlock } from "./CodeBlock";

function Section({
  label,
  tone = "default",
  children,
}: {
  label: string;
  tone?: "default" | "warn" | "good";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "warn"
      ? "border-amber-400/25 bg-amber-400/[0.04]"
      : tone === "good"
        ? "border-emerald-400/25 bg-emerald-400/[0.04]"
        : "border-violet-500/20 bg-violet-500/[0.04]";

  const labelClass =
    tone === "warn"
      ? "text-amber-300/80"
      : tone === "good"
        ? "text-emerald-300/80"
        : "text-violet-300/80";

  return (
    <div className={`mt-5 rounded-xl border ${toneClass} p-4 sm:p-5`}>
      <p className={`font-mono text-[11px] uppercase tracking-[0.2em] ${labelClass}`}>
        {label}
      </p>
      <div className="mt-2.5 text-[15px] leading-relaxed text-violet-100/80">{children}</div>
    </div>
  );
}

export function LessonView({
  lesson,
  index,
  done,
  onToggle,
}: {
  lesson: Lesson;
  index: number;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      id={lesson.id}
      className="scroll-mt-24 border-t border-violet-500/15 py-10 first:border-t-0 first:pt-2"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-violet-400/60">
            Lesson {String(index + 1).padStart(2, "0")} &middot; {lesson.minutes} min
          </p>
          <h3 className="mt-2 font-mono text-xl font-bold text-violet-50 sm:text-2xl">
            {lesson.title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={done}
          className={`shrink-0 rounded-lg border px-3 py-1.5 font-mono text-xs transition ${
            done
              ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
              : "border-violet-500/30 text-violet-300/70 hover:border-violet-400/60 hover:text-violet-200"
          }`}
        >
          {done ? "done" : "mark done"}
        </button>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-violet-100/85">{lesson.summary}</p>

      <Section label="Why this matters for the job">{lesson.why}</Section>

      <ul className="mt-6 space-y-3">
        {lesson.points.map((point, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-violet-100/75">
            <span
              aria-hidden
              className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400/60"
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {lesson.code?.map((snippet, i) => <CodeBlock key={i} snippet={snippet} />)}

      {lesson.pitfalls && lesson.pitfalls.length > 0 && (
        <Section label="Common mistakes" tone="warn">
          <ul className="space-y-2">
            {lesson.pitfalls.map((pitfall, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden className="shrink-0 text-amber-300/70">
                  !
                </span>
                <span>{pitfall}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {lesson.interview && lesson.interview.length > 0 && (
        <div className="mt-5 rounded-xl border border-sky-400/25 bg-sky-400/[0.04] p-4 sm:p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-300/80">
            Interview questions
          </p>
          <div className="mt-3 space-y-2">
            {lesson.interview.map((qa, i) => (
              <details
                key={i}
                className="group rounded-lg border border-sky-400/15 bg-sky-400/[0.03] px-4 py-3"
              >
                <summary className="cursor-pointer list-none font-medium text-sky-100/90 marker:content-none">
                  <span className="mr-2 text-sky-400/60 group-open:hidden">+</span>
                  <span className="mr-2 hidden text-sky-400/60 group-open:inline">&minus;</span>
                  {qa.q}
                </summary>
                <p className="mt-3 border-l-2 border-sky-400/30 pl-4 text-[15px] leading-relaxed text-violet-100/75">
                  {qa.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      {lesson.practice && (
        <Section label="Do this before ticking it off" tone="good">
          {lesson.practice}
        </Section>
      )}
    </article>
  );
}
