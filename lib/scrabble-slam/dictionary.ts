import standardWords from "./standard-words.json";
import techWords from "./tech-words.json";
import { Trie } from "./trie";

export type WordLength = 4 | 5 | 6;
export type DictionaryId = "standard" | "tech";

export const WORD_LENGTHS: WordLength[] = [4, 5, 6];

export type Dictionary = {
  id: DictionaryId;
  label: string;
  description: string;
  wordsByLength: Record<WordLength, string[]>;
  /**
   * Everyday words the board is allowed to OPEN on, per length. Much
   * smaller and stricter than the validation set, so a round never starts
   * on something obscure even though the Trie accepts a far wider
   * vocabulary. (Wordle uses the same split.) Falls back to the full list.
   */
  starters: Partial<Record<WordLength, string[]>>;
  trie: Trie;
};

type WordsByLength = Record<WordLength, string[]>;
type WordsFile = WordsByLength & {
  starters?: Partial<Record<WordLength, string[]>>;
};

function buildDictionary(
  id: DictionaryId,
  label: string,
  description: string,
  source: WordsFile
): Dictionary {
  const wordsByLength: WordsByLength = {
    4: source[4],
    5: source[5],
    6: source[6],
  };
  // Words never change length during a round, so one Trie across all
  // supported lengths is enough — a 4-letter word can only ever become
  // another 4-letter word.
  const allWords = WORD_LENGTHS.flatMap((len) => wordsByLength[len]);
  return {
    id,
    label,
    description,
    wordsByLength,
    starters: source.starters ?? {},
    trie: new Trie(allWords),
  };
}

const standardSource = standardWords as unknown as WordsFile;
const techSource = techWords as unknown as WordsFile;

export const dictionaries: Record<DictionaryId, Dictionary> = {
  // Labels are i18n keys, resolved at render time (see lib/scrabble-slam/i18n.ts).
  standard: buildDictionary(
    "standard",
    "dict.standard.label",
    "dict.standard.desc",
    standardSource
  ),
  tech: buildDictionary("tech", "dict.tech.label", "dict.tech.desc", techSource),
};

export function pickRandom<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
