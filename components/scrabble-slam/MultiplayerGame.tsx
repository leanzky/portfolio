"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Card } from "@/lib/scrabble-slam/engine";
import { findHint, MAX_HAND, shuffle } from "@/lib/scrabble-slam/engine";
import { dictionaries, type WordLength } from "@/lib/scrabble-slam/dictionary";
import type {
  PlayerPublicRow,
  PlayerRow,
  RoomRow,
  RpcResult,
} from "@/lib/scrabble-slam/multiplayer-types";
import { attemptMove, forceSkipTurn } from "@/lib/scrabble-slam/multiplayer-actions";
import { colorForSeat } from "@/lib/scrabble-slam/player-colors";
import type { RescueNotice } from "@/lib/scrabble-slam/reducer";
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
import { PlayerRoster } from "./PlayerRoster";
import { RescueToast } from "./RescueToast";
import { SpectatorView } from "./SpectatorView";
import { Hud } from "./Hud";
import { EndScreen } from "./EndScreen";
import { useT } from "./LanguageToggle";
import styles from "./game.module.css";

type FeedbackInput =
  | { kind: "valid"; slotIndex: number }
  | { kind: "invalid"; slotIndex?: number; cardId: string };

type Feedback = FeedbackInput & { id: number };

/** Ticking clock. State only ever updates from inside the interval callback,
 * never synchronously during render (useSyncExternalStore is the wrong tool:
 * its getSnapshot must be stable between calls, and Date.now() never is). */
