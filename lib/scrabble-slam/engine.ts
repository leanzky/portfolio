import { Dictionary, pickRandom, WordLength } from "./dictionary";

/* ---------- Card model ----------
   Hands are letters only. Abilities live on the power-up rail with their
   own cooldowns (see powerups.ts) rather than taking up hand slots. */

export type LetterCard = {
  id: string;
  kind: "letter";
  letter: string;
};

export type Card = LetterCard;

/* ---------- Letter frequency (approximates Scrabble tile distribution,
   so common letters like vowels come up often enough to find a play) ---------- */

const LETTER_FREQUENCIES: [string, number][] = [
  ["e", 12], ["a", 9], ["i", 9], ["o", 8], ["n", 6], ["r", 6], ["t", 6],
  ["l", 4], ["s", 4], ["u", 4], ["d", 4], ["g", 3], ["b", 2], ["c", 2],
  ["m", 2], ["p", 2], ["f", 2], ["h", 2], ["v", 2], ["w", 2], ["y", 2],
  ["k", 1], ["j", 1], ["q", 1], ["x", 1], ["z", 1],
];

const LETTER_POOL: string[] = LETTER_FREQUENCIES.flatMap(([letter, count]) =>
  Array(count).fill(letter)
);

export function randomLetter(): string {
  return pickRandom(LETTER_POOL);
}

let cardIdCounter = 0;
function nextCardId(prefix: string): string {
  cardIdCounter += 1;
  return `${prefix}-${cardIdCounter}-${Date.now().toString(36)}`;
}

export function makeLetterCard(letter: string = randomLetter()): LetterCard {
  return { id: nextCardId("l"), kind: "letter", letter };
}

/* ---------- Dealing a starting hand ---------- */

export const HAND_SIZE = 16;

export function dealHand(handSize: number = HAND_SIZE): Card[] {
  // Guarantee a playable-feeling hand: at least a third of it is vowels.
  const vowels = ["a", "e", "i", "o", "u"];
  const minVowels = Math.ceil(handSize / 3);
  const letters: string[] = [];
  for (let i = 0; i < minVowels; i++) letters.push(pickRandom(vowels));
  while (letters.length < handSize) letters.push(randomLetter());
  return shuffle(letters.map((l) => makeLetterCard(l)));
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ---------- Starter word ---------- */

export function pickStarterWord(
  dictionary: Dictionary,
  length: WordLength
): string {
  // Prefer the curated everyday-word pool so a round never opens on
  // something obscure; fall back to the full list for dictionaries that
  // don't define one (e.g. the hand-written tech list).
  const pool = dictionary.starters[length]?.length
    ? dictionary.starters[length]!
    : dictionary.wordsByLength[length];
  return pickRandom(pool);
}

/* ---------- Play validation ---------- */

export type PlayResult =
  | { ok: true; nextWord: string }
  | { ok: false; reason: "frozen" | "same-word" | "not-a-word" };

/** Replace one slot of `word` with `letter` and check dictionary validity. */
export function tryPlaceLetter(
  word: string,
  slotIndex: number,
  letter: string,
  dictionary: Dictionary,
  frozenSlots: ReadonlySet<number> = new Set()
): PlayResult {
  if (frozenSlots.has(slotIndex)) return { ok: false, reason: "frozen" };

  const nextWord =
    word.slice(0, slotIndex) + letter.toLowerCase() + word.slice(slotIndex + 1);

  if (nextWord === word) return { ok: false, reason: "same-word" };
  if (!dictionary.trie.has(nextWord)) return { ok: false, reason: "not-a-word" };

  return { ok: true, nextWord };
}

/**
 * Finds any legal move available from the current hand — the slot to change
 * and the card to use. Powers the Hint ability.
 */
export function findHint(
  word: string,
  hand: Card[],
  dictionary: Dictionary
): { slotIndex: number; cardId: string } | null {
  const options: { slotIndex: number; cardId: string }[] = [];
  for (let slot = 0; slot < word.length; slot++) {
    for (const card of hand) {
      const result = tryPlaceLetter(word, slot, card.letter, dictionary);
      if (result.ok) options.push({ slotIndex: slot, cardId: card.id });
    }
  }
  return options.length ? pickRandom(options) : null;
}
