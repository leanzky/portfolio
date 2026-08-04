import standardWords from "./standard-words.json";
import techWords from "./tech-words.json";
import chineseWords from "./chinese-words.json";
import { Trie } from "./trie";

/** Tiles in a word. English plays 4–6 letters, Chinese 2 characters. */
export type WordLength = number;
export type DictionaryId = "standard" | "tech" | "chinese";

/** Latin letters and Han characters need different hands, fonts and sizes. */
export type Script = "latin" | "han";

const LATIN_LENGTHS: WordLength[] = [4, 5, 6];

/** Default lengths, used before a dictionary has been chosen. */
export const WORD_LENGTHS = LATIN_LENGTHS;

export type Dictionary = {
  id: DictionaryId;
  /** i18n key, resolved at render time. */
  label: string;
  description: string;
  script: Script;
  /** Word lengths this dictionary supports. */
  lengths: WordLength[];
  wordsByLength: Record<WordLength, string[]>;
  /**
   * Everyday words the board is allowed to OPEN on, per length. Much
   * smaller and stricter than the validation set, so a round never starts
   * on something obscure even though the Trie accepts a far wider
   * vocabulary. (Wordle uses the same split.) Falls back to the full list.
   */
  starters: Partial<Record<WordLength, string[]>>;
  /** Every tile that can appear — this dictionary's "alphabet". */
  alphabet: string[];
  /** The same tiles repeated by frequency, to draw a hand from. */
  pool: string[];
  /**
   * Cards handed over by a no-moves rescue. Two slots give a hand half the
   * chances four do, so the same penalty bites twice as hard: measured over
   * 30 rounds, +2 leaves Chinese at break-even (a rescue on 49% of turns,
   * ~550 plays to finish), while +1 lands at ~22 plays, in line with the
   * English game's ~30.
   */
  rescueCards: number;
  /** Chinese is solo-only: the server has no Han word table. */
  soloOnly?: boolean;
  trie: Trie;
};

type WordsFile = Record<string, unknown>;

/* ---------- Latin letter frequency (approximates the Scrabble tile
   distribution, so vowels come up often enough to find a play) ---------- */

const LETTER_FREQUENCIES: [string, number][] = [
  ["e", 12], ["a", 9], ["i", 9], ["o", 8], ["n", 6], ["r", 6], ["t", 6],
  ["l", 4], ["s", 4], ["u", 4], ["d", 4], ["g", 3], ["b", 2], ["c", 2],
  ["m", 2], ["p", 2], ["f", 2], ["h", 2], ["v", 2], ["w", 2], ["y", 2],
  ["k", 1], ["j", 1], ["q", 1], ["x", 1], ["z", 1],
];

const LATIN_ALPHABET = LETTER_FREQUENCIES.map(([l]) => l);
const LATIN_POOL = LETTER_FREQUENCIES.flatMap(([letter, count]) =>
  Array<string>(count).fill(letter)
);

type BuildOpts = {
  script: Script;
  lengths: WordLength[];
  alphabet: string[];
  pool: string[];
  rescueCards: number;
  soloOnly?: boolean;
};

function buildDictionary(
  id: DictionaryId,
  label: string,
  description: string,
  source: WordsFile,
  opts: BuildOpts
): Dictionary {
  const wordsByLength: Record<WordLength, string[]> = {};
  for (const len of opts.lengths) {
    wordsByLength[len] = (source[String(len)] as string[] | undefined) ?? [];
  }
  // Words never change length during a round, so one Trie across all
  // supported lengths is enough — a 4-letter word can only ever become
  // another 4-letter word.
  const allWords = opts.lengths.flatMap((len) => wordsByLength[len]);
  return {
    id,
    label,
    description,
    script: opts.script,
    lengths: opts.lengths,
    wordsByLength,
    starters:
      (source.starters as Partial<Record<WordLength, string[]>> | undefined) ??
      {},
    alphabet: opts.alphabet,
    pool: opts.pool,
    rescueCards: opts.rescueCards,
    soloOnly: opts.soloOnly,
    trie: new Trie(allWords),
  };
}

const latin: Omit<BuildOpts, "soloOnly"> = {
  script: "latin",
  lengths: LATIN_LENGTHS,
  alphabet: LATIN_ALPHABET,
  pool: LATIN_POOL,
  rescueCards: 2,
};

const chineseSource = chineseWords as unknown as WordsFile;

export const dictionaries: Record<DictionaryId, Dictionary> = {
  // Labels are i18n keys, resolved at render time (see lib/scrabble-slam/i18n.ts).
  standard: buildDictionary(
    "standard",
    "dict.standard.label",
    "dict.standard.desc",
    standardWords as unknown as WordsFile,
    latin
  ),
  tech: buildDictionary(
    "tech",
    "dict.tech.label",
    "dict.tech.desc",
    techWords as unknown as WordsFile,
    latin
  ),
  // The same game in another script: a two-character 词, swap one 字 for
  // another to make a new real word (国家 -> 大家 -> 作家 -> 专家).
  //
  // The character inventory is deliberately closed at 250, exactly as Latin
  // play is closed at 26. Drawing from all ~3,000 common characters was
  // measured at a 44% chance of holding any legal move; closing the set
  // takes that to 84%, in line with the English game's 76%.
  chinese: buildDictionary(
    "chinese",
    "dict.chinese.label",
    "dict.chinese.desc",
    chineseSource,
    {
      script: "han",
      lengths: [2],
      alphabet: chineseSource.chars as string[],
      pool: chineseSource.pool as string[],
      rescueCards: 1,
      soloOnly: true,
    }
  ),
};

/** Dictionaries the multiplayer server can actually validate. */
export const multiplayerDictionaries = Object.values(dictionaries).filter(
  (d) => !d.soloOnly
);

export function pickRandom<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
