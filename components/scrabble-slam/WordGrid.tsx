"use client";

import type { Feedback } from "@/lib/scrabble-slam/reducer";
import styles from "./game.module.css";

export function WordGrid({
  word,
  frozen,
  now,
  feedback,
  canExpand,
  hasArmedLetter,
  hasArmedExpand,
  onDropLetter,
  onDropExpand,
  onTapSlot,
  onTapExpandSlot,
}: {
  word: string;
  frozen: Record<number, number>;
  now: number;
  feedback: Feedback | null;
  canExpand: boolean;
  hasArmedLetter: boolean;
  hasArmedExpand: boolean;
  onDropLetter: (cardId: string, slotIndex: number) => void;
  onDropExpand: (cardId: string) => void;
  onTapSlot: (slotIndex: number) => void;
  onTapExpandSlot: () => void;
}) {
  const letters = word.toUpperCase().split("");

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
      {letters.map((letter, i) => {
        const isFrozen = frozen[i] > now;
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
              "w-14 h-16 sm:w-20 sm:h-24 font-display font-bold text-3xl sm:text-5xl",
              "bg-slate-900/80 text-slate-50 transition-colors",
              isFrozen
                ? "border-cyan-400 cursor-not-allowed"
                : hasArmedLetter
                  ? "border-amber-400 cursor-pointer"
                  : "border-slate-700",
              glow ? styles.slotGlow : "",
              shake ? styles.slotShake : "",
            ].join(" ")}
          >
            <span data-testid="slot-letter">{letter}</span>
            {isFrozen && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-cyan-500/20 backdrop-blur-[1px]">
                <span className="text-lg">❄</span>
              </div>
            )}
          </div>
        );
      })}

      {canExpand && (
        <div
          data-testid="expand-slot"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const cardId = e.dataTransfer.getData("text/plain");
            if (cardId) onDropExpand(cardId);
          }}
          onClick={() => {
            if (hasArmedExpand) onTapExpandSlot();
          }}
          className={[
            "flex items-center justify-center rounded-2xl border-2 border-dashed",
            "w-14 h-16 sm:w-20 sm:h-24 text-2xl sm:text-3xl text-slate-500",
            hasArmedExpand
              ? "border-amber-400 text-amber-300 cursor-pointer"
              : "border-slate-700",
          ].join(" ")}
          title="Drop an Expand card here to grow the word to 5 letters"
        >
          +
        </div>
      )}
    </div>
  );
}
