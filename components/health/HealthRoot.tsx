"use client";

import { useAuth } from "@/lib/health/auth";
import { LoginGate } from "./LoginGate";
import { HealthApp } from "./HealthApp";

/**
 * Real authentication, unlike the passphrase screen on the other private
 * pages. This page holds weight history, a food diary and body photos in a
 * database, so the check happens on the server: Supabase verifies the
 * password, and RLS keyed on auth.uid() decides what any request can read.
 */
export function HealthRoot() {
  const auth = useAuth();

  if (auth.status === "loading") {
    return <div className="min-h-svh" />;
  }

  if (auth.status === "unavailable") {
    return (
      <div className="flex min-h-svh items-center justify-center px-6">
        <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center">
          <p className="font-medium">Tracking is switched off</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            This page needs the Supabase environment variables. Add
            <code className="mx-1 break-all rounded border border-border bg-background px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_SUPABASE_URL
            </code>
            and
            <code className="mx-1 break-all rounded border border-border bg-background px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
            to enable it.
          </p>
        </div>
      </div>
    );
  }

  return auth.status === "signed-in" ? <HealthApp /> : <LoginGate />;
}
