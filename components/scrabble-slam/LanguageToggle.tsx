"use client";

import { useSyncExternalStore } from "react";
import {
  getLangServerSnapshot,
  getLangSnapshot,
  LANGUAGES,
  setLang,
  subscribeLang,
  translate,
  type Lang,
} from "@/lib/scrabble-slam/i18n";

export function useLang(): Lang {
  return useSyncExternalStore(
    subscribeLang,
    getLangSnapshot,
    getLangServerSnapshot
  );
}

/** `t("key", { n: 3 })` bound to the current language. */
export function useT() {
  const lang = useLang();
  return (key: string, params?: Record<string, string | number>) =>
    translate(lang, key, params);
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const lang = useLang();

  return (
    <div
      className={`inline-flex overflow-hidden rounded-lg border border-green-800 font-mono ${className}`}
      role="group"
      aria-label={translate(lang, "lang.label")}
    >
      {LANGUAGES.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          className={`px-2.5 py-1 text-xs font-bold transition-colors ${
            lang === l.id
              ? "bg-green-400 text-black"
              : "text-green-600 hover:text-green-300"
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
