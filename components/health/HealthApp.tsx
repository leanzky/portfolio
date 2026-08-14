"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ensureAnonymousSession } from "@/lib/supabase-client";
import { fetchHealthDays, saveHealthDay } from "@/lib/health/actions";
import { fetchProgressPhotos } from "@/lib/health/photos";
import type { HealthDayInput, HealthDayRow } from "@/lib/health/types";
import type { ProgressPhoto } from "@/lib/health/types";
import { buildDashboard, bpSeries, toDateKey, weightSeries } from "@/lib/health/metrics";
import { lock } from "@/lib/private-gate";
import { Dashboard } from "./Dashboard";
import { TodayView } from "./TodayView";
import { BloodPressureChart, ReadingsTable, WeightChart } from "./TrendCharts";
import { PhotoTracker } from "./PhotoTracker";
import { EatView, MoveView, PlanView, SafetyView } from "./PlanViews";

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "today", label: "Today" },
  { id: "progress", label: "Progress" },
  { id: "plan", label: "The plan" },
  { id: "move", label: "Move" },
  { id: "eat", label: "Eat" },
  { id: "safety", label: "Safety" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function HealthApp() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [days, setDays] = useState<Record<string, HealthDayRow>>({});
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable" | "error">(
    configured ? "loading" : "unavailable"
  );
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const loadPhotos = useCallback(async () => {
    try {
      setPhotos(await fetchProgressPhotos());
    } catch {
      // Photos are a bonus; a missing bucket must not take the page down.
    }
  }, []);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;

    (async () => {
      // The sign-in call throws rather than returning an error when the
      // network is unreachable, so it has to be inside the try — otherwise
      // an offline phone sits on "Loading…" forever.
      try {
        const userId = await ensureAnonymousSession();
        if (!userId) throw new Error("Could not start a session.");

        const data = await fetchHealthDays();
        if (cancelled) return;
        setDays(data);
        setStatus("ready");
        await loadPhotos();
      } catch (cause) {
        if (cancelled) return;
        setErrorDetail(cause instanceof Error ? cause.message : null);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadPhotos]);

  async function handleSave(values: HealthDayInput) {
    setSaving(true);
    try {
      const row = await saveHealthDay(todayKey, values);
      setDays((prev) => ({ ...prev, [todayKey]: row }));
    } finally {
      setSaving(false);
    }
  }

  const sorted = useMemo(
    () => Object.values(days).sort((a, b) => a.log_date.localeCompare(b.log_date)),
    [days]
  );
  const dashboard = useMemo(() => buildDashboard(days, todayKey), [days, todayKey]);
  const weights = useMemo(() => weightSeries(sorted), [sorted]);
  const bp = useMemo(() => bpSeries(sorted), [sorted]);
  const tableRows = useMemo(
    () =>
      [...sorted]
        .reverse()
        .slice(0, 10)
        .map((day) => ({
          date: day.log_date,
          systolic: day.systolic,
          diastolic: day.diastolic,
          weight: day.weight_kg,
        })),
    [sorted]
  );

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Blood pressure & weight</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Week {dashboard.week || "—"} of 12
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/" className="text-xs text-muted transition-colors hover:text-foreground">
              Portfolio
            </Link>
            <button
              type="button"
              onClick={lock}
              className="text-xs text-muted transition-colors hover:text-foreground"
            >
              Lock
            </button>
          </div>
        </div>

        <nav className="mx-auto max-w-5xl overflow-x-auto px-5 pb-2 sm:px-8">
          <div className="flex gap-1">
            {TABS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTab(entry.id)}
                aria-current={tab === entry.id}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition ${
                  tab === entry.id
                    ? "bg-foreground text-background font-medium"
                    : "text-muted hover:bg-foreground/[0.06] hover:text-foreground"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
        {status === "loading" && <p className="text-center text-muted">Loading…</p>}

        {status === "unavailable" && (
          <div className="mx-auto max-w-lg rounded-xl border border-border bg-card p-6 text-center">
            <p className="font-medium">Tracking is switched off</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              This page saves to the same Supabase project the game uses. Add
              <code className="mx-1 rounded border border-border bg-background px-1.5 py-0.5 text-xs break-all">
                NEXT_PUBLIC_SUPABASE_URL
              </code>
              and
              <code className="mx-1 rounded border border-border bg-background px-1.5 py-0.5 text-xs break-all">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>
              to enable it. The plan itself works without them.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="mx-auto max-w-lg rounded-xl border border-rose-600/30 bg-rose-600/[0.05] p-6 text-center">
            <p className="font-medium">Could not load your log</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              If this is the first run, the tables may not exist yet — run{" "}
              <code className="rounded border border-border bg-background px-1.5 py-0.5 text-xs break-all">
                supabase/migrations/0009_health_program.sql
              </code>{" "}
              in the Supabase SQL Editor. Everything except saving works meanwhile.
            </p>
            {errorDetail && <p className="mt-3 font-mono text-xs text-muted">{errorDetail}</p>}
          </div>
        )}

        {/* The plan is static content and should be readable even if the
            database is unreachable — only the logging views need it. */}
        <div className="mt-2">
          {tab === "dashboard" &&
            (status === "ready" ? (
              <Dashboard data={dashboard} />
            ) : (
              status !== "loading" && (
                <p className="mt-6 text-center text-sm text-muted">
                  Your numbers appear here once tracking is connected.
                </p>
              )
            ))}

          {tab === "today" && status === "ready" && (
            <TodayView
              // Remount when the day changes or when today's row first loads,
              // so the form seeds itself from saved data without an effect.
              // Deliberately not keyed on updated_at: a save must not reset
              // the form under the person who just filled it in.
              key={`${todayKey}:${days[todayKey] ? "loaded" : "empty"}`}
              dateKey={todayKey}
              row={days[todayKey]}
              onSave={handleSave}
              saving={saving}
            />
          )}

          {tab === "progress" && status === "ready" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Weight</h2>
                <div className="mt-3">
                  <WeightChart points={weights} />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Blood pressure</h2>
                <div className="mt-3">
                  <BloodPressureChart systolic={bp.systolic} diastolic={bp.diastolic} />
                </div>
              </div>
              <ReadingsTable rows={tableRows} />
              <div className="border-t border-border pt-6">
                <h2 className="text-lg font-semibold tracking-tight">Photos</h2>
                <div className="mt-3">
                  <PhotoTracker
                    photos={photos}
                    todayKey={todayKey}
                    todayWeight={days[todayKey]?.weight_kg ?? dashboard.currentWeight}
                    onChanged={loadPhotos}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "plan" && <PlanView />}
          {tab === "move" && <MoveView />}
          {tab === "eat" && <EatView />}
          {tab === "safety" && <SafetyView />}
        </div>

        <footer className="mt-16 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted">
            General lifestyle guidance written for one person, not medical advice. It does not
            replace your doctor, and nothing here changes a prescription. If something feels wrong,
            call your doctor — and see the Safety tab for the things that mean go now.
          </p>
        </footer>
      </main>
    </div>
  );
}
