"use client";

import { useState, useSyncExternalStore } from "react";
import {
  clearLeaderboard,
  getServerSnapshot,
  getSnapshot,
  subscribe,
  type LeaderboardEntry,
} from "@/lib/scrabble-slam/leaderboard";
import { dictionaries } from "@/lib/scrabble-slam/dictionary";
import { useT } from "./LanguageToggle";

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
  const t = useT();
  const { entries, lastRunId } = useLeaderboard();
  const highlightId = highlightLastRun ? lastRunId : null;
  const [confirming, setConfirming] = useState(false);

  const formatMode = (e: LeaderboardEntry) =>
    t(
      dictionaries[e.dictionaryId]?.script === "han"
        ? "board.modeHan"
        : "board.mode",
      {
        len: e.wordLength,
        timer: e.duration > 0 ? `${e.duration}s` : t("timer.endless"),
      }
    );

  return (
    <div className="font-mono text-left">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-green-700">
          {t("board.title")}
        </p>
        {showClear && entries.length > 0 && !confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="text-[10px] uppercase tracking-wide text-green-800 hover:text-rose-400 transition-colors"
          >
            {t("board.clear")}
          </button>
        )}
      </div>

      {/* Wiping saved runs is irreversible, so it asks first rather than
          firing straight off a mis-tap. */}
      {confirming && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-rose-900 bg-rose-500/5 px-3 py-2">
          <span className="text-[11px] text-rose-200">{t("board.confirmClear")}</span>
          <button
            onClick={() => {
              clearLeaderboard();
              setConfirming(false);
            }}
            className="rounded border border-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-300 hover:bg-rose-500/10"
          >
            {t("board.confirmYes")}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded border border-green-800 px-2 py-0.5 text-[10px] font-bold uppercase text-green-400 hover:border-green-500"
          >
            {t("board.confirmNo")}
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="mt-2.5 rounded-xl border border-dashed border-green-900 px-4 py-5 text-center text-xs leading-relaxed text-green-700">
          {t("board.empty")}
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
                        {t("board.thisRun")}
                      </span>
                    )}
                  </span>
                  <span className="block truncate text-[10px] text-green-700">
                    {formatMode(entry)} ·{" "}
                    {entry.wordsPlayed === 1
                      ? t("hud.wordPlayed", { n: 1 })
                      : t("hud.wordsPlayed", { n: entry.wordsPlayed })}{" "}
                    · <span className="uppercase">{entry.finalWord}</span>
                  </span>
                </span>
                <span
                  className={`shrink-0 text-[10px] uppercase tracking-wide ${
                    entry.won ? "text-green-400" : "text-green-800"
                  }`}
                >
                  {entry.won ? t("board.cleared") : t("board.timedOut")}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
