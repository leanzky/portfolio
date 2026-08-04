"use client";

import { dictionaries, DictionaryId } from "@/lib/scrabble-slam/dictionary";
import { MAX_HAND } from "@/lib/scrabble-slam/engine";
import { useT } from "./LanguageToggle";
import styles from "./game.module.css";

function formatElapsed(seconds: number): string {
  const total = Math.floor(Math.max(0, seconds));
  const mins = Math.floor(total / 60);
  return `${mins}:${String(total % 60).padStart(2, "0")}`;
}

export function Hud({
  dictionaryId,
  endless,
  timeLeft,
  elapsed,
  duration,
  cardsLeft,
  maxHand,
  wordsPlayed,
  canSwap,
  disabled = false,
  muted,
  onDraw,
  onSwap,
  onShuffle,
  onPass,
  onToggleMute,
  onQuit,
}: {
  dictionaryId: DictionaryId;
  endless: boolean;
  timeLeft: number;
  elapsed: number;
  duration: number;
  cardsLeft: number;
  /** Hand ceiling. Omitted means uncapped. */
  maxHand?: number;
  wordsPlayed: number;
  canSwap: boolean;
  /** True when it isn't your turn: actions are visible but inert. */
  disabled?: boolean;
  muted: boolean;
  onDraw: () => void;
  onSwap: () => void;
  onShuffle?: () => void;
  /** Multiplayer only: hand the turn on without playing. */
  onPass?: () => void;
  onToggleMute: () => void;
  onQuit: () => void;
}) {
  const t = useT();
  const urgent = !endless && timeLeft <= 10;
  const pct = endless ? 1 : Math.max(0, Math.min(1, timeLeft / duration));
  const handFull = maxHand !== undefined && cardsLeft >= maxHand;

  const btn =
    "rounded-lg border border-green-800 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-green-400 hover:border-green-500 hover:text-green-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 font-mono">
      <div className="flex items-center justify-between gap-3 text-sm">
        <button
          onClick={onQuit}
          className="text-green-700 hover:text-green-300 transition-colors"
        >
          {t("hud.quit")}
        </button>
        <span className="uppercase tracking-widest text-green-600 text-xs">
          {t(dictionaries[dictionaryId].label)}
          {endless && <span className="text-lime-400"> · {t("timer.endless")}</span>}
        </span>
        <button
          onClick={onToggleMute}
          className="text-green-700 hover:text-green-300 transition-colors"
          aria-label={muted ? t("hud.unmute") : t("hud.mute")}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-4">
        {endless ? (
          <div
            className="font-bold text-2xl tabular-nums text-green-50"
            title={t("hud.elapsedHelp")}
          >
            {formatElapsed(elapsed)}
          </div>
        ) : (
          <div
            className={`font-bold text-2xl tabular-nums ${
              urgent ? `text-rose-400 ${styles.timerUrgent}` : "text-green-50"
            }`}
          >
            {Math.ceil(timeLeft)}s
          </div>
        )}

        <div className="flex-1 h-2 rounded-full bg-green-950 overflow-hidden">
          {endless ? (
            // No clock to drain, so the bar shows progress toward the real
            // win condition instead: emptying the hand.
            <div
              className="h-full rounded-full bg-lime-400 transition-[width] duration-200 ease-linear"
              style={{
                width: `${Math.max(0, 1 - cardsLeft / (maxHand ?? MAX_HAND)) * 100}%`,
              }}
            />
          ) : (
            <div
              className={`h-full rounded-full transition-[width] duration-200 ease-linear ${
                urgent ? "bg-rose-500" : "bg-green-400"
              }`}
              style={{ width: `${pct * 100}%` }}
            />
          )}
        </div>

        <div className="font-bold text-lg text-lime-300 whitespace-nowrap">
          {t("hud.left", { n: cardsLeft })}
        </div>
      </div>

      <div className="mt-2 text-center text-[11px] uppercase tracking-wide text-green-800">
        {wordsPlayed === 1
          ? t("hud.wordPlayed", { n: wordsPlayed })
          : t("hud.wordsPlayed", { n: wordsPlayed })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
        {onShuffle && (
          <button onClick={onShuffle} className={btn} title={t("hud.shuffleHelp")}>
            {t("hud.shuffle")}
          </button>
        )}
        <button
          onClick={onDraw}
          disabled={handFull || disabled}
          className={btn}
          title={handFull ? t("hud.handFull", { max: maxHand ?? "" }) : t("hud.drawHelp")}
        >
          {t("hud.draw")}
          {maxHand !== undefined && ` ${cardsLeft}/${maxHand}`}
        </button>
        {!endless && (
          <button
            onClick={onSwap}
            disabled={!canSwap || disabled}
            className={btn}
            title={t("hud.swapHelp")}
          >
            {t("hud.swap")}
          </button>
        )}
        {onPass && (
          <button onClick={onPass} disabled={disabled} className={btn}>
            {t("turn.pass")}
          </button>
        )}
      </div>
    </div>
  );
}
