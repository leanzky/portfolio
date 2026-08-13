"use client";

import { useState } from "react";
import Link from "next/link";
import { isCorrectPassphrase, unlock } from "@/lib/private-gate";
import styles from "./gate.module.css";

/** Each gated page keeps its own colour so the lock screen still looks like
    the page behind it. */
export type GateTheme = "violet" | "gold";

const THEMES: Record<
  GateTheme,
  {
    card: string;
    kicker: string;
    heading: string;
    body: string;
    input: string;
    button: string;
    hint: string;
    back: string;
  }
> = {
  violet: {
    card: "border-violet-500/25 bg-[#15121f]/80 shadow-[0_0_60px_rgba(124,58,237,0.15)]",
    kicker: "text-violet-400/80",
    heading: "text-violet-50",
    body: "text-violet-200/60",
    input:
      "border-violet-500/30 bg-[#0d0b14] text-violet-100 placeholder:text-violet-300/25 focus:border-violet-400",
    button:
      "border-violet-400/40 bg-violet-500/15 text-violet-100 hover:border-violet-300 hover:bg-violet-500/25",
    hint: "text-violet-300/50",
    back: "text-violet-400/50 hover:text-violet-300",
  },
  gold: {
    card: "border-amber-400/25 bg-[#0f1428]/85 shadow-[0_0_60px_rgba(245,196,81,0.12)]",
    kicker: "text-amber-400/80",
    heading: "text-slate-50",
    body: "text-slate-200/60",
    input:
      "border-slate-400/25 bg-[#0a0e1c] text-slate-100 placeholder:text-slate-500/40 focus:border-amber-400/60",
    button:
      "border-amber-400/40 bg-amber-400/10 text-amber-100 hover:border-amber-300 hover:bg-amber-400/20",
    hint: "text-slate-400/50",
    back: "text-slate-400/50 hover:text-amber-300",
  },
};

/**
 * The lock screen. Wrong answers shake rather than navigate away, and the
 * hint appears after two failures — obvious to anyone who should be here.
 */
export function PassphraseGate({
  theme,
  kicker,
  title,
  blurb,
}: {
  theme: GateTheme;
  kicker: string;
  title: string;
  blurb: string;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const t = THEMES[theme];

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (isCorrectPassphrase(value)) {
      unlock();
      return;
    }

    setError(true);
    setAttempts((n) => n + 1);
    setValue("");
    window.setTimeout(() => setError(false), 600);
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-16">
      <div
        className={`w-full max-w-md rounded-2xl border p-8 backdrop-blur ${t.card} ${
          error ? styles.shake : ""
        }`}
      >
        <p className={`font-mono text-[11px] uppercase tracking-[0.3em] ${t.kicker}`}>{kicker}</p>
        <h1 className={`mt-3 font-mono text-2xl font-bold ${t.heading}`}>{title}</h1>
        <p className={`mt-3 text-sm leading-relaxed ${t.body}`}>{blurb}</p>

        <form onSubmit={submit} className="mt-7">
          <label htmlFor="passphrase" className="sr-only">
            Passphrase
          </label>
          <input
            id="passphrase"
            type="password"
            value={value}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setValue(event.target.value)}
            placeholder="passphrase"
            aria-invalid={error}
            className={`w-full rounded-xl border px-4 py-3 font-mono text-sm outline-none transition ${
              error ? "border-rose-500/70 focus:border-rose-400" : t.input
            }`}
          />

          <button
            type="submit"
            className={`mt-3 w-full rounded-xl border px-4 py-3 font-mono text-sm font-semibold transition ${t.button}`}
          >
            Unlock
          </button>
        </form>

        <div className="mt-5 min-h-[2.5rem] text-sm" aria-live="polite">
          {error && <p className="text-rose-300/90">Not it. Try again.</p>}
          {attempts >= 2 && !error && (
            <p className={t.hint}>
              Hint: it is what you would say to a hiring manager, no spaces.
            </p>
          )}
        </div>

        <Link href="/" className={`mt-2 inline-block font-mono text-xs transition-colors ${t.back}`}>
          &larr; back to portfolio
        </Link>
      </div>
    </div>
  );
}
