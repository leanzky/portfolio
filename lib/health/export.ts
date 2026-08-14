"use client";

import { getSupabaseClient } from "@/lib/supabase-client";
import type { HealthDayRow } from "./types";

/**
 * Export and storage accounting.
 *
 * The export exists so months of readings are never hostage to one vendor's
 * free tier — and because a spreadsheet is the most useful thing to hand a
 * doctor at the week 11 appointment.
 */

const COLUMNS: { key: keyof HealthDayRow; header: string }[] = [
  { key: "log_date", header: "Date" },
  { key: "weight_kg", header: "Weight (kg)" },
  { key: "systolic", header: "Systolic" },
  { key: "diastolic", header: "Diastolic" },
  { key: "pulse", header: "Pulse" },
  { key: "walk_minutes", header: "Walk (min)" },
  { key: "strength_done", header: "Strength" },
  { key: "meds_taken", header: "Medication" },
  { key: "veg_servings", header: "Vegetables" },
  { key: "water_glasses", header: "Water" },
  { key: "salty_slip", header: "Salty slip" },
  { key: "sleep_hours", header: "Sleep (hrs)" },
  { key: "notes", header: "Notes" },
];

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "yes" : "no";
  const text = String(value);
  // Quote anything containing a comma, quote or newline; double inner quotes.
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: HealthDayRow[]): string {
  const header = COLUMNS.map((column) => column.header).join(",");
  const body = [...rows]
    .sort((a, b) => a.log_date.localeCompare(b.log_date))
    .map((row) => COLUMNS.map((column) => escapeCsv(row[column.key])).join(","))
    .join("\n");
  return `${header}\n${body}\n`;
}

export function downloadCsv(rows: HealthDayRow[]): void {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `health-log-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export type StorageUsage = {
  photoCount: number;
  totalBytes: number;
  averageBytes: number;
};

/**
 * How much space the photos actually take. Shown in the UI so "will I run
 * out of storage?" is a number you can look at rather than a worry.
 */
export async function fetchStorageUsage(): Promise<StorageUsage | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.storage
    .from("progress-photos")
    .list(user.id, { limit: 1000 });
  if (error || !data) return null;

  const totalBytes = data.reduce(
    (total, file) => total + ((file.metadata?.size as number | undefined) ?? 0),
    0
  );

  return {
    photoCount: data.length,
    totalBytes,
    averageBytes: data.length > 0 ? totalBytes / data.length : 0,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
