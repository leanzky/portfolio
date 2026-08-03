"use client";

import Link from "next/link";
import type { GameStatus } from "@/lib/scrabble-slam/reducer";

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
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-teal-400">
        {won ? "Hand cleared" : "Time's up"}
      </p>
      <h1
        className={`mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight ${
          won ? "text-teal-300" : "text-rose-400"
        }`}
      >
        {won ? "You win!" : "Out of time"}
      </h1>
      <p className="mt-4 text-slate-400">
        Final word:{" "}
        <span className="font-display font-bold text-white uppercase tracking-widest">
          {word}
        </span>
      </p>

      <div className="mt-8 grid grid-cols-3 gap-2.5 text-center">
        <div className="rounded-xl border border-slate-700 py-3">
          <p className="font-display font-bold text-2xl text-white">
            {cardsLeft}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mt-1">
            Cards left
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 py-3">
          <p className="font-display font-bold text-2xl text-white">{draws}</p>
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mt-1">
            Draws
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 py-3">
          <p className="font-display font-bold text-2xl text-white">{swaps}</p>
          <p className="text-[11px] uppercase tracking-wide text-slate-500 mt-1">
            Swaps
          </p>
        </div>
      </div>

      <button
        onClick={onPlayAgain}
        className="mt-10 w-full rounded-xl bg-teal-400 text-slate-950 font-display font-bold text-lg py-4 hover:brightness-95 transition"
      >
        Play again
      </button>
      <Link
        href="/"
        className="mt-3 block w-full rounded-xl border border-slate-700 text-slate-300 font-bold text-sm py-3.5 hover:border-slate-500 transition-colors"
      >
        ← Back to portfolio
      </Link>
    </div>
  );
}
