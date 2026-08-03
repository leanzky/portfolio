"use client";

import Link from "next/link";
import type { GameStatus } from "@/lib/scrabble-slam/reducer";
import styles from "./game.module.css";

export function EndScreen({
  status,
  word,
  cardsLeft,
  draws,
  swaps,
  onPlayAgain,
}: {
  status: GameStatus;
  word: string;
  cardsLeft: number;
  draws: number;
  swaps: number;
  onPlayAgain: () => void;
}) {
  const won = status === "won";

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center font-mono">
      <p className="text-xs uppercase tracking-[0.3em] text-green-500">
        {won ? "Hand cleared" : "Time's up"}
      </p>
      <h1
        className={`mt-3 text-4xl sm:text-5xl font-bold tracking-tight ${
          won ? `text-green-300 ${styles.glowPulse}` : "text-rose-400"
        }`}
      >
        {won ? "You win!" : "Out of time"}
      </h1>
      <p className="mt-4 text-green-600">
        Final word:{" "}
        <span className="font-bold text-green-50 uppercase tracking-widest">
          {word}
        </span>
      </p>

      <div className="mt-8 grid grid-cols-3 gap-2.5 text-center">
        <div className="rounded-xl border border-green-800 py-3">
          <p className="font-bold text-2xl text-green-50">{cardsLeft}</p>
          <p className="text-[11px] uppercase tracking-wide text-green-700 mt-1">
            Cards left
          </p>
        </div>
        <div className="rounded-xl border border-green-800 py-3">
          <p className="font-bold text-2xl text-green-50">{draws}</p>
          <p className="text-[11px] uppercase tracking-wide text-green-700 mt-1">
            Draws
          </p>
        </div>
        <div className="rounded-xl border border-green-800 py-3">
          <p className="font-bold text-2xl text-green-50">{swaps}</p>
          <p className="text-[11px] uppercase tracking-wide text-green-700 mt-1">
            Swaps
          </p>
        </div>
      </div>

      <button
        onClick={onPlayAgain}
        className="mt-10 w-full rounded-xl bg-green-400 text-black font-bold text-lg py-4 hover:brightness-110 hover:shadow-[0_0_24px_rgba(74,222,128,0.5)] transition"
      >
        Play again
      </button>
      <Link
        href="/"
        className="mt-3 block w-full rounded-xl border border-green-800 text-green-400 font-bold text-sm py-3.5 hover:border-green-500 transition-colors"
      >
        ← Back to portfolio
      </Link>
    </div>
  );
}
