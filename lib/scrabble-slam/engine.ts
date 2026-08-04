import { Dictionary, dictionaries, pickRandom } from "./dictionary";

/* ---------- Card model ----------
   Hands are letters only. Abilities live on the power-up rail with their
   own cooldowns (see powerups.ts) rather than taking up hand slots. */

export type LetterCard = {
  id: string;
  kind: "letter";
  letter: string;
};

export type Card = LetterCard;

/* ---------- Tiles ----------
   Which tiles exist is the dictionary's business, not the engine's. Latin
   play draws from 26 letters on a Scrabble-like distribution; Chinese from
   a closed inventory of 250 characters weighted by how often each is used. */

const DEFAULT_DICTIONARY = dictionaries.standard;

export function randomLetter(dictionary: Dictionary = DEFAULT_DICTIONARY): string {
  return pickRandom(dictionary.pool);
}

let cardIdCounter = 0;
function nextCardId(prefix: string): string {
  cardIdCounter += 1;
  return `${prefix}-${cardIdCounter}-${Date.now().toString(36)}`;
}

export function makeLetterCard(letter: string = randomLetter()): LetterCard {
  return { id: nextCardId("l"), kind: "letter", letter };
}

/** A fresh tile drawn from a specific dictionary's pool. */
export function drawCard(dictionary: Dictionary): LetterCard {
  return makeLetterCard(randomLetter(dictionary));
}

/* ---------- Dealing a starting hand ---------- */

export const HAND_SIZE = 12;

/** Hard ceiling on how many cards you can ever hold. Draws, and the
    stuck-rescue bonus, both stop here rather than growing the hand forever. */
export const MAX_HAND = 15;

/** Fallback rescue cost for dictionaries that don't state one. The real
    dial is `Dictionary.rescueCards`, which varies by script. */
export const RESCUE_CARDS = 2;

/**
 * Deals a hand that can actually do something. A purely random opening hand
 * has no legal move 4% of the time in English and 16% in Chinese (two slots
 * instead of four), and opening a round on an instant rescue reads as a bug.
 */
export function dealPlayableHand(
  dictionary: Dictionary,
  word: string,
  handSize: number = HAND_SIZE
): Card[] {
  let hand = dealHand(dictionary, handSize);
  for (let attempt = 0; attempt < 25 && !hasMove(word, hand, dictionary); attempt++) {
    hand = dealHand(dictionary, handSize);
  }
  return hand;
}

export function dealHand(
  dictionary: Dictionary = DEFAULT_DICTIONARY,
  handSize: number = HAND_SIZE
): Card[] {
  const letters: string[] = [];
  if (dictionary.script === "latin") {
    // Guarantee a playable-feeling hand: at least a third of it is vowels.
    // Han has no equivalent distinction - its weighted pool already biases
    // toward the characters that combine into the most words.
    const vowels = ["a", "e", "i", "o", "u"];
    const minVowels = Math.ceil(handSize / 3);
    for (let i = 0; i < minVowels; i++) letters.push(pickRandom(vowels));
  }
  while (letters.length < handSize) letters.push(randomLetter(dictionary));
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

/** Replaces `count` random cards with fresh tiles. Hand size is unchanged. */
export function rerollCards(
  hand: Card[],
  count: number,
  dictionary: Dictionary = DEFAULT_DICTIONARY
): Card[] {
  const replace = randomIndexes(hand.length, count);
  return hand.map((c, i) => (replace.has(i) ? drawCard(dictionary) : c));
}

/* ---------- Starter word ---------- */

export function pickStarterWord(
  dictionary: Dictionary,
  length: number,
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
  const slots = Array.from(word).length;
  for (let slot = 0; slot < slots; slot++) {
    // The dictionary's own alphabet rather than a hardcoded a-z: for Chinese
    // that is the 250-character inventory.
    for (const letter of dictionary.alphabet) {
      if (tryPlaceLetter(word, slot, letter, dictionary).ok) return true;
    }
  }
  return false;
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

  // Index by codepoint, not UTF-16 code unit: a tile is one character in
  // either script, and Array.from splits on codepoints.
  const tiles = Array.from(word);
  if (slotIndex < 0 || slotIndex >= tiles.length) {
    return { ok: false, reason: "not-a-word" };
  }
  // Only Latin has a case to normalise; Han characters pass through as-is.
  const replacement = /[A-Za-z]/.test(letter) ? letter.toLowerCase() : letter;
  const nextWord = tiles
    .map((t, i) => (i === slotIndex ? replacement : t))
    .join("");

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
  const slots = Array.from(word).length;
  for (let slot = 0; slot < slots; slot++) {
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
  const slots = Array.from(word).length;
  for (let slot = 0; slot < slots; slot++) {
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
    : pickStarterWord(dictionary, Array.from(word).length, word);
  const target = freshWord ?? word;

  // The 2-card price is for not holding the right letters. When the board
  // word itself was the dead end no hand could have played it, so charging
  // for that would be punishing the player for the game's dealing.
  const grow = freshWord
    ? 0
    : Math.min(
        dictionary.rescueCards ?? RESCUE_CARDS,
        Math.max(0, MAX_HAND - hand.length)
      );

  // The whole hand is redrawn, not just reordered. Reordering would be
  // cosmetic — the cards that couldn't play still couldn't play — and the
  // dead letters would pile up until every turn needed a rescue. Redrawing
  // is what makes the 2-card price a real trade instead of a tax.
  let next = [
    ...hand.map(() => drawCard(dictionary)),
    ...Array.from({ length: grow }, () => drawCard(dictionary)),
  ];
  let rerolled = hand.length;

  // Bounded so a pathological dictionary can never hang the reducer.
  for (let attempt = 0; attempt < 60 && !hasMove(target, next, dictionary); attempt++) {
    next = rerollCards(next, 2, dictionary);
    rerolled += 2;
  }

  return { hand: shuffle(next), added: grow, rerolled, word: freshWord };
}
