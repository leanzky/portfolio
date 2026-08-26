"use client";

/** Which tab is open, remembered across visits. Same external-store shape
    as progress.ts — kept separate since it's a single string, not a map. */

const KEY = "ao2-reviewer:tab:v1";
const DEFAULT_TAB = "master";

let cache: string | null = null;
const listeners = new Set<() => void>();

function load(): string {
  if (typeof window === "undefined") return DEFAULT_TAB;
  try {
    return window.localStorage.getItem(KEY) || DEFAULT_TAB;
  } catch {
    return DEFAULT_TAB;
  }
}

export function subscribeTab(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTabSnapshot(): string {
  cache ??= load();
  return cache;
}

export function getTabServerSnapshot(): string {
  return DEFAULT_TAB;
}

export function setActiveTab(id: string): void {
  cache = id;
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    // Not persisted this session; still updates in memory.
  }
  listeners.forEach((l) => l());
}
