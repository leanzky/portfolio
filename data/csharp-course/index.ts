import { foundationModules } from "./foundations";
import { webModules } from "./web";
import { productionModules } from "./production";
import type { Lesson, Module } from "./types";

export * from "./types";
export { projects, plan, interviewBank, readiness, resources } from "./career";

/** The whole curriculum, in the order it should be taken. */
export const modules: Module[] = [
  ...foundationModules,
  ...webModules,
  ...productionModules,
];

/** Every lesson, flattened — used for progress totals and prev/next navigation. */
export const allLessons: { module: Module; lesson: Lesson }[] = modules.flatMap(
  (module) => module.lessons.map((lesson) => ({ module, lesson }))
);

/** Progress is keyed by this, so the id pair must stay stable over edits. */
export function lessonKey(moduleId: string, lessonId: string): string {
  return `${moduleId}/${lessonId}`;
}

export function moduleMinutes(module: Module): number {
  return module.lessons.reduce((total, lesson) => total + lesson.minutes, 0);
}

export const courseStats = {
  modules: modules.length,
  lessons: allLessons.length,
  minutes: modules.reduce((total, module) => total + moduleMinutes(module), 0),
};

/** "18h 40m" — the headline number on the overview. */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export const courseMeta = {
  title: "C# & .NET Career Track",
  subtitle: "From first console app to hired .NET developer",
  description:
    "A complete, opinionated path through C#, ASP.NET Core, EF Core, testing, architecture and deployment — built around what actually gets asked in interviews and what actually gets you hired.",
};
