"use client";

import { useSyncExternalStore } from "react";
import {
  clearLeaderboard,
  formatMode,
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from "@/lib/scrabble-slam/leaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];

export function useLeaderboard() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Top solo runs on this device. Shown on the start screen, and again after
 * a round with that run highlighted so you can see where it landed.
 */
export function Leaderboard({
  highlightLastRun = false,
  showClear = false,
}: {
  /** Marks the run recorded most recently this session. */
  highlightLastRun?: boolean;
  showClear?: boolean;
}) {
  const { entries, lastRunId } = useLeaderboard();
  const highlightId = highlightLastRun ? lastRunId : null;

  return (
    <div className="font-mono text-left">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-green-700">
          Leaderboard
        </p>
        {showClear && entries.length > 0 && (
          <button
            onClick={clearLeaderboard}
            className="text-[10px] uppercase tracking-wide text-green-800 hover:text-rose-400 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="mt-2.5 rounded-xl border border-dashed border-green-900 px-4 py-5 text-center text-xs leading-relaxed text-green-700">
          No runs yet. Finish a round and your score lands here.
        </p>
      ) : (
        <ol className="mt-2.5 space-y-1.5">
          {entries.map((entry, i) => {
            const isNew = entry.id === highlightId;
            return (
              <li
                key={entry.id}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                  isNew
                    ? "border-lime-400 bg-lime-400/10"
                    : "border-green-900 bg-[#06110a]"
                }`}
              >
                <span className="w-6 shrink-0 text-center text-xs text-green-600">
                  {MEDALS[i] ?? i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-green-50">
                    {entry.score.toLocaleString()}
                    {isNew && (
                      <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-lime-300">
                        This run
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-[10px] text-green-700">
                    {formatMode(entry)} · {entry.wordsPlayed} word
                    {entry.wordsPlayed === 1 ? "" : "s"} ·{" "}
                    <span className="uppercase">{entry.finalWord}</span>
                  </span>
                </span>
                <span
                  className={`shrink-0 text-[10px] uppercase tracking-wide ${
                    entry.won ? "text-green-400" : "text-green-800"
                  }`}
                >
                  {entry.won ? "Cleared" : "Timed out"}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
