"use client";

import { useUnlocked } from "@/lib/private-gate";
import { PassphraseGate } from "@/components/private/PassphraseGate";
import { GameshowCatalogue } from "./GameshowCatalogue";

/**
 * Same gate as the course page, same unlock — one passphrase opens both.
 * The catalogue renders only after unlocking, so the format list is not in
 * the initial HTML.
 */
export function GameshowsRoot() {
  const unlocked = useUnlocked();

  if (!unlocked) {
    return (
      <PassphraseGate
        theme="gold"
        kicker="Private build notes"
        title="Game show formats"
        blurb="A working catalogue, not a published piece. Say the magic words."
      />
    );
  }

  return <GameshowCatalogue />;
}
