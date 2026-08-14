"use client";

import { milestones, profile, truths } from "@/data/health-plan";
import { bmiLabel, nextMilestone, type Dashboard as DashboardData } from "@/lib/health/metrics";

function Stat({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
      <p
        className={`mt-1.5 text-2xl font-semibold tracking-tight ${accent ? "text-emerald-700" : ""}`}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs leading-relaxed text-muted">{sub}</p>}
    </div>
  );
}

function Bar({ percent, label }: { percent: number; label: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs text-muted">
        <span>{label}</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(percent)}%</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-border/70">
        <div
          className="h-full rounded-full bg-emerald-600 transition-[width] duration-700"
          style={{ width: `${Math.max(2, percent)}%` }}
        />
      </div>
    </div>
  );
}

export function Dashboard({ data }: { data: DashboardData }) {
  const milestone = data.currentWeight !== null ? nextMilestone(data.currentWeight) : milestones[0];
  const reached =
    data.currentWeight !== null
      ? milestones.filter((m) => m.weightKg >= data.currentWeight!).length
      : 0;
  const walkTargetMinutes = 30 * 7;

  return (
    <div className="space-y-8">
      {/* ---------- the four numbers that matter ---------- */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Weight now"
          value={data.currentWeight !== null ? `${data.currentWeight.toFixed(1)} kg` : "—"}
          sub={
            data.currentBmi !== null
              ? `BMI ${data.currentBmi.toFixed(1)} · ${bmiLabel(data.currentBmi)}`
              : "Log your first weigh-in"
          }
        />
        <Stat
          label="Lost so far"
          value={data.lostKg !== null && data.lostKg > 0 ? `${data.lostKg.toFixed(1)} kg` : "0.0 kg"}
          sub={
            data.percentLost !== null && data.percentLost > 0
              ? `${data.percentLost.toFixed(1)}% of your starting weight`
              : `Started at ${data.startWeight.toFixed(1)} kg`
          }
          accent={(data.lostKg ?? 0) > 0}
        />
        <Stat
          label="Walked this week"
          value={`${data.walkMinutesThisWeek} min`}
          sub={`${data.walkDaysThisWeek} of 7 days · ${data.strengthThisWeek} strength ${
            data.strengthThisWeek === 1 ? "session" : "sessions"
          }`}
          accent={data.walkMinutesThisWeek >= walkTargetMinutes}
        />
        <Stat
          label="Streak"
          value={`${data.streak} ${data.streak === 1 ? "day" : "days"}`}
          sub={`Week ${data.week || "—"} of 12 · ${data.daysLogged} days logged`}
          accent={data.streak >= 3}
        />
      </div>

      {/* ---------- progress toward the goals ---------- */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold">Progress</h3>
        <div className="mt-4 space-y-4">
          <Bar
            percent={data.goalPercent}
            label={`Toward ${profile.goal12WeekKg} kg — the 12-week goal`}
          />
          <Bar
            percent={Math.min(100, ((data.week || 0) / 12) * 100)}
            label={`Week ${data.week || 0} of 12`}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-background/50 p-3.5">
            <p className="text-xs text-muted">Food logged this week</p>
            <p className="mt-1 text-sm">
              <span className="font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                {data.mealsLoggedThisWeek}
              </span>{" "}
              of 7 days
              {data.mealsLoggedThisWeek < 5 && (
                <span className="text-muted">
                  {" "}
                  — the log only helps if a bad week is readable afterwards
                </span>
              )}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background/50 p-3.5">
            <p className="text-xs text-muted">To the 12-week goal</p>
            <p className="mt-1 text-sm">
              {data.toGoalKg !== null && data.toGoalKg > 0 ? (
                <>
                  <span className="font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {data.toGoalKg.toFixed(1)} kg
                  </span>{" "}
                  to go — about {Math.ceil(data.toGoalKg / profile.weeklyLossKg)} weeks at half a
                  kilo a week
                </>
              ) : data.toGoalKg !== null ? (
                "Goal reached. Set the next one with your doctor."
              ) : (
                "Log a weigh-in to see this"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ---------- next milestone ---------- */}
      {milestone && (
        <div className="rounded-xl border border-emerald-700/25 bg-emerald-700/[0.05] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-800/80">
            Next milestone · {reached} of {milestones.length} reached
          </p>
          <p className="mt-2 text-lg font-semibold">
            {milestone.weightKg} kg — {milestone.label}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/75">{milestone.meaning}</p>
          {data.currentWeight !== null && (
            <p className="mt-3 text-sm text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
              {(data.currentWeight - milestone.weightKg).toFixed(1)} kg away.
            </p>
          )}
        </div>
      )}

      {/* ---------- the honest bit ---------- */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold">Things worth remembering</h3>
        <ul className="mt-3 space-y-2.5">
          {truths.map((truth, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/75">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />
              <span>{truth}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
