"use client";

import type { Card } from "@/lib/scrabble-slam/engine";
import { CardTile } from "./CardTile";

export function PlayerHand({
  hand,
  armedCardId,
  shakingCardId,
  draggingCardId,
  onArm,
  onPlayAction,
  onDragStart,
  onDragEnd,
}: {
  hand: Card[];
  armedCardId: string | null;
  shakingCardId: string | null;
  draggingCardId: string | null;
  onArm: (cardId: string) => void;
  onPlayAction: (cardId: string) => void;
  onDragStart: (card: Card, e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <div className="w-full font-mono">
      <p className="mb-2 text-center text-[11px] uppercase tracking-[0.2em] text-green-700">
        Your hand · {hand.length} card{hand.length === 1 ? "" : "s"}
      </p>
      <div
        className="flex flex-wrap justify-center gap-2 sm:gap-2.5 max-w-3xl mx-auto px-2 py-1 overflow-x-auto"
        role="list"
        aria-label="Your cards"
      >
        {/* CSS animations only ever play once per DOM node (on its own
            mount/insertion), never replaying on a later re-render of an
            already-mounted node — so every card can simply always carry
            the "deal in" animation: the initial 16-card hand staggers in
            together, and any single card added later (draw/swap/chaos)
            plays the same small entrance on its own, which reads as a
            deliberate flourish rather than a bug. No extra state needed. */}
        {hand.map((card, i) => (
          <CardTile
            key={card.id}
            card={card}
            armed={armedCardId === card.id}
            shaking={shakingCardId === card.id}
            dragging={draggingCardId === card.id}
            dealDelayMs={i * 35}
            onArm={() =>
              onArm(armedCardId === card.id ? "" : card.id)
            }
            onPlayAction={() => onPlayAction(card.id)}
            onDragStart={(e) => onDragStart(card, e)}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
}
