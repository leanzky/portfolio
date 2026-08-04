"use client";

import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { MAX_HAND, type Card } from "@/lib/scrabble-slam/engine";
import { initialState, isEndless, reducer } from "@/lib/scrabble-slam/reducer";
import type { PowerUpId } from "@/lib/scrabble-slam/powerups";
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
import { PowerUpRail } from "./PowerUpRail";
import { RescueToast } from "./RescueToast";
import { EndScreen } from "./EndScreen";

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
  const lastRescueId = useRef<number | null>(null);
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

  useEffect(() => {
    if (state.feedback && state.feedback.id !== lastFeedbackId.current) {
      lastFeedbackId.current = state.feedback.id;
      const kind = state.feedback.kind;
      if (kind === "valid") sound.valid();
      else if (kind === "invalid" || kind === "blocked") {
        sound.invalid();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(70);
        }
      } else if (kind === "power") sound.action();
    }
  }, [state.feedback]);

  useEffect(() => {
    if (state.rescue && state.rescue.id !== lastRescueId.current) {
      lastRescueId.current = state.rescue.id;
      sound.rescue();
    }
  }, [state.rescue]);

  useEffect(() => {
    if (state.status !== lastStatus.current) {
      lastStatus.current = state.status;
      if (state.status === "won") sound.win();
      if (state.status === "timeout") sound.timeout();
    }
  }, [state.status]);

  function handleDragStart(card: Card, e: React.DragEvent) {
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingCardId(card.id);
  }

  function handleTapSlot(slotIndex: number) {
    if (!armedCardId) return;
    dispatch({ type: "PLACE_LETTER", cardId: armedCardId, slotIndex });
    setArmedCardId(null);
  }

  function handleUsePowerUp(powerUp: PowerUpId) {
    dispatch({ type: "USE_POWER_UP", powerUp });
  }

  const endless = isEndless(state);
  const timeLeft = endless ? 0 : Math.max(0, (state.endAt - state.now) / 1000);
  const elapsed = Math.max(0, (state.now - state.startedAt) / 1000);
  const shakingCardId =
    state.feedback?.kind === "invalid" ? state.feedback.cardId : null;

  return (
    <div className="min-h-svh flex flex-col justify-center py-8">
      {state.status === "idle" && (
        <StartScreen
          onStart={(dictionaryId, wordLength, duration) =>
            dispatch({ type: "START", dictionaryId, wordLength, duration })
          }
          onExit={onExit}
        />
      )}

      {state.status === "playing" && (
        <div className="flex flex-col gap-8 sm:gap-10">
          <Hud
            dictionaryId={state.dictionaryId}
            endless={endless}
            timeLeft={timeLeft}
            elapsed={elapsed}
            duration={state.duration}
            cardsLeft={state.hand.length}
            maxHand={MAX_HAND}
            wordsPlayed={state.wordsPlayed}
            canSwap={!!armedCardId}
            muted={muted}
            onDraw={() => dispatch({ type: "DRAW_CARD" })}
            onSwap={() => {
              if (armedCardId) dispatch({ type: "SWAP_CARD", cardId: armedCardId });
              setArmedCardId(null);
            }}
            onShuffle={() => dispatch({ type: "SHUFFLE_HAND" })}
            onToggleMute={() => setMuted(!muted)}
            onQuit={() => dispatch({ type: "RESET" })}
          />

          <WordGrid
            word={state.word}
            now={state.now}
            feedback={state.feedback}
            hintedSlot={state.hint?.slotIndex ?? null}
            hasArmedLetter={!!armedCardId}
            onDropLetter={(cardId, slotIndex) =>
              dispatch({ type: "PLACE_LETTER", cardId, slotIndex })
            }
            onTapSlot={handleTapSlot}
          />

          <PlayerHand
            hand={state.hand}
            armedCardId={armedCardId}
            shakingCardId={shakingCardId}
            hintedCardId={state.hint?.cardId ?? null}
            draggingCardId={draggingCardId}
            onArm={(id) => setArmedCardId(id === "" ? null : id)}
            onDragStart={handleDragStart}
            onDragEnd={() => setDraggingCardId(null)}
          />

          <PowerUpRail
            cooldowns={state.cooldowns}
            onUse={handleUsePowerUp}
            unavailable={endless ? { freeze: "No timer" } : undefined}
          />

          <RescueToast rescue={state.rescue} />
        </div>
      )}

      {(state.status === "won" || state.status === "timeout") && (
        <EndScreen
          status={state.status}
          word={state.word}
          wordLength={state.wordLength}
          dictionaryId={state.dictionaryId}
          duration={state.duration}
          secondsLeft={timeLeft}
          cardsLeft={state.hand.length}
          wordsPlayed={state.wordsPlayed}
          draws={state.draws}
          swaps={state.swaps}
          rescues={state.rescues}
          onPlayAgain={() => dispatch({ type: "RESET" })}
        />
      )}
    </div>
  );
}
