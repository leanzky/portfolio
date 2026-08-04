import type { DictionaryId, WordLength } from "./dictionary";

/**
 * Solo leaderboard, stored in this browser via localStorage.
 *
 * Deliberately local rather than server-backed: it needs no account, no
 * migration and no moderation, it works on a fresh deploy with nothing
 * configured, and an anonymous global board for a portfolio game is mostly
 * a spam target. Swapping in a Supabase table later only means replacing
 * `load` and `recordRun` — the components read through the store below.
 */

const STORAGE_KEY = "scrabble-slam:leaderboard:v1";
const MAX_ENTRIES = 10;

export type LeaderboardEntry = {
  id: string;
  score: number;
  won: boolean;
  wordsPlayed: number;
  wordLength: WordLength;
  dictionaryId: DictionaryId;
  /** 0 means Endless (no timer). */
  duration: number;
  finalWord: string;
  playedAt: number;
};

export type LeaderboardState = {
  entries: readonly LeaderboardEntry[];
  /** Id of the run recorded most recently this session, so the end screen
      can highlight where it landed without threading state back up. */
  lastRunId: string | null;
};

const EMPTY_STATE: LeaderboardState = { entries: [], lastRunId: null };

/* ---------- Store ----------
   useSyncExternalStore needs getSnapshot to be pure and referentially
   stable, so reads go through this cache and only writes invalidate it. */

let cache: LeaderboardState | null = null;
const listeners = new Set<() => void>();

function isEntry(value: unknown): value is LeaderboardEntry {
  if (!value || typeof value !== "object") return false;
  const e = value as Partial<LeaderboardEntry>;
  return typeof e.id === "string" && typeof e.score === "number";
}

function loadEntries(): readonly LeaderboardEntry[] {
  if (typeof window === "undefined") return EMPTY_STATE.entries;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE.entries;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_STATE.entries;
    return parsed.filter(isEntry);
  } catch {
    // Private mode, quota, or a corrupt value: an empty board is fine.
    return EMPTY_STATE.entries;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab finishing a run should show up here too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = { entries: loadEntries(), lastRunId: cache?.lastRunId ?? null };
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): LeaderboardState {
  cache ??= { entries: loadEntries(), lastRunId: null };
  return cache;
}

export function getServerSnapshot(): LeaderboardState {
  return EMPTY_STATE;
}

/** Saves a finished run and returns its id so the board can highlight it. */
export function recordRun(
  run: Omit<LeaderboardEntry, "id" | "playedAt">
): string {
  const entry: LeaderboardEntry = {
    ...run,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    playedAt: Date.now(),
  };

  const entries = [...getSnapshot().entries, entry]
    .sort((a, b) => b.score - a.score || b.playedAt - a.playedAt)
    .slice(0, MAX_ENTRIES);

  cache = { entries, lastRunId: entry.id };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Couldn't persist (private mode / quota). The in-memory board still
    // updates for this session, which is the visible behaviour anyway.
  }
  emit();
  return entry.id;
}

export function clearLeaderboard() {
  cache = EMPTY_STATE;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — the cache is already cleared.
  }
  emit();
}

export function formatMode(entry: LeaderboardEntry): string {
  const timer = entry.duration > 0 ? `${entry.duration}s` : "Endless";
  return `${entry.wordLength} letters · ${timer}`;
}
