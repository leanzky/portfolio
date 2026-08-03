"use client";

import { useState } from "react";
import Link from "next/link";
import { WordBlitzGame } from "./WordBlitzGame";
import { MultiplayerRoot } from "./MultiplayerRoot";
import styles from "./game.module.css";

const multiplayerConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function ModeSelect({ onPick }: { onPick: (mode: "solo" | "multiplayer") => void }) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-green-500">
        Word Blitz
      </p>
      <h1
        className={`mt-3 font-mono text-4xl sm:text-5xl font-bold tracking-tight text-green-50 ${styles.glowPulse}`}
      >
        Scrabble Slam!
        <span className={styles.cursorBlink}>_</span>
      </h1>
      <p className="mt-4 max-w-md text-green-600 leading-relaxed">
        Change one letter of the word at a time to make a new real word.
        Play solo against the clock, or race a friend live.
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <button
          onClick={() => onPick("solo")}
          className="rounded-2xl border-2 border-green-400 bg-green-400/10 p-6 text-left hover:brightness-125 hover:shadow-[0_0_20px_rgba(74,222,128,0.35)] transition"
        >
          <p className="font-mono font-bold text-xl text-green-50">Play Solo</p>
          <p className="mt-1.5 text-sm text-green-600">
            Race the timer. Available anytime, no one else needed.
          </p>
        </button>
        <button
          onClick={() => multiplayerConfigured && onPick("multiplayer")}
          disabled={!multiplayerConfigured}
          className="rounded-2xl border-2 border-lime-400 bg-lime-400/10 p-6 text-left hover:brightness-125 hover:shadow-[0_0_20px_rgba(163,230,53,0.35)] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          <p className="font-mono font-bold text-xl text-green-50">
            Play with a Friend
          </p>
          <p className="mt-1.5 text-sm text-green-600">
            {multiplayerConfigured
              ? "Create a room, share the code, race live."
              : "Multiplayer isn't configured on this deployment yet."}
          </p>
        </button>
      </div>

      <Link
        href="/"
        className="mt-10 text-green-700 hover:text-green-400 text-sm transition-colors"
      >
        ← Back to portfolio
      </Link>
    </div>
  );
}

export function ScrabbleSlamApp() {
  const [mode, setMode] = useState<"select" | "solo" | "multiplayer">("select");

  return (
    <>
      <div className={styles.scanlines} aria-hidden />
      {mode === "solo" && <WordBlitzGame onExit={() => setMode("select")} />}
      {mode === "multiplayer" && (
        <MultiplayerRoot onExit={() => setMode("select")} />
      )}
      {mode === "select" && <ModeSelect onPick={setMode} />}
    </>
  );
}
