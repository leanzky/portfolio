"use client";

import type { Card } from "@/lib/scrabble-slam/engine";
import styles from "./game.module.css";

const ACTION_META: Record<
  "freeze" | "chaos" | "expand",
  { label: string; icon: string; className: string; help: string }
> = {
  freeze: {
    label: "Freeze",
    icon: "❄", // ❄
    className: "bg-emerald-950 border-emerald-400 text-emerald-200",
    help: "Tap to play. Locks a random letter slot for 5 seconds — nobody can change that letter until it thaws.",
  },
  chaos: {
    label: "Chaos",
    icon: "⚡", // ⚡
    className: "bg-lime-950 border-lime-400 text-lime-200",
    help: "Tap to play. Trades this card for 2 fresh random letters — your hand grows by 1, so use it when you're stuck.",
  },
  expand: {
    label: "Expand",
    icon: "⤡", // ⤡
    className: "bg-green-950 border-green-400 text-green-200",
    help: "Drag onto the dashed “+” slot (or tap it, then tap “+”). Adds its letter to the END of the word, growing it to 5 letters for the rest of the round.",
  },
};

const LETTER_HELP =
  "Drag onto a letter slot (or tap this card, then tap a slot) to swap that letter. The new word must be a real word.";

export function CardTile({
  card,
  armed,
  shaking,
  dragging = false,
  disabled = false,
  dealDelayMs,
  onArm,
  onPlayAction,
  onDragStart,
  onDragEnd,
}: {
  card: Card;
  armed: boolean;
  shaking: boolean;
  dragging?: boolean;
  disabled?: boolean;
  /** If set, plays a one-time staggered "deal" entrance animation. */
  dealDelayMs?: number;
  onArm: () => void;
  onPlayAction: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const isTargetable = card.kind === "letter" || card.action === "expand";
  const meta = card.kind === "action" ? ACTION_META[card.action] : null;
  const help = meta ? meta.help : LETTER_HELP;
  const heading =
    card.kind === "letter" ? `Letter ${card.letter.toUpperCase()}` : meta!.label;

  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        draggable={isTargetable && !disabled}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={() => (isTargetable ? onArm() : onPlayAction())}
        disabled={disabled}
        aria-pressed={armed}
        aria-label={`${heading}. ${help}`}
        style={dealDelayMs !== undefined ? { animationDelay: `${dealDelayMs}ms` } : undefined}
        className={[
          "relative select-none rounded-xl border-2 font-mono font-bold",
          "w-14 h-16 sm:w-16 sm:h-[4.5rem] flex flex-col items-center justify-center gap-0.5",
          "transition-transform duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
          card.kind === "letter"
            ? "bg-[#08140a] border-green-800 text-green-50"
            : meta!.className,
          armed ? styles.armed : "",
          shaking ? styles.cardShake : "",
          dragging ? styles.dragging : "",
          dealDelayMs !== undefined ? styles.dealIn : "",
        ].join(" ")}
      >
        {card.kind === "letter" ? (
          <span className="text-2xl sm:text-3xl leading-none uppercase">
            {card.letter}
          </span>
        ) : (
          <>
            <span className="text-xl leading-none">{meta!.icon}</span>
            <span className="text-[9px] uppercase tracking-wide leading-none">
              {meta!.label}
            </span>
            {card.action === "expand" && card.letter && (
              <span className="text-xs font-bold tracking-wide opacity-90">
                +{card.letter.toUpperCase()}
              </span>
            )}
          </>
        )}
      </button>

      {/* Explains what the card actually does. Shown on hover (desktop) and
          on keyboard focus, so it's reachable without a pointer. Action
          cards get a wider box since their rules need a sentence. */}
      <div
        role="tooltip"
        className={[
          "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2",
          card.kind === "letter" ? "w-52" : "w-60",
          "rounded-lg border border-green-700 bg-[#04120a] px-3 py-2 text-left",
          "opacity-0 translate-y-1 transition-all duration-150",
          "group-hover:opacity-100 group-hover:translate-y-0",
          "group-focus-within:opacity-100 group-focus-within:translate-y-0",
          "shadow-[0_8px_24px_rgba(0,0,0,0.6)]",
        ].join(" ")}
      >
        <p className="text-[11px] font-bold uppercase tracking-wide text-green-300">
          {heading}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-green-500 normal-case font-normal">
          {help}
        </p>
      </div>
    </div>
  );
}
