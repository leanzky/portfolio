"use client";

import { useCallback, useSyncExternalStore } from "react";
import { allLessons, lessonKey, readiness } from "@/data/csharp-course";

/**
 * Lesson and checklist progress, kept in localStorage.
 *
 * Per-device on purpose: this is a private study page, so there is no account
 * to hang it off and no value in a server round trip. Everything is keyed by
 * "moduleId/lessonId", which is why those ids must stay stable when content
 * is edited — renaming one silently resets that lesson.
 *
 * localStorage is an external store, so it is read through
 * useSyncExternalStore rather than an effect. That gives the correct empty
 * snapshot during server rendering and hydration, then swaps in the real one
 * without a hydration mismatch — and without setState cascading in an effect.
 */

const LESSON_KEY = "csharp-course-progress-v1";
const CHECKLIST_KEY = "csharp-course-readiness-v1";

type Snapshot = { lessons: ReadonlySet<string>; checks: ReadonlySet<string> };

/** Stable identity: returning a new object every call would loop forever. */
const EMPTY: Snapshot = { lessons: new Set(), checks: new Set() };

let cache: Snapshot | null = null;
const listeners = new Set<() => void>();

function readSet(key: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.filter((value): value is string => typeof value === "string"))
      : new Set();
  } catch {
    return new Set();
  }
}

function writeSet(key: string, values: ReadonlySet<string>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify([...values]));
  } catch {
    /* storage unavailable — progress simply is not remembered */
  }
}

function getSnapshot(): Snapshot {
  cache ??= { lessons: readSet(LESSON_KEY), checks: readSet(CHECKLIST_KEY) };
  return cache;
}

function getServerSnapshot(): Snapshot {
  return EMPTY;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab editing progress should be reflected here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === LESSON_KEY || event.key === CHECKLIST_KEY) {
      cache = null;
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(next: Snapshot): void {
  cache = next;
  listeners.forEach((listener) => listener());
}

function toggle(set: ReadonlySet<string>, value: string): Set<string> {
  const next = new Set(set);
  if (!next.delete(value)) next.add(value);
  return next;
}

export function useProgress() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleLesson = useCallback((moduleId: string, lessonId: string) => {
    const current = getSnapshot();
    const lessons = toggle(current.lessons, lessonKey(moduleId, lessonId));
    writeSet(LESSON_KEY, lessons);
    update({ ...current, lessons });
  }, []);

  const toggleCheck = useCallback((id: string) => {
    const current = getSnapshot();
    const checks = toggle(current.checks, id);
    writeSet(CHECKLIST_KEY, checks);
    update({ ...current, checks });
  }, []);

  const resetAll = useCallback(() => {
    writeSet(LESSON_KEY, EMPTY.lessons);
    writeSet(CHECKLIST_KEY, EMPTY.checks);
    update(EMPTY);
  }, []);

  const isDone = useCallback(
    (moduleId: string, lessonId: string) => snapshot.lessons.has(lessonKey(moduleId, lessonId)),
    [snapshot]
  );

  return {
    checked: snapshot.checks,
    isDone,
    toggleLesson,
    toggleCheck,
    resetAll,
    lessonsComplete: snapshot.lessons.size,
    lessonsTotal: allLessons.length,
    percent:
      allLessons.length === 0 ? 0 : Math.round((snapshot.lessons.size / allLessons.length) * 100),
    readinessComplete: snapshot.checks.size,
    readinessTotal: readiness.length,
  };
}
