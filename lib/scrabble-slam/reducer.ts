import { dictionaries, DictionaryId, WordLength } from "./dictionary";
import {
  Card,
  dealHand,
  findHint,
  HAND_SIZE,
  makeLetterCard,
  pickStarterWord,
  tryPlaceLetter,
} from "./engine";
import {
  Cooldowns,
  initialCooldowns,
  POWER_UP_BY_ID,
  PowerUpId,
  tickCooldowns,
} from "./powerups";

export type GameStatus = "idle" | "playing" | "won" | "timeout";

export type Feedback =
  | { id: number; kind: "valid"; slotIndex: number }
  | { id: number; kind: "invalid"; slotIndex?: number; cardId: string }
  | { id: number; kind: "power"; powerUp: PowerUpId }
  | { id: number; kind: "blocked"; powerUp: PowerUpId };

export type Hint = { slotIndex: number; cardId: string } | null;

export type GameState = {
  status: GameStatus;
  dictionaryId: DictionaryId;
  word: string;
  wordLength: WordLength;
  hand: Card[];
  cooldowns: Cooldowns;
  hint: Hint;
  now: number;
  endAt: number;
  duration: number;
  wordsPlayed: number;
  draws: number;
  swaps: number;
  feedback: Feedback | null;
};

export type GameAction =
  | {
      type: "START";
      dictionaryId: DictionaryId;
      wordLength: WordLength;
      duration: number;
    }
  | { type: "TICK"; now: number }
  | { type: "PLACE_LETTER"; cardId: string; slotIndex: number }
  | { type: "USE_POWER_UP"; powerUp: PowerUpId }
  | { type: "DRAW_CARD" }
  | { type: "SWAP_CARD"; cardId: string }
  | { type: "RESET" };

let feedbackId = 0;
function nextFeedbackId() {
  feedbackId += 1;
  return feedbackId;
}

export const initialState: GameState = {
  status: "idle",
  dictionaryId: "standard",
  word: "",
  wordLength: 4,
  hand: [],
  cooldowns: initialCooldowns(),
  hint: null,
  now: 0,
  endAt: 0,
  duration: 90,
  wordsPlayed: 0,
  draws: 0,
  swaps: 0,
  feedback: null,
};

function shuffleIndexes(count: number, take: number): Set<number> {
  const idx = Array.from({ length: count }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return new Set(idx.slice(0, take));
}

export function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START": {
      const dictionary = dictionaries[action.dictionaryId];
      const word = pickStarterWord(dictionary, action.wordLength);
      const now = Date.now();
      return {
        ...initialState,
        status: "playing",
        dictionaryId: action.dictionaryId,
        word,
        wordLength: action.wordLength,
        hand: dealHand(HAND_SIZE),
        cooldowns: initialCooldowns(),
        now,
        endAt: now + action.duration * 1000,
        duration: action.duration,
      };
    }

    case "TICK": {
      if (state.status !== "playing") return { ...state, now: action.now };
      if (action.now >= state.endAt) {
        return { ...state, now: action.now, status: "timeout" };
      }
      return { ...state, now: action.now };
    }

    case "PLACE_LETTER": {
      if (state.status !== "playing") return state;
      const card = state.hand.find((c) => c.id === action.cardId);
      if (!card) return state;

      const dictionary = dictionaries[state.dictionaryId];
      const result = tryPlaceLetter(
        state.word,
        action.slotIndex,
        card.letter,
        dictionary
      );

      if (!result.ok) {
        return {
          ...state,
          feedback: {
            id: nextFeedbackId(),
            kind: "invalid",
            slotIndex: action.slotIndex,
            cardId: card.id,
          },
        };
      }

      const nextHand = state.hand.filter((c) => c.id !== card.id);
      return {
        ...state,
        word: result.nextWord,
        hand: nextHand,
        // Playing a word is what earns abilities back.
        cooldowns: tickCooldowns(state.cooldowns),
        wordsPlayed: state.wordsPlayed + 1,
        hint: null,
        status: nextHand.length === 0 ? "won" : state.status,
        feedback: {
          id: nextFeedbackId(),
          kind: "valid",
          slotIndex: action.slotIndex,
        },
      };
    }

    case "USE_POWER_UP": {
      if (state.status !== "playing") return state;
      const def = POWER_UP_BY_ID[action.powerUp];
      if (!def) return state;

      // Still cooling down: reject with feedback instead of silently no-oping.
      if (state.cooldowns[action.powerUp] > 0) {
        return {
          ...state,
          feedback: {
            id: nextFeedbackId(),
            kind: "blocked",
            powerUp: action.powerUp,
          },
        };
      }

      const spend = (next: Partial<GameState>): GameState => ({
        ...state,
        ...next,
        cooldowns: { ...state.cooldowns, [action.powerUp]: def.cooldown },
        feedback: {
          id: nextFeedbackId(),
          kind: "power",
          powerUp: action.powerUp,
        },
      });

      switch (action.powerUp) {
        case "hint": {
          const dictionary = dictionaries[state.dictionaryId];
          const hint = findHint(state.word, state.hand, dictionary);
          // No legal move exists — don't burn the cooldown on nothing.
          if (!hint) {
            return {
              ...state,
              feedback: {
                id: nextFeedbackId(),
                kind: "blocked",
                powerUp: "hint",
              },
            };
          }
          return spend({ hint });
        }

        case "chaos": {
          const replace = shuffleIndexes(state.hand.length, Math.min(4, state.hand.length));
          return spend({
            hand: state.hand.map((c, i) => (replace.has(i) ? makeLetterCard() : c)),
            hint: null,
          });
        }

        case "freeze":
          return spend({ endAt: state.endAt + 8000 });

        case "purge": {
          const nextHand = state.hand.slice(0, Math.max(0, state.hand.length - 2));
          return spend({
            hand: nextHand,
            hint: null,
            status: nextHand.length === 0 ? "won" : state.status,
          });
        }

        default:
          return state;
      }
    }

    case "DRAW_CARD": {
      if (state.status !== "playing") return state;
      return {
        ...state,
        hand: [...state.hand, makeLetterCard()],
        draws: state.draws + 1,
      };
    }

    case "SWAP_CARD": {
      if (state.status !== "playing") return state;
      const card = state.hand.find((c) => c.id === action.cardId);
      if (!card) return state;

      const nextHand = state.hand
        .filter((c) => c.id !== card.id)
        .concat(makeLetterCard());

      return {
        ...state,
        hand: nextHand,
        hint: null,
        swaps: state.swaps + 1,
        endAt: Math.max(state.now + 50, state.endAt - 3000),
      };
    }

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}
