"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ensureAnonymousSession } from "@/lib/supabase-client";
import { clearMealLog, fetchMealLogs, setMealLog } from "@/lib/meal-calendar/actions";
import type { MealCategory, MealLogRow } from "@/lib/meal-calendar/types";
import { Calendar } from "./Calendar";

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function MealCalendarApp() {
  const [logs, setLogs] = useState<Record<string, MealLogRow>>({});
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable" | "error">(
    configured ? "loading" : "unavailable"
  );

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    (async () => {
      const userId = await ensureAnonymousSession();
      if (!userId) {
        if (!cancelled) setStatus("error");
        return;
      }
      try {
        const data = await fetchMealLogs();
        if (!cancelled) {
          setLogs(data);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSelect(dateKey: string, category: MealCategory) {
    const row = await setMealLog(dateKey, category);
    setLogs((prev) => ({ ...prev, [dateKey]: row }));
  }

  async function handleClear(dateKey: string) {
    await clearMealLog(dateKey);
    setLogs((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });
  }

  return (
    <div className="min-h-svh px-6 py-16">
      <div className="max-w-2xl mx-auto mb-10 text-center">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted">
          Personal Tracker
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Meal Calendar
        </h1>
        <p className="mt-3 text-muted leading-relaxed">
          Click a day to log how much you ate.
        </p>
      </div>

      {status === "loading" && (
        <p className="text-center text-muted">Loading…</p>
      )}

      {status === "unavailable" && (
        <p className="max-w-md mx-auto text-center text-muted">
          This page needs a Supabase project configured (the same one the
          Scrabble Slam multiplayer game uses). Add
          <code className="mx-1 rounded bg-card px-1.5 py-0.5 border border-border text-xs">
            NEXT_PUBLIC_SUPABASE_URL
          </code>
          and
          <code className="mx-1 rounded bg-card px-1.5 py-0.5 border border-border text-xs">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>
          to enable it.
        </p>
      )}

      {status === "error" && (
        <p className="text-center text-rose-600">
          Couldn&apos;t connect. Try refreshing the page.
        </p>
      )}

      {status === "ready" && (
        <Calendar logs={logs} onSelect={handleSelect} onClear={handleClear} />
      )}

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="text-muted hover:text-foreground text-sm transition-colors"
        >
          ← Back to portfolio
        </Link>
      </div>
    </div>
  );
}
