import { Note, TableChecklist } from "../Shared";
import { dvSupportingDocs, templates } from "../data";
import styles from "../ao2.module.css";

export function TemplatesSection() {
  return (
    <>
      <h2>Templates</h2>
      <p className={styles.lede}>
        One template for each output an AO II actually produces, grouped by
        the key result area it belongs to. These are patterns to internalise,
        not forms to photocopy — a work sample task will hand you different
        facts and expect you to reproduce the structure from memory.
      </p>

      {templates.map((t) => (
        <div key={t.id} className={styles.tplCard}>
          <div className={styles.tplHead}>
            <p className={styles.tplTitle}>{t.title}</p>
            <span className={styles.tplKra}>{t.kra}</span>
          </div>
          <p className={styles.tplWhen}>
            <strong>When to use it.</strong> {t.when}
          </p>
          <pre className={styles.tplBody}>{t.body}</pre>
          <ul className={styles.tplNotes}>
            {t.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      ))}

      <h3>Common supporting documents, by transaction type</h3>
      <TableChecklist def={dvSupportingDocs} />

      <Note warn>
        A template with a filled-in placeholder left over — a stray
        underscore, a bracket, a wrong year — is the fastest way to turn a
        correct answer into a careless one. Read every field back before
        you consider a template finished.
      </Note>
    </>
  );
}
