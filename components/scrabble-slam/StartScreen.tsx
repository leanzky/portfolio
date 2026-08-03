"use client";

import { useState } from "react";
import { dictionaries, DictionaryId } from "@/lib/scrabble-slam/dictionary";

const DURATIONS = [
  { seconds: 120, label: "Casual", sub: "120s" },
  { seconds: 90, label: "Standard", sub: "90s" },
  { seconds: 60, label: "Blitz", sub: "60s" },
];

export function StartScreen({
  onStart,
}: {
  onStart: (dictionaryId: DictionaryId, duration: number) => void;
}) {
  const [dictionaryId, setDictionaryId] = useState<DictionaryId>("standard");
  const [duration, setDuration] = useState(90);

  return (
    <div className="max-w-xl mx-auto px-6 py-12 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-teal-400">
        Word Blitz
      </p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-white">
        Scrabble Slam!
      </h1>
      <p className="mt-4 text-slate-400 leading-relaxed">
        Change one letter of the word at a time to make a new real word.
        Empty your hand before the clock runs out.
      </p>

      <div className="mt-10 text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2.5">
          Dictionary
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {Object.values(dictionaries).map((dict) => (
            <button
              key={dict.id}
              onClick={() => setDictionaryId(dict.id)}
              className={`rounded-xl border-2 p-3 text-left transition-colors ${
                dictionaryId === dict.id
                  ? "border-teal-400 bg-teal-400/10"
                  : "border-slate-700 hover:border-slate-500"
              }`}
            >
              <p className="font-bold text-sm text-white">{dict.label}</p>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                {dict.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2.5">
          Timer
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {DURATIONS.map((d) => (
            <button
              key={d.seconds}
              onClick={() => setDuration(d.seconds)}
              className={`rounded-xl border-2 py-3 transition-colors ${
                duration === d.seconds
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-slate-700 hover:border-slate-500"
              }`}
            >
              <p className="font-bold text-sm text-white">{d.label}</p>
              <p className="text-xs text-slate-400">{d.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onStart(dictionaryId, duration)}
        className="mt-10 w-full rounded-xl bg-teal-400 text-slate-950 font-display font-bold text-lg py-4 hover:brightness-95 transition"
      >
        Start Round
      </button>

      <p className="mt-6 text-xs text-slate-500 leading-relaxed">
        On desktop, drag a card onto a letter slot. On phone or tablet, tap a
        card then tap the slot. Freeze and Chaos cards play instantly on tap.
      </p>
    </div>
  );
}
