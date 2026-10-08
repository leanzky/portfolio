"use client";

import { useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getTabServerSnapshot,
  getTabSnapshot,
  setActiveTab,
  subscribeTab,
} from "@/lib/ao2/active-tab";
import { MasterSection } from "./sections/Master";
import { DutiesSection } from "./sections/Duties";
import { ScoreSection } from "./sections/Score";
import { WrittenSection } from "./sections/Written";
import { BeiSection } from "./sections/Bei";
import { WorkSampleSection } from "./sections/WorkSample";
import { OfflineStatus } from "./OfflineStatus";
import { ExamplesSection } from "./sections/Examples";
import { TemplatesSection } from "./sections/Templates";
import { LawSection } from "./sections/Law";
import { HiringSection } from "./sections/Hiring";
import { PackSection } from "./sections/Pack";
import { QuizSection } from "./sections/Quiz";
import styles from "./ao2.module.css";

const TABS: { id: string; label: string; render: () => React.ReactNode }[] = [
  { id: "master", label: "Checklist", render: () => null },
  { id: "duties", label: "The position", render: () => <DutiesSection /> },
  { id: "score", label: "How you are scored", render: () => <ScoreSection /> },
  { id: "written", label: "Written test", render: () => <WrittenSection /> },
  { id: "templates", label: "Templates", render: () => <TemplatesSection /> },
  { id: "examples", label: "Examples", render: () => <ExamplesSection /> },
  { id: "bei", label: "Interview (BEI)", render: () => <BeiSection /> },
  { id: "work", label: "Work sample", render: () => <WorkSampleSection /> },
  { id: "hiring", label: "Hiring, promotion & leave", render: () => <HiringSection /> },
  { id: "law", label: "Reference shelf", render: () => <LawSection /> },
  { id: "pack", label: "Submission pack", render: () => <PackSection /> },
  { id: "quiz", label: "Practice quiz", render: () => <QuizSection /> },
];

export function AO2Reviewer() {
  const active = useSyncExternalStore(subscribeTab, getTabSnapshot, getTabServerSnapshot);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const topRef = useRef<HTMLDivElement | null>(null);

  function jump(tabId: string) {
    setActiveTab(tabId);
    topRef.current?.scrollIntoView({ block: "start" });
  }

  function handleKey(e: React.KeyboardEvent, index: number) {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    if (e.key === "ArrowLeft") nextIndex = (index - 1 + TABS.length) % TABS.length;
    if (nextIndex === null) return;
    e.preventDefault();
    const next = TABS[nextIndex];
    setActiveTab(next.id);
    buttonRefs.current[next.id]?.focus();
  }

  return (
    <div className={styles.root} ref={topRef}>
      <header className={styles.mast}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>
            Division Memorandum No. 556, s. 2026 &nbsp;&middot;&nbsp; SDO Camarines Sur
          </p>
          <h1>
            Administrative
            <br />
            Officer II
          </h1>
          <p className={styles.sub}>
            Salary Grade 11 &nbsp;&middot;&nbsp; School level &nbsp;&middot;&nbsp;
            Reports to the School Head &nbsp;&middot;&nbsp; Supervises
            Administrative Assistants and Aides
          </p>
          <div className={styles.stamp}>
            Applications close
            <b>01 September 2026 &middot; 5:00 PM</b>
            No late documents accepted
          </div>
          <nav aria-label="Sections">
            <ul className={styles.tabs} role="tablist">
              {TABS.map((t, i) => (
                <li key={t.id}>
                  <button
                    ref={(el) => {
                      buttonRefs.current[t.id] = el;
                    }}
                    role="tab"
                    aria-selected={active === t.id}
                    aria-controls={`panel-${t.id}`}
                    id={`tab-${t.id}`}
                    onClick={() => setActiveTab(t.id)}
                    onKeyDown={(e) => handleKey(e, i)}
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={styles.folderline} />
        <div className={`${styles.wrap} ${styles.otherfolders}`}>
          This reviewer covers Administrative Officer II only. Folder colour
          per Enclosure 1 for this position is <strong>black</strong>.
        </div>
      </header>

      <main className={styles.wrap}>
        {TABS.map((t) => (
          <section
            key={t.id}
            className={styles.panel}
            role="tabpanel"
            id={`panel-${t.id}`}
            aria-labelledby={`tab-${t.id}`}
            hidden={active !== t.id}
          >
            {t.id === "master" ? <MasterSection onJump={jump} /> : t.render()}
          </section>
        ))}
      </main>

      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <p>
            Study aid prepared from Division Memorandum No. 556, s. 2026 and
            its enclosures, DepEd Order No. 007, s. 2023, and DepEd Order
            No. 021, s. 2024. The written test, interview, work sample,
            templates, and legal reference content are reasoned from the
            position&apos;s key result areas and public issuances, and are
            not a copy of any actual examination or a certified legal text.
            Verify all requirements, section numbers, and current amounts
            against the official memorandum, the relevant issuance, and the
            SDO Camarines Sur HRMO before relying on them.
          </p>
          <OfflineStatus />
          <p>
            Checklist progress is saved in this browser only.{" "}
            <Link href="/" className={styles.backtop}>
              &larr; Back to portfolio
            </Link>
            {" · "}
            <button
              type="button"
              className={styles.backtop}
              onClick={() => topRef.current?.scrollIntoView({ block: "start" })}
            >
              Back to top
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
}
