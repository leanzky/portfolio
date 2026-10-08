import { Note } from "../Shared";
import { exampleNotes, examples } from "../assessment";
import styles from "../ao2.module.css";

export function ExamplesSection() {
  return (
    <>
      <h2>Example documents</h2>
      <p className={styles.lede}>
        Fully filled-in versions of the documents the written test and the
        work sample ask for. The Templates tab shows the empty pattern; this
        tab shows what a finished one looks like, with realistic numbers.
        Read one, then close the tab and rebuild it from the scenario alone.
      </p>

      <Note warn>
        <ul>
          {exampleNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Note>

      {examples.map((t) => (
        <div key={t.id} className={styles.tplCard}>
          <div className={styles.tplHead}>
            <p className={styles.tplTitle}>{t.title}</p>
            <span className={styles.tplKra}>{t.kra}</span>
          </div>
          <p className={styles.tplWhen}>
            <strong>When to use it.</strong> {t.when}
          </p>
          <pre className={`${styles.tplBody} ${styles.tplBodyFixed}`}>{t.body}</pre>
          <ul className={styles.tplNotes}>
            {t.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
