"use client";

import { POWER_UPS, type Cooldowns, type PowerUpId } from "@/lib/scrabble-slam/powerups";
import styles from "./game.module.css";

/**
 * The abilities rail. Vertical column beside the board on desktop, and a
 * horizontal strip under it on narrow screens so it stays reachable with a
 * thumb. Each button shows its own cooldown, so the rules are visible on
 * the control itself rather than hidden in a help panel.
 */
export function PowerUpRail({
  cooldowns,
  onUse,
  disabled = false,
  unavailable,
}: {
  cooldowns: Cooldowns;
  onUse: (id: PowerUpId) => void;
  disabled?: boolean;
  /** Power-ups that make no sense in the current mode, with the reason
      shown in place of the cooldown (e.g. Freeze in Endless). */
  unavailable?: Partial<Record<PowerUpId, string>>;
}) {
  return (
    <div
      className={[
        "font-mono",
        // desktop: fixed rail on the right edge, vertically centred
        "lg:fixed lg:right-6 lg:top-1/2 lg:-translate-y-1/2 lg:z-30",
        "lg:flex lg:flex-col lg:gap-2.5 lg:w-40",
        // mobile/tablet: inline horizontal row
        "flex flex-row flex-wrap justify-center gap-2 w-full max-w-3xl mx-auto px-4",
      ].join(" ")}
    >
      <p className="hidden lg:block text-[10px] uppercase tracking-[0.2em] text-green-700 mb-0.5">
        Power-ups
      </p>

      {POWER_UPS.map((p) => {
        const blockedReason = unavailable?.[p.id];
        const remaining = cooldowns[p.id];
        const ready = remaining === 0 && !disabled && !blockedReason;
        const status = blockedReason
          ? blockedReason
          : `${remaining} word${remaining === 1 ? "" : "s"} left`;

        return (
          <div key={p.id} className="group relative">
            <button
              type="button"
              onClick={() => onUse(p.id)}
              disabled={!ready}
              aria-label={`${p.label}. ${p.help}${
                ready ? "" : ` Unavailable: ${status}.`
              }`}
              className={[
                "w-full rounded-xl border-2 px-3 py-2 text-left transition",
                "flex items-center gap-2.5 lg:gap-2",
                ready
                  ? `${p.readyClass} hover:brightness-125 cursor-pointer ${styles.readyPulse}`
                  : "border-green-950 bg-[#06110a] text-green-800 cursor-not-allowed",
              ].join(" ")}
            >
              <span className="text-base leading-none shrink-0">{p.icon}</span>
              <span className="min-w-0">
                <span className="block text-[11px] font-bold uppercase tracking-wide leading-none">
                  {p.label}
                </span>
                <span className="block text-[10px] leading-tight mt-0.5 opacity-80 truncate">
                  {ready ? p.short : status}
                </span>
              </span>
            </button>

            {/* Rule detail on hover/focus. Positioned left of the rail on
                desktop (it sits at the right edge) and above on mobile. */}
            <div
              role="tooltip"
              className={[
                "pointer-events-none absolute z-50 w-56 rounded-lg border border-green-700",
                "bg-[#04120a] px-3 py-2 text-left shadow-[0_8px_24px_rgba(0,0,0,0.6)]",
                "opacity-0 transition-opacity duration-150",
                "group-hover:opacity-100 group-focus-within:opacity-100",
                "bottom-full left-1/2 -translate-x-1/2 mb-2",
                "lg:bottom-auto lg:left-auto lg:right-full lg:top-0 lg:translate-x-0 lg:mb-0 lg:mr-2",
              ].join(" ")}
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-green-300">
                {p.label}
                <span className="ml-1.5 font-normal normal-case text-green-600">
                  · {p.cooldown}-word cooldown
                </span>
              </p>
              <p className="mt-1 text-[11px] leading-snug text-green-500">
                {p.help}
              </p>
            </div>
          </div>
        );
      })}

      <p className="hidden lg:block text-[10px] leading-snug text-green-800 mt-1">
        Cooldowns tick down each time you make a word.
      </p>
    </div>
  );
}
