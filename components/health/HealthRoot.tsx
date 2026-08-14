"use client";

import { useUnlocked } from "@/lib/private-gate";
import { PassphraseGate } from "@/components/private/PassphraseGate";
import { HealthApp } from "./HealthApp";

/**
 * Same passphrase as the other private pages. This one holds weight, blood
 * pressure and body photos, so it stays gated for the same reason the others
 * do — with the honest caveat that the gate is obfuscation, not security.
 * The photos themselves are protected properly: a private Storage bucket
 * with per-identity policies, read through short-lived signed URLs.
 */
export function HealthRoot() {
  const unlocked = useUnlocked();

  if (!unlocked) {
    return (
      <PassphraseGate
        theme="sage"
        kicker="Private health log"
        title="Blood pressure & weight"
        blurb="Personal tracker and plan. Say the magic words."
      />
    );
  }

  return <HealthApp />;
}
