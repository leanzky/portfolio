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
  trie: Trie;
};

type WordsByLength = Record<WordLength, string[]>;

function buildDictionary(
  id: DictionaryId,
  label: string,
  description: string,
  lengths: WordLength[],
  wordsByLength: WordsByLength
): Dictionary {
  const allWords = lengths.flatMap((len) => wordsByLength[len]);
  return {
    id,
    label,
    description,
    lengths,
    wordsByLength,
    trie: new Trie(allWords),
  };
}

const standardByLength = standardWords as unknown as WordsByLength;
const techByLength = techWords as unknown as WordsByLength;

export const dictionaries: Record<DictionaryId, Dictionary> = {
  standard: buildDictionary(
    "standard",
    "Standard English",
    "Common everyday words. The friendliest place to start.",
    [4, 5],
    standardByLength
  ),
  tech: buildDictionary(
    "tech",
    "Tech Terminology",
    "Programming and software words. For the developers in the room.",
    [4, 5],
    techByLength
  ),
  hardcore: buildDictionary(
    "hardcore",
    "Hardcore 6-Letter",
    "Six-letter words only. No expanding, no mercy.",
    [6],
    standardByLength
  ),
};

export function pickRandom<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
