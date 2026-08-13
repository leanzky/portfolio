"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  formatMinutes,
  modules,
  moduleMinutes,
  type Module,
} from "@/data/csharp-course";
import { useProgress } from "@/lib/csharp-course/useProgress";
import { lock } from "@/lib/private-gate";
import { LessonView } from "./LessonView";
import {
  InterviewView,
  OverviewView,
  ProjectsView,
  ReadinessView,
  ResourcesView,
  ViewHeader,
} from "./CareerViews";

/** "overview" | "projects" | ... | "module:aspnet-core" */
type View = string;

const CAREER_VIEWS = [
  { id: "projects", label: "Project ideas" },
  { id: "interview", label: "Interview bank" },
  { id: "readiness", label: "Readiness check" },
  { id: "resources", label: "Resources" },
] as const;

function ModuleView({
  module,
  isDone,
  onToggle,
  onNavigate,
}: {
  module: Module;
  isDone: (moduleId: string, lessonId: string) => boolean;
  onToggle: (moduleId: string, lessonId: string) => void;
  onNavigate: (view: View) => void;
}) {
  const index = modules.findIndex((m) => m.id === module.id);
  const previous = index > 0 ? modules[index - 1] : null;
  const next = index < modules.length - 1 ? modules[index + 1] : null;
  const complete = module.lessons.filter((lesson) => isDone(module.id, lesson.id)).length;

  return (
    <div>
      <ViewHeader
        eyebrow={`Module ${module.number} · ${module.lessons.length} lessons · ${formatMinutes(moduleMinutes(module))}`}
        title={module.title}
        blurb={module.blurb}
      />

      <div className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.04] p-4 sm:p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-300/80">
          When you finish this module
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-violet-100/80">{module.outcome}</p>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-violet-500/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400 transition-[width] duration-500"
            style={{ width: `${(complete / module.lessons.length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-xs text-violet-300/60">
          {complete}/{module.lessons.length}
        </span>
      </div>

      <div className="mt-6">
        {module.lessons.map((lesson, i) => (
          <LessonView
            key={lesson.id}
            lesson={lesson}
            index={i}
            done={isDone(module.id, lesson.id)}
            onToggle={() => onToggle(module.id, lesson.id)}
          />
        ))}
      </div>

      <nav className="mt-10 flex flex-col gap-3 border-t border-violet-500/15 pt-6 sm:flex-row sm:justify-between">
        {previous ? (
          <button
            type="button"
            onClick={() => onNavigate(`module:${previous.id}`)}
            className="rounded-xl border border-violet-500/25 px-4 py-3 text-left transition hover:border-violet-400/60"
          >
            <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-violet-400/60">
              &larr; previous
            </span>
            <span className="mt-1 block font-mono text-sm text-violet-100">{previous.title}</span>
          </button>
        ) : (
          <span />
        )}

        {next ? (
          <button
            type="button"
            onClick={() => onNavigate(`module:${next.id}`)}
            className="rounded-xl border border-violet-500/25 px-4 py-3 text-right transition hover:border-violet-400/60"
          >
            <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-violet-400/60">
              next &rarr;
            </span>
            <span className="mt-1 block font-mono text-sm text-violet-100">{next.title}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate("projects")}
            className="rounded-xl border border-violet-500/25 px-4 py-3 text-right transition hover:border-violet-400/60"
          >
            <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-violet-400/60">
              next &rarr;
            </span>
            <span className="mt-1 block font-mono text-sm text-violet-100">Project ideas</span>
          </button>
        )}
      </nav>
    </div>
  );
}

export function CourseApp() {
  const [view, setView] = useState<View>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const progress = useProgress();
  const mainRef = useRef<HTMLDivElement>(null);

  // Switching view should feel like a page change, not a scroll position carried over.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [view]);

  function navigate(next: View) {
    setView(next);
    setNavOpen(false);
  }

  const activeModule = view.startsWith("module:")
    ? modules.find((m) => m.id === view.slice("module:".length))
    : undefined;

  const navButton = (
    id: View,
    label: string,
    active: boolean,
    options?: { meta?: string; number?: string }
  ) => (
    <button
      key={id}
      type="button"
      onClick={() => navigate(id)}
      className={`flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm leading-snug transition ${
        active
          ? "bg-violet-500/15 text-violet-100"
          : "text-violet-200/55 hover:bg-violet-500/[0.07] hover:text-violet-100"
      }`}
    >
      <span className="flex min-w-0 gap-2">
        {options?.number && (
          <span className="shrink-0 font-mono text-xs text-violet-400/50">{options.number}</span>
        )}
        {/* Titles wrap rather than truncate: a half-visible module name is
            harder to scan than a two-line one. */}
        <span className="min-w-0">{label}</span>
      </span>
      {options?.meta && (
        <span className="mt-0.5 shrink-0 font-mono text-[10px] text-violet-400/50">
          {options.meta}
        </span>
      )}
    </button>
  );

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-violet-500/15 p-5">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet-400/60 transition-colors hover:text-violet-300"
        >
          &larr; portfolio
        </Link>
        <p className="mt-3 font-mono text-sm font-bold text-violet-50">C# &amp; .NET</p>
        <p className="font-mono text-xs text-violet-400/60">career track</p>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-violet-500/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400 transition-[width] duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-violet-400/50">
          {progress.lessonsComplete}/{progress.lessonsTotal} lessons &middot; {progress.percent}%
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {navButton("overview", "Overview", view === "overview")}

        <p className="mt-5 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-400/40">
          Curriculum
        </p>
        <div className="mt-1.5 space-y-0.5">
          {modules.map((module) => {
            const complete = module.lessons.filter((lesson) =>
              progress.isDone(module.id, lesson.id)
            ).length;
            return navButton(`module:${module.id}`, module.title, view === `module:${module.id}`, {
              number: module.number,
              meta: `${complete}/${module.lessons.length}`,
            });
          })}
        </div>

        <p className="mt-5 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-400/40">
          Getting hired
        </p>
        <div className="mt-1.5 space-y-0.5">
          {CAREER_VIEWS.map((item) =>
            navButton(item.id, item.label, view === item.id, {
              meta:
                item.id === "readiness"
                  ? `${progress.readinessComplete}/${progress.readinessTotal}`
                  : undefined,
            })
          )}
        </div>
      </nav>

      <div className="border-t border-violet-500/15 p-3">
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset all lesson and checklist progress?")) progress.resetAll();
          }}
          className="w-full rounded-lg px-3 py-2 text-left font-mono text-[11px] text-violet-400/50 transition hover:bg-violet-500/[0.07] hover:text-violet-200"
        >
          reset progress
        </button>
        <button
          type="button"
          onClick={lock}
          className="w-full rounded-lg px-3 py-2 text-left font-mono text-[11px] text-violet-400/50 transition hover:bg-violet-500/[0.07] hover:text-violet-200"
        >
          lock this page
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh lg:flex">
      {/* Mobile bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-violet-500/20 bg-[#0d0b14]/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-mono text-sm font-bold text-violet-50">C# &amp; .NET track</span>
        <button
          type="button"
          onClick={() => setNavOpen((open) => !open)}
          aria-expanded={navOpen}
          className="rounded-lg border border-violet-500/30 px-3 py-1.5 font-mono text-xs text-violet-200"
        >
          {navOpen ? "close" : "menu"}
        </button>
      </div>

      {navOpen && (
        <div className="fixed inset-0 top-[57px] z-20 overflow-y-auto bg-[#0d0b14] lg:hidden">
          {sidebar}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-72 shrink-0 border-r border-violet-500/15 bg-[#100e1a] lg:block">
        {sidebar}
      </aside>

      <main ref={mainRef} className="min-w-0 flex-1">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
          {activeModule ? (
            <ModuleView
              module={activeModule}
              isDone={progress.isDone}
              onToggle={progress.toggleLesson}
              onNavigate={navigate}
            />
          ) : view === "projects" ? (
            <ProjectsView />
          ) : view === "interview" ? (
            <InterviewView />
          ) : view === "readiness" ? (
            <ReadinessView checked={progress.checked} onToggle={progress.toggleCheck} />
          ) : view === "resources" ? (
            <ResourcesView />
          ) : (
            <OverviewView
              onOpenModule={(id) => navigate(`module:${id}`)}
              percent={progress.percent}
              lessonsComplete={progress.lessonsComplete}
            />
          )}
        </div>
      </main>
    </div>
  );
}
