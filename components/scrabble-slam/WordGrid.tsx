"use client";

import type { Feedback } from "@/lib/scrabble-slam/reducer";
import styles from "./game.module.css";

export function WordGrid({
  word,
  frozen,
  now,
  feedback,
  hintedSlot,
  hasArmedLetter,
  onDropLetter,
  onTapSlot,
}: {
  word: string;
  /** slot index -> ms timestamp when a freeze expires (multiplayer only). */
  frozen?: Record<number, number>;
  now: number;
  feedback: Feedback | null;
  /** Slot highlighted by the Hint power-up. */
  hintedSlot?: number | null;
  hasArmedLetter: boolean;
  onDropLetter: (cardId: string, slotIndex: number) => void;
  onTapSlot: (slotIndex: number) => void;
}) {
  const letters = word.toUpperCase().split("");

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap font-mono">
      {letters.map((letter, i) => {
        const isFrozen = (frozen?.[i] ?? 0) > now;
        const glow = feedback?.kind === "valid" && feedback.slotIndex === i;
        const shake = feedback?.kind === "invalid" && feedback.slotIndex === i;

        return (
          <div
            key={i}
            data-testid="grid-slot"
            data-slot-index={i}
            onDragOver={(e) => {
              if (!isFrozen) e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const cardId = e.dataTransfer.getData("text/plain");
              if (cardId) onDropLetter(cardId, i);
            }}
            onClick={() => {
              if (hasArmedLetter && !isFrozen) onTapSlot(i);
            }}
            className={[
              "relative flex items-center justify-center rounded-2xl border-2",
              "w-14 h-16 sm:w-20 sm:h-24 font-bold text-3xl sm:text-5xl",
              "bg-[#08140a] text-green-50 transition-colors",
              isFrozen
                ? "border-emerald-400 cursor-not-allowed"
                : hasArmedLetter
                  ? "border-lime-400 cursor-pointer"
                  : "border-green-800",
              glow ? styles.slotGlow : "",
              shake ? styles.slotShake : "",
              hintedSlot === i ? styles.hinted : "",
            ].join(" ")}
          >
            <span data-testid="slot-letter">{letter}</span>
            {isFrozen && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-emerald-500/20 backdrop-blur-[1px]">
                <span className="text-lg">❄</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
