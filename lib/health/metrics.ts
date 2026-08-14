import { bpCategories, milestones, phases, profile } from "@/data/health-plan";
import type { HealthDayRow } from "./types";

/* ---------- dates ---------- */

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function daysBetween(fromKey: string, toKey: string): number {
  const ms = fromDateKey(toKey).getTime() - fromDateKey(fromKey).getTime();
  return Math.round(ms / 86_400_000);
}

export function formatDate(key: string): string {
  return fromDateKey(key).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** Which program week a date falls in — 0 before the start, 1–12 during. */
export function programWeek(dateKey: string): number {
  const offset = daysBetween(profile.startDate, dateKey);
  if (offset < 0) return 0;
  return Math.floor(offset / 7) + 1;
}

export function phaseFor(dateKey: string) {
  if (dateKey < profile.startDate) return phases[0];
  return phases.find((phase) => dateKey >= phase.startDate && dateKey <= phase.endDate) ?? phases[phases.length - 1];
}

/** 0-based index into a Workout's four-phase prescription array. */
export function phaseIndex(dateKey: string): number {
  const phase = phaseFor(dateKey);
  const index = phases.findIndex((p) => p.id === phase.id);
  // Phase 0 is setup; the prescriptions start at phase 1.
  return Math.max(0, Math.min(3, index - 1));
}

/* ---------- body metrics ---------- */

export function bmi(weightKg: number, heightCm = profile.heightCm): number {
  const metres = heightCm / 100;
  return weightKg / (metres * metres);
}

export function bmiLabel(value: number): string {
  if (value < 18.5) return "Underweight";
  if (value < 25) return "Healthy";
  if (value < 30) return "Overweight";
  if (value < 35) return "Obesity class I";
  if (value < 40) return "Obesity class II";
  return "Obesity class III";
}

/* ---------- blood pressure ---------- */

/** Classify by the worse of the two numbers, which is the standard rule. */
export function classifyBp(systolic: number, diastolic: number) {
  if (systolic >= 180 || diastolic >= 120) return bpCategories[4];
  if (systolic >= 160 || diastolic >= 100) return bpCategories[3];
  if (systolic >= 135 || diastolic >= 85) return bpCategories[2];
  if (systolic >= 130 || diastolic >= 80) return bpCategories[1];
  return bpCategories[0];
}

export const BP_TONE_CLASS: Record<"good" | "warning" | "serious" | "critical", string> = {
  good: "text-[#0ca30c] border-[#0ca30c]/40 bg-[#0ca30c]/10",
  warning: "text-[#a06f00] border-[#fab219]/50 bg-[#fab219]/10",
  serious: "text-[#b4552b] border-[#ec835a]/50 bg-[#ec835a]/10",
  critical: "text-[#d03b3b] border-[#d03b3b]/50 bg-[#d03b3b]/10",
};

/* ---------- series and summaries ---------- */

export type Point = { date: string; value: number };

export function weightSeries(days: HealthDayRow[]): Point[] {
  return days
    .filter((day) => day.weight_kg !== null)
    .map((day) => ({ date: day.log_date, value: Number(day.weight_kg) }));
}

export function bpSeries(days: HealthDayRow[]): { systolic: Point[]; diastolic: Point[] } {
  const withBp = days.filter((day) => day.systolic !== null && day.diastolic !== null);
  return {
    systolic: withBp.map((day) => ({ date: day.log_date, value: Number(day.systolic) })),
    diastolic: withBp.map((day) => ({ date: day.log_date, value: Number(day.diastolic) })),
  };
}

/** Mean of the last n readings — the number that actually means something,
    since a single blood pressure reading is mostly noise. */
export function recentAverage(points: Point[], count = 7): number | null {
  if (points.length === 0) return null;
  const slice = points.slice(-count);
  return slice.reduce((total, point) => total + point.value, 0) / slice.length;
}

/** Consecutive days ending today (or yesterday, so an unlogged today does
    not wipe a real streak) that count as "showed up". */
export function currentStreak(byDate: Record<string, HealthDayRow>, todayKey: string): number {
  const counts = (row: HealthDayRow | undefined) =>
    Boolean(row && (row.walk_minutes > 0 || row.strength_done));

  let cursor = counts(byDate[todayKey]) ? todayKey : addDays(todayKey, -1);
  let streak = 0;
  while (counts(byDate[cursor])) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function nextMilestone(currentWeight: number) {
  // milestones descend; find the first one still ahead of you
  return [...milestones].reverse().find((m) => m.weightKg < currentWeight) ?? null;
}

export type Dashboard = {
  currentWeight: number | null;
  startWeight: number;
  lostKg: number | null;
  percentLost: number | null;
  currentBmi: number | null;
  startBmi: number;
  toGoalKg: number | null;
  goalPercent: number;
  latestBp: { systolic: number; diastolic: number; date: string } | null;
  bpAverage: { systolic: number; diastolic: number; count: number } | null;
  bpChange: number | null;
  streak: number;
  daysLogged: number;
  walkMinutesThisWeek: number;
  strengthThisWeek: number;
  week: number;
};

export function buildDashboard(
  byDate: Record<string, HealthDayRow>,
  todayKey: string
): Dashboard {
  const days = Object.values(byDate).sort((a, b) => a.log_date.localeCompare(b.log_date));
  const weights = weightSeries(days);
  const { systolic, diastolic } = bpSeries(days);

  const currentWeight = weights.length > 0 ? weights[weights.length - 1].value : null;
  const startWeight = weights.length > 0 ? weights[0].value : profile.startWeightKg;

  const lostKg = currentWeight === null ? null : startWeight - currentWeight;
  const goalTotal = profile.startWeightKg - profile.goal12WeekKg;

  const sysAvg = recentAverage(systolic);
  const diaAvg = recentAverage(diastolic);

  // First week of readings versus the last, so the comparison is like for like.
  const firstSys = systolic.slice(0, 7);
  const firstAvg = firstSys.length > 0 ? recentAverage(firstSys, firstSys.length) : null;

  const weekStart = addDays(todayKey, -6);
  const thisWeek = days.filter((day) => day.log_date >= weekStart && day.log_date <= todayKey);

  return {
    currentWeight,
    startWeight,
    lostKg,
    percentLost: lostKg === null ? null : (lostKg / startWeight) * 100,
    currentBmi: currentWeight === null ? null : bmi(currentWeight),
    startBmi: bmi(profile.startWeightKg),
    toGoalKg: currentWeight === null ? null : currentWeight - profile.goal12WeekKg,
    goalPercent:
      lostKg === null || goalTotal <= 0 ? 0 : Math.max(0, Math.min(100, (lostKg / goalTotal) * 100)),
    latestBp:
      systolic.length > 0
        ? {
            systolic: systolic[systolic.length - 1].value,
            diastolic: diastolic[diastolic.length - 1].value,
            date: systolic[systolic.length - 1].date,
          }
        : null,
    bpAverage:
      sysAvg !== null && diaAvg !== null
        ? { systolic: sysAvg, diastolic: diaAvg, count: Math.min(7, systolic.length) }
        : null,
    bpChange: sysAvg !== null && firstAvg !== null && systolic.length >= 8 ? sysAvg - firstAvg : null,
    streak: currentStreak(byDate, todayKey),
    daysLogged: days.length,
    walkMinutesThisWeek: thisWeek.reduce((total, day) => total + day.walk_minutes, 0),
    strengthThisWeek: thisWeek.filter((day) => day.strength_done).length,
    week: programWeek(todayKey),
  };
}
