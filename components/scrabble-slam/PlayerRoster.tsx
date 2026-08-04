"use client";

import type { PlayerPublicRow, RoomRow } from "@/lib/scrabble-slam/multiplayer-types";
import { colorForSeat } from "@/lib/scrabble-slam/player-colors";
import { useT } from "./LanguageToggle";
import styles from "./game.module.css";

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(total / 60);
  return mins > 0 ? `${mins}:${String(total % 60).padStart(2, "0")}` : `${total}s`;
}

/**
 * Everyone in the room, in turn order. The active player's card lights up in
 * their own colour, and their clock is the only one moving — the rest are
 * literally paused, not just visually dimmed.
 */
export function PlayerRoster({
  room,
  players,
  myPlayerId,
  now,
}: {
  room: RoomRow;
  players: PlayerPublicRow[];
  myPlayerId: string;
  now: number;
}) {
  const t = useT();
  const ordered = [...players].sort(
    (a, b) => (a.seat ?? 99) - (b.seat ?? 99) || a.joined_at.localeCompare(b.joined_at)
  );

  const turnStarted = room.turn_started_at
    ? new Date(room.turn_started_at).getTime()
    : null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 font-mono">
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-green-700">
        {t("roster.title")}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {ordered.map((p) => {
          const color = colorForSeat(p.seat);
          const active = room.current_turn_player_id === p.id;
          const out = p.eliminated;

          // Only the active player's clock is actually running; everyone
          // else's is exactly what they banked when their turn ended.
          const live =
            p.time_left_ms == null
              ? null
              : active && turnStarted
                ? Math.max(0, p.time_left_ms - (now - turnStarted))
                : p.time_left_ms;
          const urgent = live !== null && live <= 10000 && !out;

          return (
            <div
              key={p.id}
              className={[
                "rounded-xl border-2 px-3 py-2 transition-all",
                out
                  ? "border-green-950 bg-[#060d08] opacity-50"
                  : active
                    ? `${color.border} ${color.bg} ${styles.readyPulse}`
                    : "border-green-900 bg-[#06110a]",
              ].join(" ")}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`truncate text-sm font-bold ${out ? "text-green-800 line-through" : color.text}`}
                >
                  {p.name}
                </span>
                {p.id === myPlayerId && (
                  <span className="shrink-0 text-[10px] text-green-700">
                    {t("wait.you")}
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-baseline justify-between gap-2">
                <span className="text-[11px] text-green-600">
                  {p.card_count === 1
                    ? t("roster.card")
                    : t("roster.cards", { n: p.card_count })}
                </span>
                <span
                  className={[
                    "text-[11px] font-bold tabular-nums",
                    out
                      ? "text-green-800"
                      : urgent
                        ? `text-rose-400 ${styles.timerUrgent}`
                        : active
                          ? color.text
                          : "text-green-700",
                  ].join(" ")}
                >
                  {out
                    ? t("roster.out")
                    : live === null
                      ? t("roster.noClock")
                      : formatClock(live)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
