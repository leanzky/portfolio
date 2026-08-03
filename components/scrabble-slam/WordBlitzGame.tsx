"use client";

import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import type { Card } from "@/lib/scrabble-slam/engine";
import { initialState, reducer } from "@/lib/scrabble-slam/reducer";
import {
  getMutedServerSnapshot,
  getMutedSnapshot,
  setMuted,
  sound,
  subscribeMuted,
} from "@/lib/scrabble-slam/sound";
import { StartScreen } from "./StartScreen";
import { Hud } from "./Hud";
import { WordGrid } from "./WordGrid";
import { PlayerHand } from "./PlayerHand";
import { PowerUpLegend } from "./PowerUpLegend";
import { EndScreen } from "./EndScreen";
import styles from "./game.module.css";

export function WordBlitzGame({ onExit }: { onExit?: () => void } = {}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [armedCardId, setArmedCardId] = useState<string | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const muted = useSyncExternalStore(
    subscribeMuted,
    getMutedSnapshot,
    getMutedServerSnapshot
  );
  const lastFeedbackId = useRef<number | null>(null);
  const lastStatus = useRef(state.status);

  // Drive the countdown; ~10 updates/sec keeps the timer bar smooth
  // without the overhead of updating every animation frame.
  useEffect(() => {
    if (state.status !== "playing") return;
    const id = window.setInterval(() => {
      dispatch({ type: "TICK", now: Date.now() });
    }, 100);
    return () => window.clearInterval(id);
  }, [state.status]);

  // Sound + haptics reacting to game events, without re-triggering on
  // every render (only when a new feedback token or status arrives).
  useEffect(() => {
    if (state.feedback && state.feedback.id !== lastFeedbackId.current) {
      lastFeedbackId.current = state.feedback.id;
      if (state.feedback.kind === "valid") sound.valid();
      else if (state.feedback.kind === "invalid") {
        sound.invalid();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(70);
        }
      } else if (state.feedback.kind === "expand") sound.expand();
      else if (state.feedback.kind === "action") sound.action();
    }
  }, [state.feedback]);

  useEffect(() => {
    if (state.status !== lastStatus.current) {
      lastStatus.current = state.status;
      if (state.status === "won") sound.win();
      if (state.status === "timeout") sound.timeout();
    }
  }, [state.status]);

  function toggleMute() {
    setMuted(!muted);
  }

  function findArmedCard(): Card | undefined {
    if (!armedCardId) return undefined;
    return state.hand.find((c) => c.id === armedCardId);
  }

  function handleDragStart(card: Card, e: React.DragEvent) {
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingCardId(card.id);
  }

  function handleArm(cardId: string) {
    setArmedCardId(cardId === "" ? null : cardId);
  }

  function handlePlayAction(cardId: string) {
    const card = state.hand.find((c) => c.id === cardId);
    if (!card || card.kind !== "action") return;
    if (card.action === "freeze") dispatch({ type: "PLAY_FREEZE", cardId });
    if (card.action === "chaos") dispatch({ type: "PLAY_CHAOS", cardId });
  }

  function handleTapSlot(slotIndex: number) {
    const armed = findArmedCard();
    if (armed && armed.kind === "letter") {
      dispatch({ type: "PLACE_LETTER", cardId: armed.id, slotIndex });
    }
    setArmedCardId(null);
  }

  function handleTapExpandSlot() {
    const armed = findArmedCard();
    if (armed && armed.kind === "action" && armed.action === "expand") {
      dispatch({ type: "PLACE_EXPAND", cardId: armed.id });
    }
    setArmedCardId(null);
  }

  const armed = findArmedCard();
  const timeLeft = Math.max(0, (state.endAt - state.now) / 1000);
  const shakingCardId =
    state.feedback?.kind === "invalid" ? state.feedback.cardId : null;
  const canExpand =
    state.status === "playing" &&
    state.wordLength === 4 &&
    state.hand.some((c) => c.kind === "action" && c.action === "expand");

  return (
    <div className="min-h-svh flex flex-col justify-center py-8">
      {state.status === "idle" && (
        <StartScreen
          onStart={(dictionaryId, duration) =>
            dispatch({ type: "START", dictionaryId, duration })
          }
          onExit={onExit}
        />
      )}

      {state.status === "playing" && (
        <div className="flex flex-col gap-8 sm:gap-10">
          <Hud
            dictionaryId={state.dictionaryId}
            timeLeft={timeLeft}
            duration={state.duration}
            cardsLeft={state.hand.length}
            canSwap={!!armedCardId}
            muted={muted}
            onDraw={() => dispatch({ type: "DRAW_CARD" })}
            onSwap={() => {
              if (armedCardId) dispatch({ type: "SWAP_CARD", cardId: armedCardId });
              setArmedCardId(null);
            }}
            onToggleMute={toggleMute}
            onQuit={() => dispatch({ type: "RESET" })}
          />

          <div className="relative">
            {state.feedback?.kind === "expand" && (
              <div className={styles.burst} />
            )}
            <WordGrid
              word={state.word}
              frozen={state.frozen}
              now={state.now}
              feedback={state.feedback}
              canExpand={canExpand}
              hasArmedLetter={armed?.kind === "letter"}
              hasArmedExpand={
                armed?.kind === "action" && armed.action === "expand"
              }
              onDropLetter={(cardId, slotIndex) =>
                dispatch({ type: "PLACE_LETTER", cardId, slotIndex })
              }
              onDropExpand={(cardId) =>
                dispatch({ type: "PLACE_EXPAND", cardId })
              }
              onTapSlot={handleTapSlot}
              onTapExpandSlot={handleTapExpandSlot}
            />
          </div>

          <PlayerHand
            hand={state.hand}
            armedCardId={armedCardId}
            shakingCardId={shakingCardId}
            draggingCardId={draggingCardId}
            onArm={handleArm}
            onPlayAction={handlePlayAction}
            onDragStart={handleDragStart}
            onDragEnd={() => setDraggingCardId(null)}
          />

          <PowerUpLegend />
        </div>
      )}

      {(state.status === "won" || state.status === "timeout") && (
        <EndScreen
          status={state.status}
          word={state.word}
          cardsLeft={state.hand.length}
          draws={state.draws}
          swaps={state.swaps}
          onPlayAgain={() => dispatch({ type: "RESET" })}
        />
      )}
    </div>
  );
}
