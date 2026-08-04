"use client";

import { dictionaries, DictionaryId } from "@/lib/scrabble-slam/dictionary";
import { MAX_HAND } from "@/lib/scrabble-slam/engine";
import styles from "./game.module.css";

function formatElapsed(seconds: number): string {
  const total = Math.floor(Math.max(0, seconds));
  const mins = Math.floor(total / 60);
  return `${mins}:${String(total % 60).padStart(2, "0")}`;
}

export function Hud({
  dictionaryId,
  endless,
  timeLeft,
  elapsed,
  duration,
  cardsLeft,
  maxHand,
  wordsPlayed,
  canSwap,
  muted,
  onDraw,
  onSwap,
  onShuffle,
  onToggleMute,
  onQuit,
}: {
  dictionaryId: DictionaryId;
  endless: boolean;
  timeLeft: number;
  elapsed: number;
  duration: number;
  cardsLeft: number;
  /** Hand ceiling. Omitted means uncapped (multiplayer, where the server
      owns the hand and enforces no limit). */
  maxHand?: number;
  wordsPlayed: number;
  canSwap: boolean;
  muted: boolean;
  onDraw: () => void;
  onSwap: () => void;
  onShuffle?: () => void;
  onToggleMute: () => void;
  onQuit: () => void;
}) {
  const urgent = !endless && timeLeft <= 10;
  const pct = endless ? 1 : Math.max(0, Math.min(1, timeLeft / duration));
  const handFull = maxHand !== undefined && cardsLeft >= maxHand;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 font-mono">
      <div className="flex items-center justify-between gap-3 text-sm">
        <button
          onClick={onQuit}
          className="text-green-700 hover:text-green-300 transition-colors"
        >
          ← Quit
        </button>
        <span className="uppercase tracking-widest text-green-600 text-xs">
          {dictionaries[dictionaryId].label}
          {endless && <span className="text-lime-400"> · Endless</span>}
        </span>
        <button
          onClick={onToggleMute}
          className="text-green-700 hover:text-green-300 transition-colors"
          aria-label={muted ? "Unmute sound" : "Mute sound"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-4">
        {endless ? (
          <div
            className="font-bold text-2xl tabular-nums text-green-50"
            title="No timer in Endless — this is how long you've been playing"
          >
            {formatElapsed(elapsed)}
          </div>
        ) : (
          <div
            className={`font-bold text-2xl tabular-nums ${
              urgent ? `text-rose-400 ${styles.timerUrgent}` : "text-green-50"
            }`}
          >
            {Math.ceil(timeLeft)}s
          </div>
        )}

        {endless ? (
          // No clock to drain, so the bar shows progress toward the real
          // win condition instead: emptying the hand.
          <div className="flex-1 h-2 rounded-full bg-green-950 overflow-hidden">
            <div
              className="h-full rounded-full bg-lime-400 transition-[width] duration-200 ease-linear"
              style={{
                width: `${Math.max(0, 1 - cardsLeft / (maxHand ?? MAX_HAND)) * 100}%`,
              }}
            />
          </div>
        ) : (
          <div className="flex-1 h-2 rounded-full bg-green-950 overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-200 ease-linear ${
                urgent ? "bg-rose-500" : "bg-green-400"
              }`}
              style={{ width: `${pct * 100}%` }}
            />
          </div>
        )}

        <div className="font-bold text-lg text-lime-300 whitespace-nowrap">
          {cardsLeft} left
        </div>
      </div>

      <div className="mt-2 text-center text-[11px] uppercase tracking-wide text-green-800">
        {wordsPlayed} word{wordsPlayed === 1 ? "" : "s"} played
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
        {onShuffle && (
          <button
            onClick={onShuffle}
            className="rounded-lg border border-green-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-green-400 hover:border-green-500 hover:text-green-200 transition-colors"
            title="Reorder your hand. Same cards, free, as often as you like."
          >
            ⇄ Shuffle
          </button>
        )}
        <button
          onClick={onDraw}
          disabled={handFull}
          className="rounded-lg border border-green-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-green-400 hover:border-green-500 hover:text-green-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title={
            handFull
              ? `Your hand is full at ${maxHand} cards`
              : "Draw a fresh letter card. Grows your hand by 1, and you win by emptying it."
          }
        >
          Draw card
          {maxHand !== undefined && ` ${cardsLeft}/${maxHand}`}
        </button>
        {!endless && (
          <button
            onClick={onSwap}
            disabled={!canSwap}
            className="rounded-lg border border-green-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-green-400 hover:border-green-500 hover:text-green-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Select a card first, then swap it for a new one (costs 3 seconds)"
          >
            Swap selected (−3s)
          </button>
        )}
      </div>
    </div>
  );
}
