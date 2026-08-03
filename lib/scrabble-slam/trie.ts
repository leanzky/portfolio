/**
 * Prefix tree (Trie) for O(word length) dictionary lookups, per the
 * design doc's "Data Structures" spec: "Loading the word list into
 * memory using a Trie (Prefix Tree) guarantees microsecond lookups."
 *
 * In this single-player build the Trie lives in the browser (there is
 * no server yet — see the README section on Phase 2 multiplayer). The
 * same class is written so it can be dropped unchanged into a Node
 * backend or Supabase Edge Function later for authoritative validation.
 */

type TrieNode = {
  children: Map<string, TrieNode>;
  isWord: boolean;
};

function createNode(): TrieNode {
  return { children: new Map(), isWord: false };
}

export class Trie {
  private root: TrieNode = createNode();

  constructor(words: string[] = []) {
    for (const word of words) this.insert(word);
  }

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      let next = node.children.get(ch);
      if (!next) {
        next = createNode();
        node.children.set(ch, next);
      }
      node = next;
    }
    node.isWord = true;
  }

  /** Exact word membership check (case-insensitive). */
  has(word: string): boolean {
    let node = this.root;
    for (const ch of word.toLowerCase()) {
      const next = node.children.get(ch);
      if (!next) return false;
      node = next;
    }
    return node.isWord;
  }
}
