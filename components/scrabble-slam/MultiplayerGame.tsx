"use client";

import { useEffect, useRef, useState } from "react";
import type { Card } from "@/lib/scrabble-slam/engine";
import type { PlayerPublicRow, RoomRow } from "@/lib/scrabble-slam/multiplayer-types";
import { attemptMove } from "@/lib/scrabble-slam/multiplayer-actions";
import {
  getMutedServerSnapshot,
  getMutedSnapshot,
  setMuted,
  sound,
  subscribeMuted,
} from "@/lib/scrabble-slam/sound";
import { useSyncExternalStore } from "react";
import { WordGrid } from "./WordGrid";
import { PlayerHand } from "./PlayerHand";
import { Hud } from "./Hud";
import { EndScreen } from "./EndScreen";
import styles from "./game.module.css";

type FeedbackInput =
  | { kind: "valid"; slotIndex: number }
  | { kind: "invalid"; slotIndex?: number; cardId: string }
  | { kind: "expand" }
  | { kind: "action" };

type Feedback = FeedbackInput & { id: number };

/** Ticking clock: state only ever updates from inside the interval callback
 * (never synchronously during render), starting from a static placeholder
 * so there's no impure call in the initializer either. Mirrors the identical,
 * already-verified pattern in WordBlitzGame.tsx. useSyncExternalStore is the
 * wrong tool here — its getSnapshot must be referentially stable between
 * calls unless the store truly changed, but Date.now() never is, which
 * causes React to treat every re-render as a fresh external change and loop
 * (this is exactly what caused the "Maximum update depth exceeded" crash). */
function useNow(intervalMs: number): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

let feedbackId = 0;

