import type { WordLength } from "./dictionary";

/**
 * One number to rank runs by. The shape of it is the game telling you what
 * it wants: make lots of words, on longer boards, fast, without leaning on
 * draws or bailouts.
 */

export const LENGTH_MULTIPLIER: Record<WordLength, number> = {
  4: 1,
  5: 1.3,
  6: 1.6,
};

export type ScoreInput = {
  won: boolean;
  wordsPlayed: number;
  wordLength: WordLength;
  /** Seconds left on the clock. Ignored when untimed. */
  secondsLeft: number;
  /** 0 means Endless (no timer). */
  duration: number;
  draws: number;
  rescues: number;
};

export type ScoreBreakdown = {
  total: number;
  words: number;
  winBonus: number;
  timeBonus: number;
  penalties: number;
};

export function computeScore(input: ScoreInput): ScoreBreakdown {
  const timed = input.duration > 0;
  const multiplier = LENGTH_MULTIPLIER[input.wordLength];

  const words = Math.round(input.wordsPlayed * 100 * multiplier);

  // Endless has no clock to beat, so its win is worth less than a timed one.
  const winBonus = input.won ? (timed ? 500 : 250) : 0;

  const timeBonus =
    input.won && timed ? Math.round(Math.max(0, input.secondsLeft) * 10) : 0;

  // Both of these hand you cards you didn't earn, so both cost you.
  const penalties = input.draws * 40 + input.rescues * 60;

  return {
    total: Math.max(0, words + winBonus + timeBonus - penalties),
    words,
    winBonus,
    timeBonus,
    penalties,
  };
}
