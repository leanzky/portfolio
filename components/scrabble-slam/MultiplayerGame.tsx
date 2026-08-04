"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Card } from "@/lib/scrabble-slam/engine";
import { findHint, MAX_HAND, shuffle } from "@/lib/scrabble-slam/engine";
import type { RescueNotice } from "@/lib/scrabble-slam/reducer";
import { dictionaries, type WordLength } from "@/lib/scrabble-slam/dictionary";
import type { PlayerPublicRow, RoomRow } from "@/lib/scrabble-slam/multiplayer-types";
import { attemptMove } from "@/lib/scrabble-slam/multiplayer-actions";
import type { RpcResult } from "@/lib/scrabble-slam/multiplayer-types";
import {
  Cooldowns,
  initialCooldowns,
  POWER_UP_BY_ID,
  PowerUpId,
  tickCooldowns,
} from "@/lib/scrabble-slam/powerups";
import {
  getMutedServerSnapshot,
  getMutedSnapshot,
  setMuted,
  sound,
  subscribeMuted,
} from "@/lib/scrabble-slam/sound";
import { WordGrid } from "./WordGrid";
import { PlayerHand } from "./PlayerHand";
import { PowerUpRail } from "./PowerUpRail";
import { RescueToast } from "./RescueToast";
import { Hud } from "./Hud";
import { EndScreen } from "./EndScreen";

type FeedbackInput =
  | { kind: "valid"; slotIndex: number }
  | { kind: "invalid"; slotIndex?: number; cardId: string };

type Feedback = FeedbackInput & { id: number };

