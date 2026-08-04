"use client";

import { useState } from "react";
import type { PlayerPublicRow, RoomRow } from "@/lib/scrabble-slam/multiplayer-types";
import { startGame } from "@/lib/scrabble-slam/multiplayer-actions";
import { useT } from "./LanguageToggle";

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
  const t = useT();
  const me = players.find((p) => p.id === myPlayerId);

  async function handleStart() {
    setStarting(true);
    setError(null);
    const result = await startGame(room.id);
    setStarting(false);
    if (!result.ok) {
      setError(
        result.reason === "need_more_players"
          ? t("wait.needMore")
          : (result.reason ?? "Couldn't start the game.")
      );
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center font-mono">
      <p className="text-xs uppercase tracking-[0.3em] text-green-500">
        {t("wait.roomCode")}
      </p>
      <p className="mt-2 text-5xl font-bold tracking-[0.15em] text-green-50">
        {room.code}
      </p>
      <p className="mt-3 text-green-600">{t("wait.share")}</p>
      <p className="mt-1 text-[11px] text-green-800">{t("wait.turnOrder")}</p>

      <div className="mt-8 space-y-2">
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-green-800 px-4 py-3"
          >
            <span className="font-bold text-green-50">
              {p.name}
              {p.id === myPlayerId && (
                <span className="ml-2 text-xs text-green-700">{t("wait.you")}</span>
              )}
            </span>
            {p.is_host && (
              <span className="text-[11px] uppercase tracking-wide text-lime-300 font-bold">
                {t("wait.host")}
              </span>
            )}
          </div>
        ))}
        {players.length < 2 && (
          <div className="rounded-xl border border-dashed border-green-800 px-4 py-3 text-green-700 text-sm">
            {t("wait.waiting")}
          </div>
        )}
      </div>

      {me?.is_host ? (
        <button
          onClick={handleStart}
          disabled={starting || players.length < 2}
          className="mt-8 w-full rounded-xl bg-green-400 text-black font-bold text-lg py-4 hover:brightness-110 hover:shadow-[0_0_24px_rgba(74,222,128,0.5)] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {starting ? t("wait.starting") : t("wait.start")}
        </button>
      ) : (
        <p className="mt-8 text-green-600">{t("wait.hostWillStart")}</p>
      )}
      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

      <button
        onClick={onLeave}
        className="mt-6 text-green-700 hover:text-green-400 text-sm transition-colors"
      >
        {t("wait.leave")}
      </button>
    </div>
  );
}
