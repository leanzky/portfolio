"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  isChecked,
  subscribe,
  toggle,
} from "@/lib/ao2/progress";
import type { ChecklistDef, TableDef } from "./data";
import styles from "./ao2.module.css";

export function useProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function countDone(
  state: ReturnType<typeof getSnapshot>,
  def: { id: string; items: { id: string }[] } | { id: string; rows: { id: string }[] }
): number {
  const ids = "items" in def ? def.items.map((i) => i.id) : def.rows.map((r) => r.id);
  return ids.reduce((n, id) => n + (isChecked(state, def.id, id) ? 1 : 0), 0);
}

/** A checkbox list bound to the shared progress store — deadline items,
    story bank, work sample drills, and similar action-style checklists. */
export function Checklist({ def }: { def: ChecklistDef }) {
  const state = useProgress();
  const done = countDone(state, def);
  return (
    <>
      <p className={styles.progress}>
        {done} of {def.items.length} done
      </p>
      <ul className={styles.chk}>
        {def.items.map((item) => {
          const checked = isChecked(state, def.id, item.id);
          const inputId = `${def.id}-${item.id}`;
          return (
            <li key={item.id} className={checked ? styles.chkDone : undefined}>
              <input
                type="checkbox"
                id={inputId}
                checked={checked}
                onChange={() => toggle(def.id, item.id)}
              />
              <label htmlFor={inputId}>
                {item.label}
                {item.why && <span className={styles.why}>{item.why}</span>}
              </label>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** A reference table with a per-row tick column bound to the same store —
    Republic Acts, leave types, appointment types. Reading, not doing. */
export function TableChecklist({ def }: { def: TableDef }) {
  const state = useProgress();
  const done = countDone(state, def);
  return (
    <>
      <p className={styles.progress}>
        {done} of {def.rows.length} read
      </p>
      <table>
        <thead>
          <tr>
            <th style={{ width: 38 }} />
            {def.headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {def.rows.map((row) => {
            const checked = isChecked(state, def.id, row.id);
            return (
              <tr key={row.id} className={checked ? styles.rowDone : undefined}>
                <td className={styles.tickCol}>
                  <input
                    type="checkbox"
                    checked={checked}
                    aria-label={`Mark as read: ${row.cols[0]}`}
                    onChange={() => toggle(def.id, row.id)}
                  />
                </td>
                {row.cols.map((c, i) => (
                  <td key={i}>{c}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export function Note({ warn, children }: { warn?: boolean; children: React.ReactNode }) {
  return (
    <div className={`${styles.note} ${warn ? styles.noteWarn : ""}`}>{children}</div>
  );
}

export function Kra({
  title,
  sections,
  open,
}: {
  title: string;
  sections: { h: string; items: string[] }[];
  open?: boolean;
}) {
  return (
    <details className={styles.kra} open={open}>
      <summary>{title}</summary>
      <div className={styles.kraInner}>
        {sections.map((s, i) => (
          <div key={i}>
            {s.h && <h5>{s.h}</h5>}
            <ul>
              {s.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}

export function Star() {
  return (
    <div className={styles.star}>
      <div>
        <strong>S</strong>
        <span>Situation. Where and when, in one or two sentences. Name the workplace.</span>
      </div>
      <div>
        <strong>T</strong>
        <span>Task. What you specifically were responsible for. Not the team, you.</span>
      </div>
      <div>
        <strong>A</strong>
        <span>Action. The steps you took, in order. This is the longest part of the answer.</span>
      </div>
      <div>
        <strong>R</strong>
        <span>Result. What changed. A number if you have one, and how you know.</span>
      </div>
    </div>
  );
}
