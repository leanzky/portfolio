"use client";

import { useState } from "react";
import Link from "next/link";
import { WordBlitzGame } from "./WordBlitzGame";
import { MultiplayerRoot } from "./MultiplayerRoot";

const multiplayerConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function ModeSelect({ onPick }: { onPick: (mode: "solo" | "multiplayer") => void }) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-teal-400">
        Word Blitz
      </p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-white">
        Scrabble Slam!
      </h1>
      <p className="mt-4 max-w-md text-slate-400 leading-relaxed">
        Change one letter of the word at a time to make a new real word.
        Play solo against the clock, or race a friend live.
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <button
          onClick={() => onPick("solo")}
          className="rounded-2xl border-2 border-teal-400 bg-teal-400/10 p-6 text-left hover:brightness-110 transition"
        >
          <p className="font-display font-bold text-xl text-white">Play Solo</p>
          <p className="mt-1.5 text-sm text-slate-400">
            Race the timer. Available anytime, no one else needed.
          </p>
        </button>
        <button
          onClick={() => multiplayerConfigured && onPick("multiplayer")}
          disabled={!multiplayerConfigured}
          className="rounded-2xl border-2 border-amber-400 bg-amber-400/10 p-6 text-left hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <p className="font-display font-bold text-xl text-white">
            Play with a Friend
          </p>
          <p className="mt-1.5 text-sm text-slate-400">
            {multiplayerConfigured
              ? "Create a room, share the code, race live."
              : "Multiplayer isn't configured on this deployment yet."}
          </p>
        </button>
      </div>

      <Link
        href="/"
        className="mt-10 text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        ← Back to portfolio
      </Link>
    </div>
  );
}

export function ScrabbleSlamApp() {
  const [mode, setMode] = useState<"select" | "solo" | "multiplayer">("select");

  if (mode === "solo") return <WordBlitzGame onExit={() => setMode("select")} />;
  if (mode === "multiplayer") {
    return <MultiplayerRoot onExit={() => setMode("select")} />;
  }
  return <ModeSelect onPick={setMode} />;
}
