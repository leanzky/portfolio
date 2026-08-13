/**
 * ============================================================
 *  C# / .NET CAREER TRACK — content types.
 *
 *  All course content lives in this folder as plain data, the same
 *  convention `data/site.ts` uses for the portfolio: components render
 *  whatever they find here, so adding a lesson never means touching a
 *  component.
 *
 *  Code samples are written inside template literals. Two rules:
 *   - avoid backslashes (a "\n" inside a template literal becomes a real
 *     newline, silently mangling the sample),
 *   - avoid backticks.
 * ============================================================
 */

/** Languages the built-in highlighter knows (see lib/csharp-course/highlight.ts). */
export type CodeLanguage = "csharp" | "bash" | "json" | "xml" | "sql" | "text";

export type Snippet = {
  /** Short label above the block, e.g. "Program.cs" or "the fix". */
  caption?: string;
  language?: CodeLanguage;
  code: string;
};

export type QA = {
  q: string;
  a: string;
};

export type Lesson = {
  /** Stable id — progress is stored against it, so never renumber. */
  id: string;
  title: string;
  /** Rough focused-study time, used for the module and course totals. */
  minutes: number;
  /** One or two sentences: what this lesson is. */
  summary: string;
  /** Why it matters for getting and keeping a job. */
  why: string;
  /** The actual teaching content, one idea per bullet. */
  points: string[];
  code?: Snippet[];
  /** Mistakes that show up in code review, or in interviews. */
  pitfalls?: string[];
  /** Questions real interviewers ask about this material. */
  interview?: QA[];
  /** Something to build or run before ticking the lesson off. */
  practice?: string;
};

export type Module = {
  id: string;
  /** Displayed as the module number, e.g. "04". */
  number: string;
  title: string;
  blurb: string;
  /** The concrete capability you have when the module is done. */
  outcome: string;
  lessons: Lesson[];
};

export type ProjectIdea = {
  id: string;
  name: string;
  /** Beginner-friendly through to portfolio centrepiece. */
  level: "Warm-up" | "Core" | "Standout" | "Capstone";
  /** Realistic calendar estimate at a few hours a day. */
  duration: string;
  pitch: string;
  /** The specific hiring doubt this project answers. */
  proves: string;
  stack: string[];
  /** Non-negotiable features — the definition of "version 1". */
  requirements: string[];
  stretch: string[];
  /** How to talk about it in an interview. */
  talkingPoint: string;
};

export type Phase = {
  weeks: string;
  focus: string;
  modules: string;
  deliverable: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  detail: string;
};

export type Resource = {
  name: string;
  kind: "Docs" | "Course" | "Book" | "Video" | "Practice" | "Community";
  url: string;
  note: string;
};
