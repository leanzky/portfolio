/**
 * A stable colour per seat, so a player reads as the same colour in the
 * roster, on the slot they just played, and on the spectator board.
 *
 * Keyed by seat rather than by id: seats are assigned once at start and
 * never move, so colours can't shuffle mid-game. Every hue still sits in
 * the green-terminal family's register (bright, saturated, dark-background
 * safe) rather than fighting it.
 */

export type PlayerColor = {
  /** Tailwind text colour for the name. */
  text: string;
  /** Border for the roster card and the played slot. */
  border: string;
  /** Faint fill behind an active card. */
  bg: string;
  /** Raw hex, for anywhere that needs a real value (glows, SVG). */
  hex: string;
};

export const PLAYER_COLORS: PlayerColor[] = [
  { text: "text-lime-300", border: "border-lime-400", bg: "bg-lime-400/10", hex: "#a3e635" },
  { text: "text-cyan-300", border: "border-cyan-400", bg: "bg-cyan-400/10", hex: "#22d3ee" },
  { text: "text-fuchsia-300", border: "border-fuchsia-400", bg: "bg-fuchsia-400/10", hex: "#e879f9" },
  { text: "text-amber-300", border: "border-amber-400", bg: "bg-amber-400/10", hex: "#fbbf24" },
  { text: "text-sky-300", border: "border-sky-400", bg: "bg-sky-400/10", hex: "#38bdf8" },
  { text: "text-rose-300", border: "border-rose-400", bg: "bg-rose-400/10", hex: "#fb7185" },
];

export function colorForSeat(seat: number | null | undefined): PlayerColor {
  if (seat == null || seat < 0) return PLAYER_COLORS[0];
  return PLAYER_COLORS[seat % PLAYER_COLORS.length];
}
