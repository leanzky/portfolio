"use client";

import { useState } from "react";
import { dictionaries, DictionaryId } from "@/lib/scrabble-slam/dictionary";
import styles from "./game.module.css";

const DURATIONS = [
  { seconds: 120, label: "Casual", sub: "120s" },
  { seconds: 90, label: "Standard", sub: "90s" },
  { seconds: 60, label: "Blitz", sub: "60s" },
];

export function StartScreen({
  onStart,
  onExit,
}: {
  onStart: (dictionaryId: DictionaryId, duration: number) => void;
  onExit?: () => void;
}) {
  const [dictionaryId, setDictionaryId] = useState<DictionaryId>("standard");
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
          Dictionary
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
        <div className="grid grid-cols-3 gap-2.5">
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
      </div>

      <button
        onClick={() => onStart(dictionaryId, duration)}
        className="mt-10 w-full rounded-xl bg-green-400 text-black font-bold text-lg py-4 hover:brightness-110 hover:shadow-[0_0_24px_rgba(74,222,128,0.5)] transition"
      >
        Start Round
      </button>

      <p className="mt-6 text-xs text-green-700 leading-relaxed">
        On desktop, drag a card onto a letter slot. On phone or tablet, tap a
        card then tap the slot. Freeze and Chaos cards play instantly on tap.
      </p>

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
