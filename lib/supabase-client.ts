"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Lazily-created singleton browser client, shared by every feature that
 * talks to the project's one Supabase database (Scrabble Slam multiplayer,
 * the meal calendar). If the project isn't configured (no env vars set),
 * this returns null and callers fall back to a "not available" state
 * instead of crashing.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  client = createClient(url, key);
  return client;
}

/**
 * Ensures the current browser has a stable anonymous identity (auth.uid()),
 * which every RPC/RLS policy on the server keys off of. Safe to call
 * repeatedly; only signs in once per session.
 */
export async function ensureAnonymousSession(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: existing } = await supabase.auth.getSession();
  if (existing.session?.user?.id) return existing.session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("Anonymous sign-in failed:", error.message);
    return null;
  }
  return data.user?.id ?? null;
}
