"use client";

import { useState } from "react";

const ENTRIES = [
  {
    icon: "❄",
    label: "Freeze",
    color: "text-emerald-300",
    text: "Locks a random letter slot for 5 seconds.",
  },
  {
    icon: "⚡",
    label: "Chaos",
    color: "text-lime-300",
    text: "Swaps itself for 2 fresh letters (hand grows by 1).",
  },
  {
    icon: "⤡",
    label: "Expand",
    color: "text-green-300",
    text: "Drop on the “+” slot to add its letter and grow the word to 5.",
  },
];

/**
 * Always-visible reference for what the action cards do. The per-card
 * tooltips are hover/focus based, which touch devices can't reach —
 * and tapping an action card plays it rather than explaining it, so a
 * standing legend is the only thing that works on every device.
 */
export function PowerUpLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 font-mono">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mx-auto flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-green-700 hover:text-green-400 transition-colors"
      >
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>›</span>
        What do the cards do?
      </button>

      {open && (
        <dl className="mt-3 grid gap-2 sm:grid-cols-3">
          {ENTRIES.map((e) => (
            <div
              key={e.label}
              className="rounded-lg border border-green-900 bg-[#06110a] px-3 py-2"
            >
              <dt className={`text-xs font-bold ${e.color}`}>
                <span className="mr-1.5">{e.icon}</span>
                {e.label}
              </dt>
              <dd className="mt-1 text-[11px] leading-snug text-green-600">
                {e.text}
              </dd>
            </div>
          ))}
          <p className="sm:col-span-3 text-[11px] text-green-700 text-center">
            Letter cards: drag onto a slot, or tap the card then tap the slot.
          </p>
        </dl>
      )}
    </div>
  );
}