function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
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
  visibleHands,
  myPlayerId,
  onLeave,
}: {
  room: RoomRow;
  players: PlayerPublicRow[];
  myHand: Card[];
  visibleHands: PlayerRow[];
  myPlayerId: string;
  onLeave: () => void;
}) {
  const t = useT();
  // Selections are stamped with the turn they were made on, so anything left
  // half-done simply stops counting when the turn moves. Deriving it beats
  // clearing it in an effect: no cascading render, and no chance of a card
  // staying armed across a turn boundary and firing when the turn comes back.
  const [armed, setArmed] = useState<{ id: string; turn: number } | null>(null);
  const [hintState, setHint] = useState<
    { slotIndex: number; cardId: string; turn: number } | null
  >(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [cooldowns, setCooldowns] = useState<Cooldowns>(initialCooldowns());
  const [rescue, setRescue] = useState<RescueNotice | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const now = useNow(200);
  const [stats, setStats] = useState({ draws: 0, swaps: 0, wordsPlayed: 0 });
  const [handOrder, setHandOrder] = useState<string[]>([]);
  const muted = useSyncExternalStore(subscribeMuted, getMutedSnapshot, getMutedServerSnapshot);
  const lastStatus = useRef(room.status);

  const me = players.find((p) => p.id === myPlayerId);
  const endless = room.duration_seconds === 0;
  const myTurn = room.current_turn_player_id === myPlayerId;
  const eliminated = me?.eliminated ?? false;
  const activePlayer = players.find((p) => p.id === room.current_turn_player_id);

  const armedCardId =
    armed && armed.turn === room.turn_number && myTurn ? armed.id : null;
  const hint =
    hintState && hintState.turn === room.turn_number && myTurn ? hintState : null;
  const setArmedCardId = (id: string | null) =>
    setArmed(id ? { id, turn: room.turn_number } : null);

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

  function noteRescue(result: RpcResult) {
    const r = result.rescue as
      | { rescued?: boolean; added?: number; word?: string | null }
      | undefined;
    if (!r?.rescued) return;
    feedbackId += 1;
    setRescue({ id: feedbackId, added: r.added ?? 0, rerolled: 0, newWord: r.word ?? null });
    sound.rescue();
  }

  /** Surfaces what a rejected move actually cost you. */
  function noteCost(result: RpcResult) {
    if (result.turn_skipped) setNotice(t("roster.turnSkipped"));
    else if (typeof result.penalty_ms === "number") {
      setNotice(t("roster.wrongGuess", { n: Math.round(result.penalty_ms / 1000) }));
    } else if (result.reason === "not_your_turn") setNotice(t("turn.notYours"));
  }

  async function placeLetter(cardId: string, slotIndex: number) {
    if (!myTurn) {
      setNotice(t("turn.notYours"));
      fireFeedback({ kind: "invalid", slotIndex, cardId });
      return;
    }
    const result = await attemptMove(room.id, "place_letter", cardId, slotIndex);
    noteRescue(result);
    if (result.ok) {
      fireFeedback({ kind: "valid", slotIndex });
      setCooldowns((c) => tickCooldowns(c));
      setStats((s) => ({ ...s, wordsPlayed: s.wordsPlayed + 1 }));
      setHint(null);
      setNotice(null);
    } else {
      fireFeedback({ kind: "invalid", slotIndex, cardId });
      noteCost(result);
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
    if (!myTurn || cooldowns[id] > 0) return;
    const def = POWER_UP_BY_ID[id];

    if (id === "hint") {
      // Purely local: it only surfaces information this client already has.
      const dictionary = dictionaries[room.dictionary_id];
      const found = findHint(room.word ?? "", myHand, dictionary);
      if (!found) return;
      setHint({ ...found, turn: room.turn_number });
      setCooldowns((c) => ({ ...c, hint: def.cooldown }));
      sound.action();
      return;
    }

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
    if (!myTurn) return;
    const r = await attemptMove(room.id, "draw", "n/a");
    if (r.ok) setStats((s) => ({ ...s, draws: s.draws + 1 }));
  }

  async function handleSwap() {
    if (!armedCardId || !myTurn) return;
    const r = await attemptMove(room.id, "swap", armedCardId);
    setArmedCardId(null);
    noteRescue(r);
    if (r.ok) setStats((s) => ({ ...s, swaps: s.swaps + 1 }));
  }

  async function handlePass() {
    if (!myTurn) return;
    setArmedCardId(null);
    await attemptMove(room.id, "pass", "n/a");
  }

  const turnStarted = room.turn_started_at ? new Date(room.turn_started_at).getTime() : null;
  const turnAgeSec = turnStarted ? (now - turnStarted) / 1000 : 0;
  const stalled = room.status === "playing" && !myTurn && turnAgeSec > 90;

  // Clocks live on players now, so read ours out of the roster and run it
  // down only while it's actually our turn.
  const bankedMs = me?.time_left_ms ?? null;
  const liveMs =
    bankedMs === null
      ? null
      : myTurn && turnStarted
        ? Math.max(0, bankedMs - (now - turnStarted))
        : bankedMs;

  if (room.status === "won" || room.status === "timeout") {
    const winner = players.find((p) => p.id === room.winner_player_id);
    return (
      <EndScreen
        status={room.status === "won" && room.winner_player_id !== myPlayerId ? "timeout" : room.status}
        headline={
          room.status === "won"
            ? room.winner_player_id === myPlayerId
              ? t("mp.youWon")
              : t("mp.won", { name: winner?.name ?? "?" })
            : t("mp.everyoneOut")
        }
        word={room.word ?? ""}
        wordLength={(room.word_length ?? 4) as WordLength}
        dictionaryId={room.dictionary_id}
        duration={room.duration_seconds}
        secondsLeft={liveMs === null ? 0 : liveMs / 1000}
        cardsLeft={myHand.length}
        wordsPlayed={stats.wordsPlayed}
        draws={stats.draws}
        swaps={stats.swaps}
        rescues={0}
        record={false}
        playAgainLabel={t("mp.backToLobby")}
        onPlayAgain={onLeave}
      />
    );
  }

  // Knocked out: the board stays live, and every hand opens up.
  if (eliminated) {
    return (
      <SpectatorView
        room={room}
        players={players}
        hands={visibleHands}
        myPlayerId={myPlayerId}
        now={now}
        onLeave={onLeave}
      />
    );
  }

  const shakingCardId = feedback?.kind === "invalid" ? feedback.cardId : null;
  const frozen = Object.fromEntries(
    Object.entries(room.frozen ?? {}).map(([k, v]) => [k, new Date(v).getTime()])
  );
  const activeColor = colorForSeat(activePlayer?.seat ?? null);

  return (
    <div className="min-h-svh flex flex-col justify-center py-8">
      <div className="flex flex-col gap-5 sm:gap-7">
        <PlayerRoster room={room} players={players} myPlayerId={myPlayerId} now={now} />

        <div className="max-w-3xl mx-auto px-4 w-full text-center font-mono">
          <p
            className={`text-sm font-bold uppercase tracking-wide ${
              myTurn ? `text-green-50 ${styles.glowPulse}` : activeColor.text
            }`}
          >
            {myTurn
              ? t("turn.yours")
              : t("turn.waiting", { name: activePlayer?.name ?? "…" })}
          </p>
          {notice && (
            <p className="mt-1 text-[11px] text-rose-400">{notice}</p>
          )}
          {stalled && (
            <button
              onClick={() => forceSkipTurn(room.id)}
              className="mt-2 rounded-lg border border-amber-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-300 transition-colors hover:border-amber-400"
              title={t("turn.stalledNote")}
            >
              {t("turn.skipStalled")}
            </button>
          )}
        </div>

        <Hud
          dictionaryId={room.dictionary_id}
          endless={endless}
          timeLeft={liveMs === null ? 0 : liveMs / 1000}
          elapsed={turnAgeSec}
          duration={room.duration_seconds}
          cardsLeft={myHand.length}
          maxHand={MAX_HAND}
          wordsPlayed={stats.wordsPlayed}
          canSwap={!!armedCardId && myTurn}
          disabled={!myTurn}
          muted={muted}
          onDraw={handleDraw}
          onSwap={handleSwap}
          onShuffle={() => setHandOrder(shuffle(myHand.map((c) => c.id)))}
          onPass={handlePass}
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
          lastMoveSlot={room.last_move_slot}
          lastMoveColor={
            colorForSeat(
              players.find((p) => p.id === room.last_move_player_id)?.seat ?? null
            ).hex
          }
          onDropLetter={(cardId, slotIndex) => placeLetter(cardId, slotIndex)}
          onTapSlot={handleTapSlot}
        />

        <div className={myTurn ? "" : "opacity-50 pointer-events-none"}>
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
        </div>

        <PowerUpRail
          cooldowns={cooldowns}
          onUse={handleUsePowerUp}
          disabled={!myTurn}
          unavailable={endless ? { freeze: t("power.noTimer") } : undefined}
        />

        <RescueToast rescue={rescue} />
      </div>
    </div>
  );
}
