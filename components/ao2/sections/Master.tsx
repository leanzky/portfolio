"use client";

import { Checklist, countDone, useProgress } from "../Shared";
import { allChecklists, allTables, deadlineChecklist, assessDayChecklist } from "../data";
import styles from "../ao2.module.css";

export function Rollup({ onJump }: { onJump: (tabId: string) => void }) {
  const state = useProgress();

  const rows = [
    ...allChecklists.map((def) => ({
      id: def.id,
      label: def.label,
      tabId: def.tabId,
      done: countDone(state, def),
      total: def.items.length,
    })),
    ...allTables.map((def) => ({
      id: def.id,
      label: def.label,
      tabId: def.tabId,
      done: countDone(state, def),
      total: def.rows.length,
    })),
  ];

  const done = rows.reduce((n, r) => n + r.done, 0);
  const total = rows.reduce((n, r) => n + r.total, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <>
      <div className={styles.bigprog}>
        <div className={styles.bigprogHead}>
          <span>
            {done} of {total} complete
          </span>
          <span>{pct}%</span>
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div>
        {rows.map((r) => {
          const rpct = r.total ? Math.round((r.done / r.total) * 100) : 0;
          const full = r.done === r.total;
          return (
            <div key={r.id} className={`${styles.roll} ${full ? styles.rollFull : ""}`}>
              <div className={styles.nm}>
                <button type="button" onClick={() => onJump(r.tabId)}>
                  {r.label}
                </button>
              </div>
              <div className={styles.rollMini}>
                <i style={{ width: `${rpct}%` }} />
              </div>
              <div className={styles.rollN}>
                {r.done} / {r.total}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function MasterSection({ onJump }: { onJump: (tabId: string) => void }) {
  return (
    <>
      <h2>Everything, in one place</h2>
      <p className={styles.lede}>
        Every checklist and reference table in this reviewer rolls up here.
        Tick items in their own tab or in this one; the counts stay in step
        either way.
      </p>

      <Rollup onJump={onJump} />

      <h3>Before the deadline, 1 September 2026</h3>
      <Checklist def={deadlineChecklist} />

      <h3>Before the assessment day</h3>
      <Checklist def={assessDayChecklist} />
    </>
  );
}
