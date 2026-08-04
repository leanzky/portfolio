"use client";

import type { Card } from "@/lib/scrabble-slam/engine";
import { CardTile } from "./CardTile";
import { useT } from "./LanguageToggle";

export function PlayerHand({
  hand,
  armedCardId,
  shakingCardId,
  hintedCardId,
  draggingCardId,
  onArm,
  onDragStart,
  onDragEnd,
}: {
  hand: Card[];
  armedCardId: string | null;
  shakingCardId: string | null;
  hintedCardId?: string | null;
  draggingCardId: string | null;
  onArm: (cardId: string) => void;
  onDragStart: (card: Card, e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const t = useT();
  return (
    <div className="w-full font-mono">
      <p className="mb-2 text-center text-[11px] uppercase tracking-[0.2em] text-green-700">
        {hand.length === 1
          ? t("hand.titleOne")
          : t("hand.title", { n: hand.length })}
      </p>
      {/* Deliberately not a scroll container: the tray already wraps, and
          overflow-x-auto would clip tooltips while letting absolute children
          inflate scrollWidth, knocking the row off-centre. */}
      <div
        className="flex flex-wrap justify-center gap-2 sm:gap-2.5 max-w-3xl mx-auto px-2 py-1"
        role="list"
        aria-label="Your cards"
      >
        {/* CSS animations only play once per DOM node, so every card can
            always carry the deal-in animation: the opening hand staggers in
            together, and a card added later plays it alone as a flourish. */}
        {hand.map((card, i) => (
          <CardTile
            key={card.id}
            card={card}
            armed={armedCardId === card.id}
            shaking={shakingCardId === card.id}
            hinted={hintedCardId === card.id}
            dragging={draggingCardId === card.id}
            dealDelayMs={i * 35}
            onArm={() => onArm(armedCardId === card.id ? "" : card.id)}
            onDragStart={(e) => onDragStart(card, e)}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
}
