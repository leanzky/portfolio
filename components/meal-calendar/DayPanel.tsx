"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { MEAL_CATEGORIES, type MealCategory, type MealLogRow } from "@/lib/meal-calendar/types";

function formatFullDate(dateKey: string): string {
  // Parse as local, not UTC, so the displayed day never shifts by a
  // timezone off-by-one.
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DayPanel({
  dateKey,
  existing,
  onClose,
  onSelect,
  onClear,
}: {
  dateKey: string;
  existing: MealLogRow | undefined;
  onClose: () => void;
  onSelect: (category: MealCategory) => Promise<void>;
  onClear: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  async function handlePick(category: MealCategory) {
    setBusy(true);
    await onSelect(category);
    setBusy(false);
  }

  async function handleClear() {
    setBusy(true);
    await onClear();
    setBusy(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card shadow-[0_24px_80px_rgba(0,0,0,0.25)] overflow-hidden">
        {/* Header: the date + the meal-count picker live together up top,
            per the requested layout. */}
        <div className="px-7 pt-7 pb-6 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">
                Meal Log
              </p>
              <h2 className="mt-1 font-display text-xl font-bold tracking-tight">
                {formatFullDate(dateKey)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full p-1.5 text-muted hover:text-foreground hover:bg-background transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 sm:grid-cols-5 gap-2">
            {MEAL_CATEGORIES.map((cat) => {
              const active = existing?.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handlePick(cat.id)}
                  disabled={busy}
                  className={`rounded-xl border-2 px-2 py-3 text-center transition-colors disabled:opacity-50 ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/50"
                  }`}
                >
                  <span
                    className={`mx-auto mb-1.5 block h-2.5 w-2.5 rounded-full ${cat.colorClass}`}
                  />
                  <span className="text-xs font-bold leading-tight">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-7 py-5 flex items-center justify-between">
          <p className="text-sm text-muted">
            {existing
              ? "Tap a different option to change it."
              : "Pick how much you ate today."}
          </p>
          {existing && (
            <button
              onClick={handleClear}
              disabled={busy}
              className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
