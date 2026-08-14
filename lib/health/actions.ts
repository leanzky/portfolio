"use client";

import { getSupabaseClient } from "@/lib/supabase-client";
import type { HealthDayInput, HealthDayRow } from "./types";

/**
 * Data access for the health program. Same shape as the meal calendar's
 * actions it replaces: the browser talks to Supabase directly, and Row Level
 * Security — not this file — is what guarantees you only ever see your own
 * rows.
 */

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

/** Every check-in, keyed by "YYYY-MM-DD". */
export async function fetchHealthDays(): Promise<Record<string, HealthDayRow>> {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("health_days")
    .select("*")
    .order("log_date", { ascending: true });
  if (error) throw error;

  const byDate: Record<string, HealthDayRow> = {};
  for (const row of (data ?? []) as HealthDayRow[]) byDate[row.log_date] = row;
  return byDate;
}

/**
 * Create or update one day. Upsert on (user_id, log_date) means the form can
 * save repeatedly through the day — morning BP now, walk minutes later —
 * without the caller tracking whether a row already exists.
 */
export async function saveHealthDay(
  logDate: string,
  values: HealthDayInput
): Promise<HealthDayRow> {
  const supabase = requireClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("health_days")
    .upsert({ user_id: user.id, log_date: logDate, ...values }, { onConflict: "user_id,log_date" })
    .select()
    .single();
  if (error) throw error;
  return data as HealthDayRow;
}

export async function deleteHealthDay(logDate: string): Promise<void> {
  const supabase = requireClient();
  const { error } = await supabase.from("health_days").delete().eq("log_date", logDate);
  if (error) throw error;
}
