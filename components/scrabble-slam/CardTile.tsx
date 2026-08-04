"use client";

import type { Card } from "@/lib/scrabble-slam/engine";
import styles from "./game.module.css";

/** Han glyphs are square and dense: they need no uppercasing, a different
    font stack, and slightly smaller type to sit inside the same tile. */
function isHan(ch: string): boolean {
  return /[\u3400-\u9fff]/.test(ch);
}

export function CardTile({
  card,
  armed,
  shaking,
  hinted = false,
  dragging = false,
  disabled = false,
  dealDelayMs,
  onArm,
  onDragStart,
  onDragEnd,
}: {
  card: Card;
  armed: boolean;
  shaking: boolean;
  /** Highlighted by the Hint power-up. */
  hinted?: boolean;
  dragging?: boolean;
  disabled?: boolean;
  /** If set, plays a staggered "deal" entrance animation. */
  dealDelayMs?: number;
  onArm: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <button
      type="button"
      draggable={!disabled}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onArm}
      disabled={disabled}
      aria-pressed={armed}
      aria-label={card.letter.toUpperCase()}
      title={card.letter.toUpperCase()}
      style={dealDelayMs !== undefined ? { animationDelay: `${dealDelayMs}ms` } : undefined}
      className={[
        "relative shrink-0 select-none rounded-xl border-2 font-mono font-bold",
        "w-14 h-16 sm:w-16 sm:h-[4.5rem] flex items-center justify-center",
        "bg-[#08140a] border-green-800 text-green-50",
        "transition-transform duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
        armed ? styles.armed : "",
        shaking ? styles.cardShake : "",
        hinted ? styles.hinted : "",
        dragging ? styles.dragging : "",
        dealDelayMs !== undefined ? styles.dealIn : "",
      ].join(" ")}
    >
      <span
        className={
          isHan(card.letter)
            ? `text-[1.75rem] sm:text-3xl leading-none ${styles.han}`
            : "text-2xl sm:text-3xl leading-none uppercase"
        }
      >
        {card.letter}
      </span>
    </button>
  );
}
