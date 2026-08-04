import { dictionaries, DictionaryId, WordLength } from "./dictionary";
import {
  Card,
  dealPlayableHand,
  findHint,
  HAND_SIZE,
  drawCard,
  MAX_HAND,
  pickStarterWord,
  rerollCards,
  resolveStuck,
  shuffle,
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

/** Announcement for an automatic no-moves bailout. Kept separate from
    `feedback` so a rescue triggered by a valid play doesn't clobber the
    play's own "valid" flash. */
export type RescueNotice = {
  id: number;
  added: number;
  rerolled: number;
  /** Set when the board word was a dead end and got replaced. */
  newWord: string | null;
};

export type GameState = {
  status: GameStatus;
  dictionaryId: DictionaryId;
  word: string;
  wordLength: WordLength;
  hand: Card[];
  cooldowns: Cooldowns;
  hint: Hint;
  now: number;
  /** Infinity in Endless mode — nothing can ever reach it. */
  endAt: number;
  startedAt: number;
  /** Seconds. 0 means Endless: no timer, and emptying your hand is the
      only way to finish. */
  duration: number;
  wordsPlayed: number;
  draws: number;
  swaps: number;
  rescues: number;
  feedback: Feedback | null;
  rescue: RescueNotice | null;
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
  | { type: "SHUFFLE_HAND" }
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
  startedAt: 0,
  duration: 90,
  wordsPlayed: 0,
  draws: 0,
  swaps: 0,
  rescues: 0,
  feedback: null,
  rescue: null,
};

export function isEndless(state: GameState): boolean {
  return state.duration === 0;
}

/**
 * Runs after anything that changes the word or the hand. If the player has
 * no legal move left, the hand is reshuffled and grown by 2 (see
 * `resolveStuck`) and a notice is raised so the UI can explain what
 * happened. A no-op when a move exists or the round is already over.
 */
function withStuckRescue(state: GameState): GameState {
  if (state.status !== "playing") return state;

  const rescue = resolveStuck(
    state.word,
    state.hand,
    dictionaries[state.dictionaryId]
  );
  if (!rescue) return state;

  return {
    ...state,
    hand: rescue.hand,
    word: rescue.word ?? state.word,
    hint: null,
    rescues: state.rescues + 1,
    rescue: {
      id: nextFeedbackId(),
      added: rescue.added,
      rerolled: rescue.rerolled,
      newWord: rescue.word,
    },
  };
}

export function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START": {
      const dictionary = dictionaries[action.dictionaryId];
      const word = pickStarterWord(dictionary, action.wordLength);
      const now = Date.now();
      const endless = action.duration === 0;
      // A dead opening hand is possible, so the rescue check runs here too.
      return withStuckRescue({
        ...initialState,
        status: "playing",
        dictionaryId: action.dictionaryId,
        word,
        wordLength: action.wordLength,
        hand: dealPlayableHand(dictionary, word, HAND_SIZE),
        cooldowns: initialCooldowns(),
        now,
        startedAt: now,
        endAt: endless
          ? Number.POSITIVE_INFINITY
          : now + action.duration * 1000,
        duration: action.duration,
      });
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
      return withStuckRescue({
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
      });
    }

    case "USE_POWER_UP": {
      if (state.status !== "playing") return state;
      const def = POWER_UP_BY_ID[action.powerUp];
      if (!def) return state;

      const blocked = (): GameState => ({
        ...state,
        feedback: {
          id: nextFeedbackId(),
          kind: "blocked",
          powerUp: action.powerUp,
        },
      });

      // There is no clock to put seconds back on in Endless.
      if (action.powerUp === "freeze" && isEndless(state)) return blocked();

      // Still cooling down: reject with feedback instead of silently no-oping.
      if (state.cooldowns[action.powerUp] > 0) return blocked();

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
          // (The rescue below hands the player a way out instead.)
          if (!hint) return withStuckRescue(blocked());
          return spend({ hint });
        }

        case "chaos":
          return withStuckRescue(
            spend({
              hand: rerollCards(
                state.hand,
                Math.min(4, state.hand.length),
                dictionaries[state.dictionaryId]
              ),
              hint: null,
            })
          );

        case "freeze":
          return spend({ endAt: state.endAt + 8000 });

        case "purge": {
          const nextHand = state.hand.slice(0, Math.max(0, state.hand.length - 2));
          return withStuckRescue(
            spend({
              hand: nextHand,
              hint: null,
              status: nextHand.length === 0 ? "won" : state.status,
            })
          );
        }

        default:
          return state;
      }
    }

    case "DRAW_CARD": {
      if (state.status !== "playing") return state;
      // The hand is capped, so drawing can't be used to stall forever.
      if (state.hand.length >= MAX_HAND) return state;
      return {
        ...state,
        hand: [...state.hand, drawCard(dictionaries[state.dictionaryId])],
        draws: state.draws + 1,
      };
    }

    case "SWAP_CARD": {
      if (state.status !== "playing") return state;
      // Swapping is paid for in seconds, so Endless has no price for it.
      if (isEndless(state)) return state;
      const card = state.hand.find((c) => c.id === action.cardId);
      if (!card) return state;

      const nextHand = state.hand
        .filter((c) => c.id !== card.id)
        .concat(drawCard(dictionaries[state.dictionaryId]));

      return withStuckRescue({
        ...state,
        hand: nextHand,
        hint: null,
        swaps: state.swaps + 1,
        endAt: Math.max(state.now + 50, state.endAt - 3000),
      });
    }

    case "SHUFFLE_HAND": {
      if (state.status !== "playing") return state;
      // Purely a reordering: same cards, fresh look at them.
      return { ...state, hand: shuffle(state.hand), hint: null };
    }

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}
