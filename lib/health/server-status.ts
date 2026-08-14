import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import { buildDashboard, phaseFor } from "./metrics";
import type { HealthDayRow } from "./types";

/**
 * Server-side read of today's check-in, for the phone widget.
 *
 * This deliberately does NOT use a Supabase service-role key. It signs in as
 * the same account the browser uses, so Row Level Security still applies and
 * the worst these variables can do if they leak is what that one account can
 * already do. A service-role key would bypass RLS on every table in the
 * project — far too much authority to hand a home-screen widget.
 *
 * Server-only: never import this from a "use client" module, or the password
 * ends up in the browser bundle.
 */

/** The phone is in the Philippines, the server is in UTC. "Today" has to mean
    today *here*, or the widget flips over at 8am local time. */
const TIME_ZONE = "Asia/Manila";

export class NotConfiguredError extends Error {
  constructor() {
    super("Widget environment variables are not set");
    this.name = "NotConfiguredError";
  }
}

export type WidgetStatus = {
  /** "YYYY-MM-DD" in Asia/Manila. */
  date: string;
  /** Is there a check-in row for today at all — the question the widget exists to answer. */
  logged: boolean;
  walkMinutes: number;
  walkGoalMinutes: number;
  strengthDone: boolean;
  medsTaken: boolean;
  ateLogged: boolean;
  weighedToday: boolean;
  latestWeightKg: number | null;
  lostKg: number | null;
  streak: number;
  week: number;
  daysLogged: number;
  /** When this snapshot was taken, so a stale widget is visibly stale. */
  checkedAt: string;
};

/** Today's date key in the tracker's timezone. "en-CA" formats as YYYY-MM-DD. */
export function todayKeyInZone(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Short local time, for the "as of" line on the widget. */
export function timeInZone(now = new Date()): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(now);
}

/**
 * Compares the supplied token against the configured one without leaking its
 * length or contents through timing. Returns false rather than throwing when
 * nothing is configured, so an unconfigured deployment simply 404s.
 */
export function tokenMatches(given: string | null): boolean {
  const expected = process.env.HEALTH_WIDGET_TOKEN;
  if (!expected || !given) return false;

  const a = Buffer.from(given, "utf8");
  const b = Buffer.from(expected, "utf8");
  // timingSafeEqual throws on a length mismatch, so that check comes first.
  // Length is not the secret here; the token's contents are.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * A signed-in client, reused while its access token is still valid. Serverless
 * instances are warm for minutes at a time, so this turns most widget refreshes
 * into a single query instead of a sign-in plus a query.
 */
let cached: { client: SupabaseClient; expiresAtMs: number } | null = null;

async function signedInClient(): Promise<SupabaseClient> {
  if (cached && cached.expiresAtMs > Date.now() + 60_000) return cached.client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.HEALTH_ACCOUNT_EMAIL;
  const password = process.env.HEALTH_ACCOUNT_PASSWORD;
  if (!url || !key || !email || !password) throw new NotConfiguredError();

  const client = createClient(url, key, {
    // There is no browser here to persist a session into, and the cache above
    // handles reuse.
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;

  cached = {
    client,
    expiresAtMs: (data.session?.expires_at ?? 0) * 1000,
  };
  return client;
}

/** The number in a phase's walk target ("45 min daily" -> 45). */
function walkGoalFor(dateKey: string): number {
  const match = phaseFor(dateKey).walkTarget.match(/\d+/);
  return match ? Number(match[0]) : 30;
}

export async function getWidgetStatus(): Promise<WidgetStatus> {
  const client = await signedInClient();

  const { data, error } = await client
    .from("health_days")
    .select("*")
    .order("log_date", { ascending: true });
  if (error) throw error;

  const byDate: Record<string, HealthDayRow> = {};
  for (const row of (data ?? []) as HealthDayRow[]) byDate[row.log_date] = row;

  const date = todayKeyInZone();
  const today = byDate[date];
  // Reuses the dashboard the app itself renders, so the widget can never drift
  // out of agreement with the page it links to.
  const dashboard = buildDashboard(byDate, date);

  return {
    date,
    logged: Boolean(today),
    walkMinutes: today?.walk_minutes ?? 0,
    walkGoalMinutes: walkGoalFor(date),
    strengthDone: today?.strength_done ?? false,
    medsTaken: today?.meds_taken ?? false,
    ateLogged: Boolean(today?.breakfast || today?.lunch || today?.dinner || today?.snacks),
    weighedToday: today?.weight_kg !== null && today?.weight_kg !== undefined,
    latestWeightKg: dashboard.currentWeight,
    lostKg: dashboard.lostKg,
    streak: dashboard.streak,
    week: dashboard.week,
    daysLogged: dashboard.daysLogged,
    checkedAt: new Date().toISOString(),
  };
}
