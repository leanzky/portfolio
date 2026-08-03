"use client";

import { dictionaries, DictionaryId } from "@/lib/scrabble-slam/dictionary";
import styles from "./game.module.css";

export function Hud({
  dictionaryId,
  timeLeft,
  duration,
  cardsLeft,
  canSwap,
  muted,
  onDraw,
  onSwap,
  onToggleMute,
  onQuit,
}: {
  dictionaryId: DictionaryId;
  timeLeft: number;
  duration: number;
  cardsLeft: number;
  canSwap: boolean;
  muted: boolean;
  onDraw: () => void;
  onSwap: () => void;
  onToggleMute: () => void;
  onQuit: () => void;
}) {
  const urgent = timeLeft <= 10;
  const pct = Math.max(0, Math.min(1, timeLeft / duration));

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <button
          onClick={onQuit}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Quit
        </button>
        <span className="font-mono uppercase tracking-widest text-slate-400 text-xs">
          {dictionaries[dictionaryId].label}
        </span>
        <button
          onClick={onToggleMute}
          className="text-slate-400 hover:text-slate-200 transition-colors"
          aria-label={muted ? "Unmute sound" : "Mute sound"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div
          className={`font-display font-bold text-2xl tabular-nums ${
            urgent ? `text-rose-400 ${styles.timerUrgent}` : "text-slate-100"
          }`}
        >
          {Math.ceil(timeLeft)}s
        </div>
        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-200 ease-linear ${
              urgent ? "bg-rose-500" : "bg-teal-400"
            }`}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <div className="font-display font-bold text-lg text-amber-300 whitespace-nowrap">
          {cardsLeft} left
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={onDraw}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-300 hover:border-slate-400 hover:text-white transition-colors"
          title="Stuck? Draw a fresh letter card (grows your hand by 1)"
        >
          Draw card
        </button>
        <button
          onClick={onSwap}
          disabled={!canSwap}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-300 hover:border-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Select a card first, then swap it for a new one (costs 3 seconds)"
        >
          Swap selected (−3s)
        </button>
      </div>
    </div>
  );
}
