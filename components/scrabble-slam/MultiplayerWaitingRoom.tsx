"use client";

import { useState } from "react";
import type { PlayerPublicRow, RoomRow } from "@/lib/scrabble-slam/multiplayer-types";
import { startGame } from "@/lib/scrabble-slam/multiplayer-actions";

export function MultiplayerWaitingRoom({
  room,
  players,
  myPlayerId,
  onLeave,
}: {
  room: RoomRow;
  players: PlayerPublicRow[];
  myPlayerId: string;
  onLeave: () => void;
}) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const me = players.find((p) => p.id === myPlayerId);

  async function handleStart() {
    setStarting(true);
    setError(null);
    const result = await startGame(room.id);
    setStarting(false);
    if (!result.ok) {
      setError(
        result.reason === "need_more_players"
          ? "Waiting on at least one more player."
          : (result.reason ?? "Couldn't start the game.")
      );
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-teal-400">
        Room code
      </p>
      <p className="mt-2 font-display text-5xl font-bold tracking-[0.15em] text-white">
        {room.code}
      </p>
      <p className="mt-3 text-slate-400">Share this code with your friend.</p>

      <div className="mt-8 space-y-2">
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-slate-700 px-4 py-3"
          >
            <span className="font-bold text-white">
              {p.name}
              {p.id === myPlayerId && (
                <span className="ml-2 text-xs text-slate-500">(you)</span>
              )}
            </span>
            {p.is_host && (
              <span className="text-[11px] uppercase tracking-wide text-amber-300 font-bold">
                Host
              </span>
            )}
          </div>
        ))}
        {players.length < 2 && (
          <div className="rounded-xl border border-dashed border-slate-700 px-4 py-3 text-slate-500 text-sm">
            Waiting for another player to join…
          </div>
        )}
      </div>

      {me?.is_host ? (
        <button
          onClick={handleStart}
          disabled={starting || players.length < 2}
          className="mt-8 w-full rounded-xl bg-teal-400 text-slate-950 font-display font-bold text-lg py-4 hover:brightness-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {starting ? "Starting…" : "Start game"}
        </button>
      ) : (
        <p className="mt-8 text-slate-400">Waiting for the host to start the game…</p>
      )}
      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

      <button
        onClick={onLeave}
        className="mt-6 text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        ← Leave room
      </button>
    </div>
  );
}
