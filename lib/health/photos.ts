"use client";

import { getSupabaseClient } from "@/lib/supabase-client";
import type { Pose, ProgressPhoto, ProgressPhotoRow } from "./types";

/**
 * Progress photos.
 *
 * These are body photos, so the bucket is PRIVATE and the app reads through
 * short-lived signed URLs rather than public links — see
 * supabase/migrations/0009_health_program.sql, where the storage policies
 * confine every identity to its own folder.
 *
 * Images are downscaled in the browser before upload. A modern phone camera
 * produces 4–8 MB files; 1280px on the long edge is far more than enough to
 * see a body change, uploads in a second on mobile data, and keeps the
 * bucket small.
 */

const BUCKET = "progress-photos";
const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;
/** An hour is plenty for viewing and avoids handing out durable links. */
const SIGNED_URL_TTL_SECONDS = 3600;

function requireClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

/** Draw the file to a canvas at a sane size and re-encode it as JPEG. */
async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    // No canvas available — send the original rather than failing outright.
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  return blob ?? file;
}

export async function uploadProgressPhoto(options: {
  file: File;
  takenOn: string;
  pose: Pose;
  weightKg: number | null;
  note?: string | null;
}): Promise<ProgressPhotoRow> {
  const supabase = requireClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const blob = await downscale(options.file);
  // The folder must be the user id — the storage policy checks exactly this.
  const path = `${user.id}/${crypto.randomUUID()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("progress_photos")
    .insert({
      user_id: user.id,
      taken_on: options.takenOn,
      storage_path: path,
      pose: options.pose,
      weight_kg: options.weightKg,
      note: options.note ?? null,
    })
    .select()
    .single();

  if (error) {
    // Do not leave an orphaned file behind if the row failed to insert.
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }

  return data as ProgressPhotoRow;
}

/** Newest first, each with a signed URL that expires within the hour. */
export async function fetchProgressPhotos(): Promise<ProgressPhoto[]> {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from("progress_photos")
    .select("*")
    .order("taken_on", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as ProgressPhotoRow[];
  if (rows.length === 0) return [];

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(rows.map((row) => row.storage_path), SIGNED_URL_TTL_SECONDS);

  const urlByPath = new Map((signed ?? []).map((entry) => [entry.path, entry.signedUrl]));
  return rows.map((row) => ({ ...row, url: urlByPath.get(row.storage_path) ?? null }));
}

export async function deleteProgressPhoto(photo: ProgressPhotoRow): Promise<void> {
  const supabase = requireClient();
  // Row first: an orphaned file is invisible, an orphaned row is a broken card.
  const { error } = await supabase.from("progress_photos").delete().eq("id", photo.id);
  if (error) throw error;
  await supabase.storage.from(BUCKET).remove([photo.storage_path]);
}
