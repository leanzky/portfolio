import standardWords from "./standard-words.json";
import techWords from "./tech-words.json";
import { Trie } from "./trie";

export type WordLength = 4 | 5 | 6;
export type DictionaryId = "standard" | "tech" | "hardcore";

export type Dictionary = {
  id: DictionaryId;
  label: string;
  description: string;
  /** Word lengths this dictionary is played at (hardcore is 6-only). */
  lengths: WordLength[];
  wordsByLength: Record<WordLength, string[]>;
  /**
   * Everyday words the board is allowed to OPEN on, per length. Much
   * smaller and stricter than the validation set above, so a round never
   * starts on something obscure even though the Trie accepts a far wider
   * vocabulary. (Wordle uses the same split: small answer list, large
   * accepted-guess list.) Falls back to the full list when absent.
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
  lengths: WordLength[],
  source: WordsFile
): Dictionary {
  const wordsByLength: WordsByLength = {
    4: source[4],
    5: source[5],
    6: source[6],
  };
  const allWords = lengths.flatMap((len) => wordsByLength[len]);
  return {
    id,
    label,
    description,
    lengths,
    wordsByLength,
    starters: source.starters ?? {},
    trie: new Trie(allWords),
  };
}

const standardSource = standardWords as unknown as WordsFile;
const techSource = techWords as unknown as WordsFile;

export const dictionaries: Record<DictionaryId, Dictionary> = {
  standard: buildDictionary(
    "standard",
    "Standard English",
    "Common everyday words. The friendliest place to start.",
    [4, 5],
    standardSource
  ),
  tech: buildDictionary(
    "tech",
    "Tech Terminology",
    "Programming and software words. For the developers in the room.",
    [4, 5],
    techSource
  ),
  hardcore: buildDictionary(
    "hardcore",
    "Hardcore 6-Letter",
    "Six-letter words only. No expanding, no mercy.",
    [6],
    standardSource
  ),
};

export function pickRandom<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
