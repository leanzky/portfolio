import { dictionaries, DictionaryId, WordLength } from "./dictionary";
import {
  Card,
  dealHand,
  makeLetterCard,
  pickStarterWord,
  tryExpandWord,
  tryPlaceLetter,
} from "./engine";

export type GameStatus = "idle" | "playing" | "won" | "timeout";

export type Feedback =
  | { id: number; kind: "valid"; slotIndex: number }
  | { id: number; kind: "invalid"; slotIndex?: number; cardId: string }
  | { id: number; kind: "expand" }
  | { id: number; kind: "action" };

export type GameState = {
  status: GameStatus;
  dictionaryId: DictionaryId;
  word: string;
  wordLength: WordLength;
  hand: Card[];
  /** slot index -> ms timestamp when the freeze expires */
  frozen: Record<number, number>;
  now: number;
  endAt: number;
  duration: number;
  draws: number;
  swaps: number;
  feedback: Feedback | null;
};

export type GameAction =
  | { type: "START"; dictionaryId: DictionaryId; duration: number }
  | { type: "TICK"; now: number }
  | { type: "PLACE_LETTER"; cardId: string; slotIndex: number }
  | { type: "PLACE_EXPAND"; cardId: string }
  | { type: "PLAY_CHAOS"; cardId: string }
  | { type: "PLAY_FREEZE"; cardId: string }
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
  frozen: {},
  now: Date.now(),
  endAt: 0,
  duration: 90,
  draws: 0,
  swaps: 0,
  feedback: null,
};

export function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START": {
      const dictionary = dictionaries[action.dictionaryId];
      const { word, length } = pickStarterWord(dictionary);
      const includeExpand = dictionary.lengths.includes(5);
      const now = Date.now();
      return {
        ...initialState,
        status: "playing",
        dictionaryId: action.dictionaryId,
        word,
        wordLength: length,
        hand: dealHand({ handSize: 16, includeExpand }),
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
      if (!card || card.kind !== "letter") return state;

      const dictionary = dictionaries[state.dictionaryId];
      const frozenSlots = new Set(
        Object.entries(state.frozen)
          .filter(([, expiresAt]) => expiresAt > state.now)
          .map(([slot]) => Number(slot))
      );

      const result = tryPlaceLetter(
        state.word,
        action.slotIndex,
        card.letter,
        dictionary,
        frozenSlots
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
        status: nextHand.length === 0 ? "won" : state.status,
        feedback: {
          id: nextFeedbackId(),
          kind: "valid",
          slotIndex: action.slotIndex,
        },
      };
    }

    case "PLACE_EXPAND": {
      if (state.status !== "playing" || state.wordLength !== 4) return state;
      const card = state.hand.find((c) => c.id === action.cardId);
      if (!card || card.kind !== "action" || card.action !== "expand" || !card.letter) {
        return state;
      }

      const dictionary = dictionaries[state.dictionaryId];
      const result = tryExpandWord(state.word, card.letter, dictionary);

      if (!result.ok) {
        return {
          ...state,
          feedback: { id: nextFeedbackId(), kind: "invalid", cardId: card.id },
        };
      }

      const nextHand = state.hand.filter((c) => c.id !== card.id);
      return {
        ...state,
        word: result.nextWord,
        wordLength: 5,
        hand: nextHand,
        status: nextHand.length === 0 ? "won" : state.status,
        feedback: { id: nextFeedbackId(), kind: "expand" },
      };
    }

    case "PLAY_CHAOS": {
      if (state.status !== "playing") return state;
      const card = state.hand.find((c) => c.id === action.cardId);
      if (!card || card.kind !== "action" || card.action !== "chaos") return state;

      const nextHand = state.hand
        .filter((c) => c.id !== card.id)
        .concat(makeLetterCard(), makeLetterCard());

      return {
        ...state,
        hand: nextHand,
        feedback: { id: nextFeedbackId(), kind: "action" },
      };
    }

    case "PLAY_FREEZE": {
      if (state.status !== "playing") return state;
      const card = state.hand.find((c) => c.id === action.cardId);
      if (!card || card.kind !== "action" || card.action !== "freeze") return state;

      const candidates = Array.from({ length: state.wordLength }, (_, i) => i).filter(
        (i) => !(state.frozen[i] > state.now)
      );
      const targets = candidates.length > 0
        ? candidates
        : Array.from({ length: state.wordLength }, (_, i) => i);
      const slot = targets[Math.floor(Math.random() * targets.length)];

      return {
        ...state,
        hand: state.hand.filter((c) => c.id !== card.id),
        frozen: { ...state.frozen, [slot]: state.now + 5000 },
        feedback: { id: nextFeedbackId(), kind: "action" },
      };
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
        swaps: state.swaps + 1,
        endAt: Math.max(state.now + 50, state.endAt - 3000),
      };
    }

    case "RESET":
      return { ...initialState, now: Date.now() };

    default:
      return state;
  }
}
