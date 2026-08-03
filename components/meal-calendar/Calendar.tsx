"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MEAL_CATEGORIES, type MealCategory, type MealLogRow } from "@/lib/meal-calendar/types";
import { DayPanel } from "./DayPanel";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function Calendar({
  logs,
  onSelect,
  onClear,
}: {
  logs: Record<string, MealLogRow>;
  onSelect: (dateKey: string, category: MealCategory) => Promise<void>;
  onClear: (dateKey: string) => Promise<void>;
}) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayKey = toDateKey(today);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const leadingBlanks = firstOfMonth.getDay();

    const out: { dateKey: string | null; day: number | null }[] = [];
    for (let i = 0; i < leadingBlanks; i++) out.push({ dateKey: null, day: null });
    for (let day = 1; day <= daysInMonth; day++) {
      out.push({ dateKey: toDateKey(new Date(viewYear, viewMonth, day)), day });
    }
    return out;
  }, [viewYear, viewMonth]);

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPrevMonth}
          className="rounded-full p-2 border border-border hover:border-foreground/50 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
            {monthLabel}
          </h2>
          <button
            onClick={() => {
              setViewYear(today.getFullYear());
              setViewMonth(today.getMonth());
            }}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Jump to today
          </button>
        </div>
        <button
          onClick={goToNextMonth}
          className="rounded-full p-2 border border-border hover:border-foreground/50 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-[11px] font-bold uppercase tracking-wide text-muted py-1"
          >
            {label}
          </div>
        ))}

        {cells.map((cell, i) => {
          if (!cell.dateKey) return <div key={`blank-${i}`} />;

          const log = logs[cell.dateKey];
          const meta = log ? MEAL_CATEGORIES.find((c) => c.id === log.category) : undefined;
          const isToday = cell.dateKey === todayKey;

          return (
            <button
              key={cell.dateKey}
              onClick={() => setSelectedDate(cell.dateKey)}
              className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-colors hover:border-foreground/50 ${
                isToday ? "border-foreground bg-card" : "border-border"
              }`}
            >
              <span className={`text-sm ${isToday ? "font-bold" : ""}`}>{cell.day}</span>
              {meta && <span className={`h-1.5 w-1.5 rounded-full ${meta.colorClass}`} />}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {MEAL_CATEGORIES.map((cat) => (
          <span key={cat.id} className="flex items-center gap-1.5 text-xs text-muted">
            <span className={`h-2 w-2 rounded-full ${cat.colorClass}`} />
            {cat.label}
          </span>
        ))}
      </div>

      {selectedDate && (
        <DayPanel
          dateKey={selectedDate}
          existing={logs[selectedDate]}
          onClose={() => setSelectedDate(null)}
          onSelect={(category) => onSelect(selectedDate, category)}
          onClear={() => onClear(selectedDate)}
        />
      )}
    </div>
  );
}
