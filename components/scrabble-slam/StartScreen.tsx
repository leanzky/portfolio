"use client";

import { useState } from "react";
import {
  dictionaries,
  DictionaryId,
  WORD_LENGTHS,
  WordLength,
} from "@/lib/scrabble-slam/dictionary";
import { MAX_HAND } from "@/lib/scrabble-slam/engine";
import { Leaderboard } from "./Leaderboard";
import styles from "./game.module.css";

const DURATIONS = [
  { seconds: 120, label: "Casual", sub: "120s" },
  { seconds: 90, label: "Standard", sub: "90s" },
  { seconds: 60, label: "Blitz", sub: "60s" },
  { seconds: 0, label: "Endless", sub: "No timer" },
];

const LENGTH_BLURB: Record<WordLength, string> = {
  4: "Easiest",
  5: "Balanced",
  6: "Hardest",
};

export function StartScreen({
  onStart,
  onExit,
}: {
  onStart: (
    dictionaryId: DictionaryId,
    wordLength: WordLength,
    duration: number
  ) => void;
  onExit?: () => void;
}) {
  const [dictionaryId, setDictionaryId] = useState<DictionaryId>("standard");
  const [wordLength, setWordLength] = useState<WordLength>(4);
  const [duration, setDuration] = useState(90);

  return (
    <div className="max-w-xl mx-auto px-6 py-12 text-center font-mono">
      <p className="text-xs uppercase tracking-[0.3em] text-green-500">
        Word Blitz
      </p>
      <h1
        className={`mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-green-50 ${styles.glowPulse}`}
      >
        Scrabble Slam!
      </h1>
      <p className="mt-4 text-green-600 leading-relaxed">
        Change one letter of the word at a time to make a new real word.
        Empty your hand before the clock runs out.
      </p>

      <div className="mt-10 text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2.5">
          Word length
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {WORD_LENGTHS.map((len) => (
            <button
              key={len}
              onClick={() => setWordLength(len)}
              className={`rounded-xl border-2 py-4 transition-colors ${
                wordLength === len
                  ? "border-green-400 bg-green-400/10"
                  : "border-green-900 hover:border-green-700"
              }`}
            >
              <p className="font-bold text-2xl text-green-50">{len}</p>
              <p className="text-[11px] text-green-600 mt-0.5">
                {LENGTH_BLURB[len]}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2.5">
          Dictionary
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {Object.values(dictionaries).map((dict) => (
            <button
              key={dict.id}
              onClick={() => setDictionaryId(dict.id)}
              className={`rounded-xl border-2 p-3 text-left transition-colors ${
                dictionaryId === dict.id
                  ? "border-green-400 bg-green-400/10"
                  : "border-green-900 hover:border-green-700"
              }`}
            >
              <p className="font-bold text-sm text-green-50">{dict.label}</p>
              <p className="mt-1 text-xs text-green-600 leading-snug">
                {dict.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2.5">
          Timer
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DURATIONS.map((d) => (
            <button
              key={d.seconds}
              onClick={() => setDuration(d.seconds)}
              className={`rounded-xl border-2 py-3 transition-colors ${
                duration === d.seconds
                  ? "border-lime-400 bg-lime-400/10"
                  : "border-green-900 hover:border-green-700"
              }`}
            >
              <p className="font-bold text-sm text-green-50">{d.label}</p>
              <p className="text-xs text-green-600">{d.sub}</p>
            </button>
          ))}
        </div>
        {duration === 0 && (
          <p className="mt-2.5 rounded-lg border border-lime-900 bg-lime-400/5 px-3 py-2 text-[11px] leading-relaxed text-lime-200">
            <span className="font-bold">Endless rules:</span> no clock, so the
            only way to finish is to get down to zero cards. Every card you
            draw makes that further away, and Freeze and Swap are off (both
            are paid for in seconds).
          </p>
        )}
      </div>

      <button
        onClick={() => onStart(dictionaryId, wordLength, duration)}
        className="mt-10 w-full rounded-xl bg-green-400 text-black font-bold text-lg py-4 hover:brightness-110 hover:shadow-[0_0_24px_rgba(74,222,128,0.5)] transition"
      >
        Start Round
      </button>

      <p className="mt-6 text-xs text-green-700 leading-relaxed">
        Drag a card onto a letter slot, or tap the card then tap the slot.
        Power-ups sit on the side and recharge as you make words. You can
        shuffle your hand any time, and hold at most {MAX_HAND} cards. Run out
        of legal moves and the hand reshuffles itself, but you take 2 extra
        cards for it.
      </p>

      <div className="mt-10">
        <Leaderboard showClear />
      </div>

      {onExit && (
        <button
          onClick={onExit}
          className="mt-6 text-green-700 hover:text-green-400 text-sm transition-colors"
        >
          ← Back to game modes
        </button>
      )}
    </div>
  );
}
