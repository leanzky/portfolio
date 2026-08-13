"use client";

import { useUnlocked } from "@/lib/private-gate";
import { PassphraseGate } from "@/components/private/PassphraseGate";
import { CourseApp } from "./CourseApp";
import styles from "./course.module.css";

/**
 * Decides between the lock screen and the course.
 *
 * Rendering the course only once unlocked keeps the lesson markup out of the
 * initial HTML. The bundle still carries it — see lib/private-gate.ts for why
 * that is a deliberate, and limited, trade.
 */
export function CourseRoot() {
  const unlocked = useUnlocked();

  return (
    <div className={`relative min-h-svh ${styles.shell}`}>
      <div className={styles.pageGlow} aria-hidden />
      <div className="relative">
        {unlocked ? (
          <CourseApp />
        ) : (
          <PassphraseGate
            theme="violet"
            kicker="Private study track"
            title="C# & .NET Career Track"
            blurb="This one is for me, not for the portfolio. Say the magic words."
          />
        )}
      </div>
    </div>
  );
}
