"use client";

/**
 * Checklist progress for the AO2 reviewer, persisted as one localStorage key
 * keyed by list id -> item id -> checked. Modeled on the leaderboard and
 * mute-preference stores elsewhere in this repo: reads happen in
 * getSnapshot (where React expects impure external reads) and the snapshot
 * stays referentially stable between writes.
 */

export type ProgressState = Record<string, Record<string, boolean>>;

const KEY = "ao2-reviewer:progress:v1";
const EMPTY: ProgressState = {};

let cache: ProgressState | null = null;
const listeners = new Set<() => void>();

function load(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressState) : EMPTY;
  } catch {
    // Private browsing, quota, or a corrupt value: an empty board is fine.
    return EMPTY;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = load();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): ProgressState {
  cache ??= load();
  return cache;
}

export function getServerSnapshot(): ProgressState {
  return EMPTY;
}

export function toggle(listId: string, itemId: string): void {
  const cur = getSnapshot();
  const list = { ...(cur[listId] ?? {}) };
  list[itemId] = !list[itemId];
  const next = { ...cur, [listId]: list };
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Couldn't persist; the in-memory state still updates for this session.
  }
  emit();
}

export function isChecked(
  state: ProgressState,
  listId: string,
  itemId: string
): boolean {
  return !!state[listId]?.[itemId];
}

export function clearAll(): void {
  cache = EMPTY;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to do — the cache is already cleared.
  }
  emit();
}
