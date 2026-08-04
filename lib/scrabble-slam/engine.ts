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

export const HAND_SIZE = 12;

/** Hard ceiling on how many cards you can ever hold. Draws, and the
    stuck-rescue bonus, both stop here rather than growing the hand forever. */
export const MAX_HAND = 15;

/** Cards added when a no-moves rescue fires. The difficulty dial: at 2 the
    hand shrinks steadily at 4 and 5 letters and slowly at 6. */
export const RESCUE_CARDS = 2;

export function dealHand(handSize: number = HAND_SIZE): Card[] {
  // Guarantee a playable-feeling hand: at least a third of it is vowels.
  const vowels = ["a", "e", "i", "o", "u"];
  const minVowels = Math.ceil(handSize / 3);
  const letters: string[] = [];
  for (let i = 0; i < minVowels; i++) letters.push(pickRandom(vowels));
  while (letters.length < handSize) letters.push(randomLetter());
  return shuffle(letters.map((l) => makeLetterCard(l)));
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Picks `take` distinct indexes out of `count`. */
function randomIndexes(count: number, take: number): Set<number> {
  const idx = Array.from({ length: count }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return new Set(idx.slice(0, Math.min(take, count)));
}

/** Replaces `count` random cards with fresh letters. Hand size is unchanged. */
export function rerollCards(hand: Card[], count: number): Card[] {
  const replace = randomIndexes(hand.length, count);
  return hand.map((c, i) => (replace.has(i) ? makeLetterCard() : c));
}

/* ---------- Starter word ---------- */

export function pickStarterWord(
  dictionary: Dictionary,
  length: WordLength,
  exclude?: string
): string {
  // Prefer the curated everyday-word pool so a round never opens on
  // something obscure; fall back to the full list for dictionaries that
  // don't define one (e.g. the hand-written tech list).
  const pool = dictionary.starters[length]?.length
    ? dictionary.starters[length]!
    : dictionary.wordsByLength[length];

  // Plenty of words are dead ends — no single-letter change makes another
  // word at all (roughly 30% of 6-letter words). Opening on one would be
  // an instantly unplayable round, so keep drawing until we get a live one.
  for (let attempt = 0; attempt < 60; attempt++) {
    const candidate = pickRandom(pool);
    if (candidate !== exclude && hasSuccessor(candidate, dictionary)) {
      return candidate;
    }
  }
  return pickRandom(pool);
}

/** True when SOME letter in some slot makes a different valid word — i.e.
    the board can be advanced at all, regardless of what's in hand. */
export function hasSuccessor(word: string, dictionary: Dictionary): boolean {
  for (let slot = 0; slot < word.length; slot++) {
    for (const letter of ALPHABET) {
      if (tryPlaceLetter(word, slot, letter, dictionary).ok) return true;
    }
  }
  return false;
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

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

/** True when at least one card in hand makes a legal word. */
export function hasMove(
  word: string,
  hand: Card[],
  dictionary: Dictionary
): boolean {
  for (let slot = 0; slot < word.length; slot++) {
    for (const card of hand) {
      if (tryPlaceLetter(word, slot, card.letter, dictionary).ok) return true;
    }
  }
  return false;
}

/* ---------- Getting unstuck ---------- */

export type Rescue = {
  hand: Card[];
  added: number;
  rerolled: number;
  /** Set when the board word itself was a dead end and had to be replaced. */
  word: string | null;
};

/**
 * Called after anything that changes the word or the hand: if no legal move
 * exists at all, the player is dead in the water through no fault of their
 * own. So the hand is reshuffled and grown by 2 — a real cost, since winning
 * means emptying it, but strictly better than being unable to move.
 *
 * Two cards is the whole price, never more. If they still don't open up a
 * move (or the hand was already at MAX_HAND, where there's nowhere to grow),
 * it rerolls dead letters in place until one exists, so the player is never
 * handed a position they can't move from. Returns null when they weren't
 * actually stuck.
 *
 * The board word can also be the dead end all by itself — no letter in any
 * slot makes another word, so no hand could ever move. That's the board's
 * fault, not the player's, so the word is replaced too.
 */
export function resolveStuck(
  word: string,
  hand: Card[],
  dictionary: Dictionary
): Rescue | null {
  if (hand.length === 0) return null;
  if (hasMove(word, hand, dictionary)) return null;

  const freshWord = hasSuccessor(word, dictionary)
    ? null
    : pickStarterWord(dictionary, word.length as WordLength, word);
  const target = freshWord ?? word;

  // The 2-card price is for not holding the right letters. When the board
  // word itself was the dead end no hand could have played it, so charging
  // for that would be punishing the player for the game's dealing.
  const grow = freshWord
    ? 0
    : Math.min(RESCUE_CARDS, Math.max(0, MAX_HAND - hand.length));

  // The whole hand is redrawn, not just reordered. Reordering would be
  // cosmetic — the cards that couldn't play still couldn't play — and the
  // dead letters would pile up until every turn needed a rescue. Redrawing
  // is what makes the 2-card price a real trade instead of a tax.
  let next = [
    ...hand.map(() => makeLetterCard()),
    ...Array.from({ length: grow }, () => makeLetterCard()),
  ];
  let rerolled = hand.length;

  // Bounded so a pathological dictionary can never hang the reducer.
  for (let attempt = 0; attempt < 60 && !hasMove(target, next, dictionary); attempt++) {
    next = rerollCards(next, 2);
    rerolled += 2;
  }

  return { hand: shuffle(next), added: grow, rerolled, word: freshWord };
}