/** Ticking clock. State only ever updates from inside the interval callback,
 * never synchronously during render (useSyncExternalStore is the wrong tool:
 * its getSnapshot must be stable between calls, and Date.now() never is). */
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
  const [cooldowns, setCooldowns] = useState<Cooldowns>(initialCooldowns());
  const [hint, setHint] = useState<{ slotIndex: number; cardId: string } | null>(null);
  const now = useNow(100);
  const [stats, setStats] = useState({ draws: 0, swaps: 0, wordsPlayed: 0 });
  // Display order only. The server owns which cards you hold; this just
  // reorders them locally, and cards it hasn't seen fall to the end.
  const [handOrder, setHandOrder] = useState<string[]>([]);
  const [rescue, setRescue] = useState<RescueNotice | null>(null);

  // Endless rooms carry no end time at all (see 0007_endless_and_rescue.sql).
  const endless = room.ends_at === null;
  const muted = useSyncExternalStore(subscribeMuted, getMutedSnapshot, getMutedServerSnapshot);
  const lastStatus = useRef(room.status);

  const orderedHand = useMemo(() => {
    if (handOrder.length === 0) return myHand;
    const rank = new Map(handOrder.map((id, i) => [id, i]));
    return [...myHand].sort(
      (a, b) =>
        (rank.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(b.id) ?? Number.MAX_SAFE_INTEGER)
    );
  }, [myHand, handOrder]);

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
    else {
      sound.invalid();
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(70);
    }
  }

  /** The server rescues a stuck hand automatically; surface it the same way
      solo does. Shape comes from attempt_move in 0007. */
  function noteRescue(result: RpcResult) {
    const r = result.rescue as
      | { rescued?: boolean; added?: number; word?: string | null }
      | undefined;
    if (!r?.rescued) return;
    feedbackId += 1;
    setRescue({
      id: feedbackId,
      added: r.added ?? 0,
      rerolled: 0,
      newWord: r.word ?? null,
    });
    sound.rescue();
  }

  async function placeLetter(cardId: string, slotIndex: number) {
    const result = await attemptMove(room.id, "place_letter", cardId, slotIndex);
    noteRescue(result);
    if (result.ok) {
      fireFeedback({ kind: "valid", slotIndex });
      // Making a word is what recharges abilities, same rule as solo.
      setCooldowns((c) => tickCooldowns(c));
      setStats((s) => ({ ...s, wordsPlayed: s.wordsPlayed + 1 }));
      setHint(null);
    } else {
      fireFeedback({ kind: "invalid", slotIndex, cardId });
    }
  }

  function handleDragStart(card: Card, e: React.DragEvent) {
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingCardId(card.id);
  }

  function handleTapSlot(slotIndex: number) {
    const armed = armedCardId;
    setArmedCardId(null);
    if (armed) placeLetter(armed, slotIndex);
  }

  async function handleUsePowerUp(id: PowerUpId) {
    if (cooldowns[id] > 0) return;
    const def = POWER_UP_BY_ID[id];

    if (id === "hint") {
      // Purely local: it only surfaces information this client already has.
      const dictionary = dictionaries[room.dictionary_id];
      const found = findHint(room.word ?? "", myHand, dictionary);
      if (!found) return;
      setHint(found);
      setCooldowns((c) => ({ ...c, hint: def.cooldown }));
      sound.action();
      return;
    }

    // Everything else changes shared/server-owned state, so the server
    // applies it and the realtime subscription feeds the result back.
    const moveType = id === "chaos" ? "chaos" : id === "freeze" ? "freeze" : "purge";
    const result = await attemptMove(room.id, moveType, "n/a");
    noteRescue(result);
    if (result.ok) {
      setCooldowns((c) => ({ ...c, [id]: def.cooldown }));
      setHint(null);
      sound.action();
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
    noteRescue(r);
    if (r.ok) setStats((s) => ({ ...s, swaps: s.swaps + 1 }));
  }

  const timeLeft = room.ends_at
    ? Math.max(0, (new Date(room.ends_at).getTime() - now) / 1000)
    : 0;
  const elapsed = room.started_at
    ? Math.max(0, (now - new Date(room.started_at).getTime()) / 1000)
    : 0;

  if (room.status === "won" || room.status === "timeout") {
    return (
      <EndScreen
        status={room.status}
        word={room.word ?? ""}
        wordLength={(room.word_length ?? 4) as WordLength}
        dictionaryId={room.dictionary_id}
        duration={room.duration_seconds}
        secondsLeft={timeLeft}
        cardsLeft={myHand.length}
        wordsPlayed={stats.wordsPlayed}
        draws={stats.draws}
        swaps={stats.swaps}
        rescues={0}
        // The leaderboard ranks solo runs against each other; a race
        // against another player isn't the same measurement.
        record={false}
        onPlayAgain={onLeave}
      />
    );
  }

  const shakingCardId = feedback?.kind === "invalid" ? feedback.cardId : null;
  const frozen = Object.fromEntries(
    Object.entries(room.frozen ?? {}).map(([k, v]) => [k, new Date(v).getTime()])
  );

  return (
    <div className="min-h-svh flex flex-col justify-center py-8">
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-center gap-3 flex-wrap font-mono">
          {players
            .filter((p) => p.id !== myPlayerId)
            .map((p) => (
              <span
                key={p.id}
                className="text-xs font-bold uppercase tracking-wide text-green-400 rounded-full border border-green-800 px-3 py-1"
              >
                {p.name}: {p.card_count} left
              </span>
            ))}
        </div>

        <Hud
          dictionaryId={room.dictionary_id}
          endless={endless}
          timeLeft={timeLeft}
          elapsed={elapsed}
          duration={room.duration_seconds}
          cardsLeft={myHand.length}
          maxHand={MAX_HAND}
          wordsPlayed={stats.wordsPlayed}
          canSwap={!!armedCardId}
          muted={muted}
          onDraw={handleDraw}
          onSwap={handleSwap}
          onShuffle={() => setHandOrder(shuffle(myHand.map((c) => c.id)))}
          onToggleMute={() => setMuted(!muted)}
          onQuit={onLeave}
        />

        <WordGrid
          word={room.word ?? ""}
          frozen={frozen}
          now={now}
          feedback={feedback}
          hintedSlot={hint?.slotIndex ?? null}
          hasArmedLetter={!!armedCardId}
          onDropLetter={(cardId, slotIndex) => placeLetter(cardId, slotIndex)}
          onTapSlot={handleTapSlot}
        />

        <PlayerHand
          hand={orderedHand}
          armedCardId={armedCardId}
          shakingCardId={shakingCardId}
          hintedCardId={hint?.cardId ?? null}
          draggingCardId={draggingCardId}
          onArm={(id) => setArmedCardId(id === "" ? null : id)}
          onDragStart={handleDragStart}
          onDragEnd={() => setDraggingCardId(null)}
        />

        <PowerUpRail
          cooldowns={cooldowns}
          onUse={handleUsePowerUp}
          unavailable={endless ? { freeze: "No timer" } : undefined}
        />

        <RescueToast rescue={rescue} />
      </div>
    </div>
  );
}