export function MultiplayerGame({
  room,
  players,
  myHand,
  myPlayerId,
  onLeave,
}: {
  room: RoomRow;
  players: PlayerPublicRow[];
  myHand: Card[];
  myPlayerId: string;
  onLeave: () => void;
}) {
  const [armedCardId, setArmedCardId] = useState<string | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const now = useNow(100);
  const [stats, setStats] = useState({ draws: 0, swaps: 0 });
  const muted = useSyncExternalStore(subscribeMuted, getMutedSnapshot, getMutedServerSnapshot);
  const lastStatus = useRef(room.status);

  useEffect(() => {
    if (room.status !== lastStatus.current) {
      lastStatus.current = room.status;
      if (room.status === "won") sound.win();
      if (room.status === "timeout") sound.timeout();
    }
  }, [room.status]);

  function fireFeedback(f: FeedbackInput) {
    feedbackId += 1;
    setFeedback({ ...f, id: feedbackId });
    if (f.kind === "valid") sound.valid();
    else if (f.kind === "invalid") {
      sound.invalid();
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(70);
    } else if (f.kind === "expand") sound.expand();
    else if (f.kind === "action") sound.action();
  }

  function findArmedCard(): Card | undefined {
    if (!armedCardId) return undefined;
    return myHand.find((c) => c.id === armedCardId);
  }

  async function placeLetter(cardId: string, slotIndex: number) {
    const result = await attemptMove(room.id, "place_letter", cardId, slotIndex);
    if (result.ok) fireFeedback({ kind: "valid", slotIndex });
    else fireFeedback({ kind: "invalid", slotIndex, cardId });
  }

  async function placeExpand(cardId: string) {
    const result = await attemptMove(room.id, "place_expand", cardId);
    if (result.ok) fireFeedback({ kind: "expand" });
    else fireFeedback({ kind: "invalid", cardId });
  }

  function handleDragStart(card: Card, e: React.DragEvent) {
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingCardId(card.id);
  }

  function handleArm(cardId: string) {
    setArmedCardId(cardId === "" ? null : cardId);
  }

  async function handlePlayAction(cardId: string) {
    const card = myHand.find((c) => c.id === cardId);
    if (!card || card.kind !== "action") return;
    if (card.action === "freeze") {
      const r = await attemptMove(room.id, "freeze", cardId);
      if (r.ok) fireFeedback({ kind: "action" });
    }
    if (card.action === "chaos") {
      const r = await attemptMove(room.id, "chaos", cardId);
      if (r.ok) fireFeedback({ kind: "action" });
    }
  }

  async function handleTapSlot(slotIndex: number) {
    const armed = findArmedCard();
    setArmedCardId(null);
    if (armed && armed.kind === "letter") await placeLetter(armed.id, slotIndex);
  }

  async function handleTapExpandSlot() {
    const armed = findArmedCard();
    setArmedCardId(null);
    if (armed && armed.kind === "action" && armed.action === "expand") {
      await placeExpand(armed.id);
    }
  }

  async function handleDraw() {
    const r = await attemptMove(room.id, "draw", "n/a");
    if (r.ok) setStats((s) => ({ ...s, draws: s.draws + 1 }));
  }

  async function handleSwap() {
    if (!armedCardId) return;
    const r = await attemptMove(room.id, "swap", armedCardId);
    setArmedCardId(null);
    if (r.ok) setStats((s) => ({ ...s, swaps: s.swaps + 1 }));
  }

  if (room.status === "won" || room.status === "timeout") {
    return (
      <EndScreen
        status={room.status}
        word={room.word ?? ""}
        cardsLeft={myHand.length}
        draws={stats.draws}
        swaps={stats.swaps}
        onPlayAgain={onLeave}
      />
    );
  }

  const armed = findArmedCard();
  const timeLeft = room.ends_at
    ? Math.max(0, (new Date(room.ends_at).getTime() - now) / 1000)
    : 0;
  const shakingCardId = feedback?.kind === "invalid" ? feedback.cardId : null;
  const canExpand =
    room.word_length === 4 && myHand.some((c) => c.kind === "action" && c.action === "expand");
  const frozen = Object.fromEntries(
    Object.entries(room.frozen ?? {}).map(([k, v]) => [k, new Date(v).getTime()])
  );

  return (
    <div className="min-h-svh flex flex-col justify-center py-8">
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-center gap-3 flex-wrap">
          {players
            .filter((p) => p.id !== myPlayerId)
            .map((p) => (
              <span
                key={p.id}
                className="text-xs font-bold uppercase tracking-wide text-slate-400 rounded-full border border-slate-700 px-3 py-1"
              >
                {p.name}: {p.card_count} left
              </span>
            ))}
        </div>

        <Hud
          dictionaryId={room.dictionary_id}
          timeLeft={timeLeft}
          duration={room.duration_seconds}
          cardsLeft={myHand.length}
          canSwap={!!armedCardId}
          muted={muted}
          onDraw={handleDraw}
          onSwap={handleSwap}
          onToggleMute={() => setMuted(!muted)}
          onQuit={onLeave}
        />

        <div className="relative">
          {feedback?.kind === "expand" && <div className={styles.burst} />}
          <WordGrid
            word={room.word ?? ""}
            frozen={frozen}
            now={now}
            feedback={feedback}
            canExpand={canExpand}
            hasArmedLetter={armed?.kind === "letter"}
            hasArmedExpand={armed?.kind === "action" && armed.action === "expand"}
            onDropLetter={(cardId, slotIndex) => placeLetter(cardId, slotIndex)}
            onDropExpand={(cardId) => placeExpand(cardId)}
            onTapSlot={handleTapSlot}
            onTapExpandSlot={handleTapExpandSlot}
          />
        </div>

        <PlayerHand
          hand={myHand}
          armedCardId={armedCardId}
          shakingCardId={shakingCardId}
          draggingCardId={draggingCardId}
          onArm={handleArm}
          onPlayAction={handlePlayAction}
          onDragStart={handleDragStart}
          onDragEnd={() => setDraggingCardId(null)}
        />
      </div>
    </div>
  );
}
