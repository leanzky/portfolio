"use client";

/** Quiz attempt history, same external-store shape as progress.ts and
    active-tab.ts. Only the record of past attempts is persisted — the
    in-progress answers for the current attempt live in component state,
    since there's no reason to survive a reload mid-quiz. */

export type QuizRecord = {
  bestScore: number;
  bestTotal: number;
  lastScore: number;
  lastTotal: number;
  attempts: number;
};

const KEY = "ao2-reviewer:quiz:v1";
const EMPTY: QuizRecord = { bestScore: 0, bestTotal: 0, lastScore: 0, lastTotal: 0, attempts: 0 };

let cache: QuizRecord | null = null;
const listeners = new Set<() => void>();

function load(): QuizRecord {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QuizRecord) : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function subscribeQuiz(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getQuizSnapshot(): QuizRecord {
  cache ??= load();
  return cache;
}

export function getQuizServerSnapshot(): QuizRecord {
  return EMPTY;
}

export function recordAttempt(score: number, total: number): void {
  const cur = getQuizSnapshot();
  // Best is by percentage, not raw score, so a shorter future quiz can
  // still beat an older longer one fairly.
  const curPct = cur.bestTotal ? cur.bestScore / cur.bestTotal : -1;
  const newPct = total ? score / total : 0;
  const next: QuizRecord = {
    bestScore: newPct >= curPct ? score : cur.bestScore,
    bestTotal: newPct >= curPct ? total : cur.bestTotal,
    lastScore: score,
    lastTotal: total,
    attempts: cur.attempts + 1,
  };
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Not persisted this session; still updates in memory.
  }
  listeners.forEach((l) => l());
}
