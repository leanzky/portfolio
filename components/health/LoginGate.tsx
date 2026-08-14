"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/health/auth";
import styles from "@/components/private/gate.module.css";

/**
 * Real sign-in, not the passphrase screen the other private pages use.
 * Supabase verifies the password; nothing here can be bypassed by reading
 * the bundle.
 */
export function LoginGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      // The auth listener in useAuth swaps the view; nothing to do here.
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not sign in.";
      setError(
        /invalid login/i.test(message)
          ? "That email and password did not match."
          : message
      );
      setPassword("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-16">
      <div
        className={`w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] ${
          error ? styles.shake : ""
        }`}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-800/70">
          Private health log
        </p>
        <h1 className="mt-3 font-mono text-2xl font-bold">Sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Your weight, food and photos live in a real database, so this is a real login rather than
          a passphrase.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-muted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              inputMode="email"
              autoFocus
              required
              placeholder="you@example.com"
              // text-base so iOS does not zoom the page on focus.
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-emerald-700/50"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition focus:border-emerald-700/50"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="min-h-12 w-full rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 min-h-[2.5rem] text-sm" aria-live="polite">
          {error && <p className="text-rose-700">{error}</p>}
        </div>

        <Link href="/" className="text-xs text-muted transition-colors hover:text-foreground">
          &larr; back to portfolio
        </Link>
      </div>
    </div>
  );
}
