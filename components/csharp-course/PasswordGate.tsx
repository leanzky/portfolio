"use client";

import { useState } from "react";
import Link from "next/link";
import { isCorrectPassphrase, unlock } from "@/lib/csharp-course/gate";
import styles from "./course.module.css";

/**
 * The lock screen. Wrong answers shake rather than navigate away, and the
 * hint is deliberately obvious to anyone who knows why this page exists.
 */
export function PasswordGate() {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

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
        className={`w-full max-w-md rounded-2xl border border-violet-500/25 bg-[#15121f]/80 p-8 shadow-[0_0_60px_rgba(124,58,237,0.15)] backdrop-blur ${
          error ? styles.shake : ""
        }`}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-violet-400/80">
          Private study track
        </p>
        <h1 className="mt-3 font-mono text-2xl font-bold text-violet-50">
          C# &amp; .NET Career Track
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-violet-200/60">
          This one is for me, not for the portfolio. Say the magic words.
        </p>

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
            className={`w-full rounded-xl border bg-[#0d0b14] px-4 py-3 font-mono text-sm text-violet-100 outline-none transition placeholder:text-violet-300/25 ${
              error
                ? "border-rose-500/70 focus:border-rose-400"
                : "border-violet-500/30 focus:border-violet-400"
            }`}
          />

          <button
            type="submit"
            className="mt-3 w-full rounded-xl border border-violet-400/40 bg-violet-500/15 px-4 py-3 font-mono text-sm font-semibold text-violet-100 transition hover:border-violet-300 hover:bg-violet-500/25"
          >
            Unlock
          </button>
        </form>

        <div className="mt-5 min-h-[2.5rem] text-sm" aria-live="polite">
          {error && <p className="text-rose-300/90">Not it. Try again.</p>}
          {attempts >= 2 && !error && (
            <p className="text-violet-300/50">
              Hint: it is what you would say to a hiring manager, no spaces.
            </p>
          )}
        </div>

        <Link
          href="/"
          className="mt-2 inline-block font-mono text-xs text-violet-400/50 transition-colors hover:text-violet-300"
        >
          &larr; back to portfolio
        </Link>
      </div>
    </div>
  );
}
