/**
 * Power-ups are abilities on a side rail, not cards in your hand.
 *
 * Each one runs on a cooldown measured in WORDS PLAYED: using it puts it on
 * cooldown, and every valid word you make ticks every cooldown down by one.
 * So the way to earn your abilities back is to keep making words, which is
 * exactly the behaviour the game wants to reward.
 */

export type PowerUpId = "hint" | "chaos" | "freeze" | "purge";

export type PowerUp = {
  id: PowerUpId;
  label: string;
  icon: string;
  /** Words you must play before it can be used again. */
  cooldown: number;
  /** One-line rule, shown on the rail button itself. */
  short: string;
  /** Full explanation, shown in the tooltip. */
  help: string;
  /** Tailwind classes for the ready (usable) state. */
  readyClass: string;
};

export const POWER_UPS: PowerUp[] = [
  {
    id: "hint",
    label: "Hint",
    icon: "?",
    cooldown: 2,
    short: "Show me a move",
    help: "Highlights one letter slot and the card in your hand that makes a valid word there. The fastest way out of a blank moment.",
    readyClass: "border-cyan-400 bg-cyan-400/10 text-cyan-200",
  },
  {
    id: "chaos",
    label: "Chaos",
    icon: "⚡",
    cooldown: 3,
    short: "Reroll 4 letters",
    help: "Swaps 4 random cards in your hand for fresh ones. Your hand size doesn't change — use it when you're holding dead letters.",
    readyClass: "border-lime-400 bg-lime-400/10 text-lime-200",
  },
  {
    id: "freeze",
    label: "Freeze",
    icon: "❄",
    cooldown: 4,
    short: "+8 seconds",
    help: "Freezes the countdown, putting 8 seconds back on the clock. Save it for when the timer turns red.",
    readyClass: "border-sky-400 bg-sky-400/10 text-sky-200",
  },
  {
    id: "purge",
    label: "Purge",
    icon: "✖",
    cooldown: 5,
    short: "Burn 2 cards",
    help: "Instantly discards 2 cards from your hand — straight progress toward emptying it, no word required. The longest cooldown for a reason.",
    readyClass: "border-fuchsia-400 bg-fuchsia-400/10 text-fuchsia-200",
  },
];

export const POWER_UP_BY_ID: Record<PowerUpId, PowerUp> = Object.fromEntries(
  POWER_UPS.map((p) => [p.id, p])
) as Record<PowerUpId, PowerUp>;

/** Cooldown counters, keyed by power-up. 0 means ready to use. */
export type Cooldowns = Record<PowerUpId, number>;

export function initialCooldowns(): Cooldowns {
  return { hint: 0, chaos: 0, freeze: 0, purge: 0 };
}

/** Called after every valid word: everything gets one step closer to ready. */
export function tickCooldowns(current: Cooldowns): Cooldowns {
  const next = { ...current };
  for (const key of Object.keys(next) as PowerUpId[]) {
    next[key] = Math.max(0, next[key] - 1);
  }
  return next;
}
