"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { DictionaryId, WordLength } from "@/lib/scrabble-slam/dictionary";
import { recordRun } from "@/lib/scrabble-slam/leaderboard";
import type { GameStatus } from "@/lib/scrabble-slam/reducer";
import { computeScore } from "@/lib/scrabble-slam/scoring";
import { Leaderboard } from "./Leaderboard";
import { useT } from "./LanguageToggle";
import styles from "./game.module.css";

export function EndScreen({
  status,
  word,
  wordLength,
  dictionaryId,
  duration,
  secondsLeft,
  cardsLeft,
  wordsPlayed,
  draws,
  swaps,
  rescues,
  record = true,
  headline,
  playAgainLabel,
  onPlayAgain,
}: {
  status: GameStatus;
  word: string;
  wordLength: WordLength;
  dictionaryId: DictionaryId;
  /** 0 means Endless. */
  duration: number;
  secondsLeft: number;
  cardsLeft: number;
  wordsPlayed: number;
  draws: number;
  swaps: number;
  rescues: number;
  /** The leaderboard is solo-only, so multiplayer shows a score but
      doesn't save it. */
  record?: boolean;
  /** Overrides the win/lose headline, e.g. "Ana wins!" in multiplayer. */
  headline?: string;
  playAgainLabel?: string;
  onPlayAgain: () => void;
}) {
  const t = useT();
  const won = status === "won";
  const score = computeScore({
    won,
    wordsPlayed,
    wordLength,
    dictionaryId,
    secondsLeft,
    duration,
    draws,
    rescues,
  });

  // Save the run exactly once. The ref survives StrictMode's double-invoke,
  // and the board re-renders off the store rather than off local state.
  const recorded = useRef(false);
  useEffect(() => {
    if (!record || recorded.current) return;
    recorded.current = true;
    recordRun({
      score: score.total,
      won,
      wordsPlayed,
      wordLength,
      dictionaryId,
      duration,
      finalWord: word,
    });
  }, [record, score.total, won, wordsPlayed, wordLength, dictionaryId, duration, word]);

  const stats = [
    { value: wordsPlayed, label: t("stat.words") },
    { value: cardsLeft, label: t("stat.cardsLeft") },
    { value: draws, label: t("stat.draws") },
    { value: rescues, label: t("stat.rescues") },
  ];
  // Only when it happened, so the grid stays a tidy 4 the rest of the time.
  if (swaps > 0) stats.push({ value: swaps, label: t("stat.swaps") });

  const penaltyLabel = [draws > 0 && t("word.draws"), rescues > 0 && t("word.rescues")]
    .filter(Boolean)
    .join(" & ");

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center font-mono">
      <p className="text-xs uppercase tracking-[0.3em] text-green-500">
        {won ? t("end.cleared") : t("end.timesUp")}
      </p>
      <h1
        className={`mt-3 text-4xl sm:text-5xl font-bold tracking-tight ${
          won ? `text-green-300 ${styles.glowPulse}` : "text-rose-400"
        }`}
      >
        {headline ?? (won ? t("end.win") : t("end.lose"))}
      </h1>

      <div className="mt-6 rounded-2xl border-2 border-green-400 bg-green-400/5 py-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-green-600">
          {t("end.score")}
        </p>
        <p className="mt-1 text-5xl font-bold tabular-nums text-green-50">
          {score.total.toLocaleString()}
        </p>
        <p className="mt-2 px-4 text-[11px] leading-snug text-green-700">
          {t("end.fromWords", { n: score.words.toLocaleString() })}
          {score.winBonus > 0 && ` · ${t("end.forClearing", { n: score.winBonus })}`}
          {score.timeBonus > 0 && ` · ${t("end.timeLeft", { n: score.timeBonus })}`}
          {score.penalties > 0 &&
            ` · ${t("end.penalties", { n: score.penalties, what: penaltyLabel })}`}
        </p>
      </div>

      <p className="mt-5 text-green-600">
        {t("end.finalWord")}{" "}
        <span className="font-bold text-green-50 uppercase tracking-widest">
          {word}
        </span>
      </p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-green-800 py-3">
            <p className="font-bold text-2xl text-green-50">{stat.value}</p>
            <p className="text-[11px] uppercase tracking-wide text-green-700 mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {record && (
        <div className="mt-10">
          <Leaderboard highlightLastRun />
        </div>
      )}

      <button
        onClick={onPlayAgain}
        className="mt-8 w-full rounded-xl bg-green-400 text-black font-bold text-lg py-4 hover:brightness-110 hover:shadow-[0_0_24px_rgba(74,222,128,0.5)] transition"
      >
        {playAgainLabel ?? t("end.playAgain")}
      </button>
      <Link
        href="/"
        className="mt-3 block w-full rounded-xl border border-green-800 text-green-400 font-bold text-sm py-3.5 hover:border-green-500 transition-colors"
      >
        {t("nav.backPortfolio")}
      </Link>
    </div>
  );
}
