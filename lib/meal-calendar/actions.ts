import { getSupabaseClient } from "@/lib/supabase-client";
import type { MealCategory, MealLogRow } from "./types";

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

/** All of the current user's logged days, keyed by "YYYY-MM-DD". */
export async function fetchMealLogs(): Promise<Record<string, MealLogRow>> {
  const supabase = requireClient();
  const { data, error } = await supabase.from("meal_logs").select("*");
  if (error) throw error;

  const byDate: Record<string, MealLogRow> = {};
  for (const row of (data ?? []) as MealLogRow[]) byDate[row.log_date] = row;
  return byDate;
}

export async function setMealLog(
  logDate: string,
  category: MealCategory
): Promise<MealLogRow> {
  const supabase = requireClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("meal_logs")
    .upsert(
      { user_id: user.id, log_date: logDate, category },
      { onConflict: "user_id,log_date" }
    )
    .select()
    .single();
  if (error) throw error;
  return data as MealLogRow;
}

export async function clearMealLog(logDate: string): Promise<void> {
  const supabase = requireClient();
  const { error } = await supabase
    .from("meal_logs")
    .delete()
    .eq("log_date", logDate);
  if (error) throw error;
}
