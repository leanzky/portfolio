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
import { useT } from "./LanguageToggle";
import styles from "./game.module.css";

const DURATIONS = [
  { seconds: 120, key: "timer.casual", sub: "120s" },
  { seconds: 90, key: "timer.standard", sub: "90s" },
  { seconds: 60, key: "timer.blitz", sub: "60s" },
  { seconds: 0, key: "timer.endless", sub: "timer.noTimer" },
];

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
  const t = useT();

  return (
    <div className="max-w-xl mx-auto px-6 py-12 text-center font-mono">
      <p className="text-xs uppercase tracking-[0.3em] text-green-500">
        {t("app.kicker")}
      </p>
      <h1
        className={`mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-green-50 ${styles.glowPulse}`}
      >
        {t("app.title")}
      </h1>
      <p className="mt-4 text-green-600 leading-relaxed">
        {t("start.blurb")}
      </p>

      <div className="mt-10 text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2.5">
          {t("start.wordLength")}
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
                {t(`length.${len}`)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2.5">
          {t("start.dictionary")}
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
              <p className="font-bold text-sm text-green-50">{t(dict.label)}</p>
              <p className="mt-1 text-xs text-green-600 leading-snug">
                {t(dict.description)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2.5">
          {t("start.timer")}
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
              <p className="font-bold text-sm text-green-50">{t(d.key)}</p>
              <p className="text-xs text-green-600">
                {d.sub.includes(".") ? t(d.sub) : d.sub}
              </p>
            </button>
          ))}
        </div>
        {duration === 0 && (
          <p className="mt-2.5 rounded-lg border border-lime-900 bg-lime-400/5 px-3 py-2 text-[11px] leading-relaxed text-lime-200">
            {t("endless.rules")}
          </p>
        )}
      </div>

      <button
        onClick={() => onStart(dictionaryId, wordLength, duration)}
        className="mt-10 w-full rounded-xl bg-green-400 text-black font-bold text-lg py-4 hover:brightness-110 hover:shadow-[0_0_24px_rgba(74,222,128,0.5)] transition"
      >
        {t("start.begin")}
      </button>

      <p className="mt-6 text-xs text-green-700 leading-relaxed">
        {t("start.help", { max: MAX_HAND })}
      </p>

      <div className="mt-10">
        <Leaderboard showClear />
      </div>

      {onExit && (
        <button
          onClick={onExit}
          className="mt-6 text-green-700 hover:text-green-400 text-sm transition-colors"
        >
          {t("nav.backModes")}
        </button>
      )}
    </div>
  );
}
