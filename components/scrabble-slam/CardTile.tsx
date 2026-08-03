"use client";

import type { Card } from "@/lib/scrabble-slam/engine";
import styles from "./game.module.css";

const ACTION_META: Record<
  "freeze" | "chaos" | "expand",
  { label: string; icon: string; className: string }
> = {
  freeze: {
    label: "Freeze",
    icon: "❄", // ❄
    className: "bg-emerald-950 border-emerald-400 text-emerald-200",
  },
  chaos: {
    label: "Chaos",
    icon: "⚡", // ⚡
    className: "bg-lime-950 border-lime-400 text-lime-200",
  },
  expand: {
    label: "Expand",
    icon: "⤡", // ⤡
    className: "bg-green-950 border-green-400 text-green-200",
  },
};

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

  return (
    <button
      type="button"
      draggable={isTargetable && !disabled}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => (isTargetable ? onArm() : onPlayAction())}
      disabled={disabled}
      aria-pressed={armed}
      style={dealDelayMs !== undefined ? { animationDelay: `${dealDelayMs}ms` } : undefined}
      className={[
        "relative shrink-0 select-none rounded-xl border-2 font-mono font-bold",
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
      title={
        card.kind === "letter"
          ? `Letter ${card.letter.toUpperCase()}`
          : meta!.label
      }
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
  );
}
