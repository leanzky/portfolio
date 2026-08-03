import { Dictionary, pickRandom, WordLength } from "./dictionary";

/* ---------- Card model ---------- */

export type LetterCard = {
  id: string;
  kind: "letter";
  letter: string;
};

export type ActionKind = "freeze" | "chaos" | "expand";

export type ActionCard = {
  id: string;
  kind: "action";
  action: ActionKind;
  /** Expand cards carry the letter that gets appended to the word. */
  letter?: string;
};

export type Card = LetterCard | ActionCard;

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

export function makeActionCard(action: ActionKind): ActionCard {
  return {
    id: nextCardId("a"),
    kind: "action",
    action,
    letter: action === "expand" ? randomLetter() : undefined,
  };
}

/* ---------- Dealing a starting hand ---------- */

export type DealOptions = {
  handSize: number;
  /** Hardcore mode has no room to grow, so Expand cards are omitted there. */
  includeExpand: boolean;
};

export function dealHand({ handSize, includeExpand }: DealOptions): Card[] {
  const actionKinds: ActionKind[] = includeExpand
    ? ["freeze", "chaos", "expand"]
    : ["freeze", "chaos"];

  const actionCards = actionKinds.map(makeActionCard);
  const letterCount = handSize - actionCards.length;

  // Guarantee a playable-feeling hand: at least a third of letters are vowels.
  const vowels = ["a", "e", "i", "o", "u"];
  const minVowels = Math.ceil(letterCount / 3);
  const letters: string[] = [];
  for (let i = 0; i < minVowels; i++) letters.push(pickRandom(vowels));
  while (letters.length < letterCount) letters.push(randomLetter());

  const letterCards = letters.map((l) => makeLetterCard(l));
  return shuffle([...letterCards, ...actionCards]);
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

export function pickStarterWord(dictionary: Dictionary): {
  word: string;
  length: WordLength;
} {
  const length = dictionary.lengths.includes(4) ? 4 : dictionary.lengths[0];
  const word = pickRandom(dictionary.wordsByLength[length]);
  return { word, length };
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
  frozenSlots: ReadonlySet<number>
): PlayResult {
  if (frozenSlots.has(slotIndex)) return { ok: false, reason: "frozen" };

  const nextWord =
    word.slice(0, slotIndex) + letter.toLowerCase() + word.slice(slotIndex + 1);

  if (nextWord === word) return { ok: false, reason: "same-word" };
  if (!dictionary.trie.has(nextWord)) return { ok: false, reason: "not-a-word" };

  return { ok: true, nextWord };
}

/** Append a letter to grow a 4-letter word to 5 (the Expand action). */
export function tryExpandWord(
  word: string,
  letter: string,
  dictionary: Dictionary
): PlayResult {
  const nextWord = word + letter.toLowerCase();
  if (!dictionary.trie.has(nextWord)) return { ok: false, reason: "not-a-word" };
  return { ok: true, nextWord };
}
