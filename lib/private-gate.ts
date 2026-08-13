"use client";

import { useSyncExternalStore } from "react";

/**
 * The shared passphrase gate for the private pages (/csharp, /gameshows).
 *
 * This is deliberately a low-friction lock, NOT security. Everything the
 * gated pages render ships in the client bundle, so anyone who opens devtools
 * can read them without typing anything. It exists to keep the pages out of
 * casual browsing and out of search results, which is all it is for. Nothing
 * behind it is confidential, and that is what makes the trade acceptable.
 *
 * The passphrase is stored as a hash rather than a literal only so that
 * grepping the built JavaScript for the obvious string does not hand it over.
 * That is obfuscation, and calling it anything else would be dishonest. Real
 * protection means the content never reaching the browser unauthorised, which
 * means a server-side check — see the README.
 *
 * One unlock opens every gated page: they belong to the same person, and
 * typing the same phrase twice is friction with no benefit.
 */

const UNLOCK_KEY = "private-pages-unlocked-v1";

/** FNV-1a, 32-bit. Small, fast, and sufficient for an equality check. */
function hash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** hash("pleasehireme") */
const PASSPHRASE_HASH = "kseiv7";

/** Case-insensitive and whitespace-tolerant: a typo in casing is not a lock. */
export function isCorrectPassphrase(input: string): boolean {
  return hash(input.trim().toLowerCase()) === PASSPHRASE_HASH;
}

/* ---------- unlock state, read as an external store ----------
   localStorage does not exist during server rendering, so the server and
   hydration snapshots are always "locked" and React swaps in the real value
   immediately after hydrating. */

let cache: boolean | null = null;
const listeners = new Set<() => void>();

function readUnlocked(): boolean {
  try {
    return window.localStorage.getItem(UNLOCK_KEY) === "true";
  } catch {
    // Private mode, or storage disabled — the gate just asks again each visit.
    return false;
  }
}

function getSnapshot(): boolean {
  cache ??= readUnlocked();
  return cache;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function set(unlocked: boolean): void {
  cache = unlocked;
  try {
    if (unlocked) window.localStorage.setItem(UNLOCK_KEY, "true");
    else window.localStorage.removeItem(UNLOCK_KEY);
  } catch {
    /* the session still works, it just will not be remembered */
  }
  listeners.forEach((l) => l());
}

export function unlock(): void {
  set(true);
}

export function lock(): void {
  set(false);
}

export function useUnlocked(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
