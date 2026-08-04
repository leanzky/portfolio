"use client";

import type {
  PlayerPublicRow,
  PlayerRow,
  RoomRow,
} from "@/lib/scrabble-slam/multiplayer-types";
import { colorForSeat } from "@/lib/scrabble-slam/player-colors";
import { PlayerRoster } from "./PlayerRoster";
import { WordGrid } from "./WordGrid";
import { useT } from "./LanguageToggle";
import styles from "./game.module.css";

/**
 * Where you land once your clock runs out. The board stays live and every
 * hand is face up, since you can no longer act on what you learn.
 */
export function SpectatorView({
  room,
  players,
  hands,
  myPlayerId,
  now,
  onLeave,
}: {
  room: RoomRow;
  players: PlayerPublicRow[];
  hands: PlayerRow[];
  myPlayerId: string;
  now: number;
  onLeave: () => void;
}) {
  const t = useT();
  const bySeat = [...players].sort((a, b) => (a.seat ?? 99) - (b.seat ?? 99));
  const handFor = (id: string) => hands.find((h) => h.id === id)?.hand ?? [];

  return (
    <div className="min-h-svh flex flex-col gap-6 py-8">
      <div className="max-w-3xl mx-auto px-4 w-full text-center font-mono">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
          {t("spec.kicker")}
        </p>
        <h1 className={`mt-2 text-3xl font-bold text-amber-300 ${styles.glowPulse}`}>
          {t("spec.title")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-green-600">
          {t("spec.blurb")}
        </p>
      </div>

      <PlayerRoster room={room} players={players} myPlayerId={myPlayerId} now={now} />

      <WordGrid
        word={room.word ?? ""}
        now={now}
        feedback={null}
        hasArmedLetter={false}
        lastMoveSlot={room.last_move_slot}
        lastMoveColor={
          colorForSeat(
            players.find((p) => p.id === room.last_move_player_id)?.seat ?? null
          ).hex
        }
        onDropLetter={() => {}}
        onTapSlot={() => {}}
      />

      <div className="max-w-3xl mx-auto px-4 w-full font-mono">
        <p className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-green-700">
          {t("spec.hands")}
        </p>
        <div className="space-y-3">
          {bySeat.map((p) => {
            const color = colorForSeat(p.seat);
            const cards = handFor(p.id);
            return (
              <div
                key={p.id}
                className={`rounded-xl border px-3 py-2.5 ${
                  p.eliminated
                    ? "border-green-950 opacity-50"
                    : room.current_turn_player_id === p.id
                      ? `${color.border} ${color.bg}`
                      : "border-green-900"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-sm font-bold ${color.text}`}>
                    {p.name}
                    {p.id === myPlayerId && (
                      <span className="ml-2 text-[10px] text-green-700">
                        {t("wait.you")}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-green-700">
                    {p.eliminated ? t("spec.eliminated") : t("spec.stillPlaying")}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {cards.length === 0 ? (
                    <span className="text-[11px] text-green-800">—</span>
                  ) : (
                    cards.map((c) => (
                      <span
                        key={c.id}
                        className="flex h-8 w-7 items-center justify-center rounded-md border border-green-800 bg-[#08140a] text-sm font-bold text-green-100"
                      >
                        {/[a-z]/i.test(c.letter)
                          ? c.letter.toUpperCase()
                          : c.letter}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onLeave}
        className="mx-auto font-mono text-sm text-green-700 transition-colors hover:text-green-400"
      >
        {t("spec.leave")}
      </button>
    </div>
  );
}
