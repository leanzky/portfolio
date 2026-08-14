"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

/**
 * Real authentication for the health log.
 *
 * The other private pages use a client-side passphrase, which is
 * obfuscation — the content is in the bundle either way. This page is
 * different: it holds weight history, food notes and body photos in a real
 * database, so the check has to happen on the server.
 *
 * Supabase email + password does that. The password never appears in the
 * bundle, it is verified by Supabase, and every RLS policy already keys off
 * auth.uid() — so the same policies that protected the anonymous identity now
 * protect this account with no SQL changes.
 *
 * It also fixes a real flaw in the anonymous version: an anonymous identity
 * lives in one browser's storage. Clearing site data, or opening the page on
 * a second device, produced a *different* identity and an empty log with no
 * way back to the old rows. A real account means the same data on the phone,
 * the laptop, and after any browser reset.
 */

export type AuthState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "signed-out" }
  | { status: "signed-in"; userId: string; email: string | null };

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function useAuth(): AuthState {
  // The unavailable case is known before any async work, so it is the initial
  // value rather than something set synchronously inside the effect.
  const [state, setState] = useState<AuthState>(() =>
    configured ? { status: "loading" } : { status: "unavailable" }
  );

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        const user = data.session?.user;
        setState(
          user ? { status: "signed-in", userId: user.id, email: user.email ?? null } : { status: "signed-out" }
        );
      })
      .catch(() => {
        if (!cancelled) setState({ status: "signed-out" });
      });

    // Keeps every tab in step, and handles token refresh and expiry.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setState(
        user ? { status: "signed-in", userId: user.id, email: user.email ?? null } : { status: "signed-out" }
      );
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signIn(email: string, password: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}
