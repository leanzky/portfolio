"use client";

import type { RescueNotice } from "@/lib/scrabble-slam/reducer";
import { useT } from "./LanguageToggle";
import styles from "./game.module.css";

/**
 * Announces an automatic no-moves bailout. Dismissal is pure CSS: the
 * animation ends at opacity 0 and each notice gets a fresh key, so it
 * replays from the top without a timer or any state to clean up.
 */
export function RescueToast({ rescue }: { rescue: RescueNotice | null }) {
  const t = useT();
  if (!rescue) return null;

  const gained =
    rescue.added > 1
      ? t("rescue.gainedCards", { n: rescue.added })
      : rescue.added === 1
        ? t("rescue.gainedCard")
        : t("rescue.gainedReroll");

  return (
    <div
      key={rescue.id}
      role="status"
      className={`pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4 ${styles.toast}`}
    >
      <div className="rounded-xl border-2 border-amber-400 bg-[#1a1405] px-4 py-2.5 text-center font-mono shadow-[0_8px_28px_rgba(0,0,0,0.6)]">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-300">
          {rescue.newWord ? t("rescue.deadEnd") : t("rescue.noMoves")}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-amber-200/80">
          {rescue.newWord ? (
            <>
              {t("rescue.newWord")}{" "}
              <span className="font-bold uppercase tracking-widest text-amber-100">
                {rescue.newWord}
              </span>
            </>
          ) : (
            <>{t("rescue.reshuffled", { gained })}</>
          )}
        </p>
      </div>
    </div>
  );
}
