"use client";

import { useUnlocked } from "@/lib/csharp-course/gate";
import { PasswordGate } from "./PasswordGate";
import { CourseApp } from "./CourseApp";
import styles from "./course.module.css";

/**
 * Decides between the lock screen and the course.
 *
 * Rendering the course only once unlocked also keeps the lesson markup out of
 * the initial HTML — the bundle still carries the content, but the page
 * source does not hand it over for free.
 */
export function CourseRoot() {
  const unlocked = useUnlocked();

  return (
    <div className={`relative min-h-svh ${styles.shell}`}>
      <div className={styles.pageGlow} aria-hidden />
      <div className="relative">{unlocked ? <CourseApp /> : <PasswordGate />}</div>
    </div>
  );
}
