import { Note, TableChecklist } from "../Shared";
import { adminNotes, raGroups } from "../data";
import styles from "../ao2.module.css";

export function LawSection() {
  return (
    <>
      <h2>Reference shelf</h2>
      <p className={styles.lede}>
        What to know from each issuance, rather than the whole text. Read
        the actual issuances where you can; this is a map, not a
        substitute. The first part covers how administration itself is
        structured; the tables that follow group the Republic Acts and
        circulars by what they govern.
      </p>

      <h3>More on administration</h3>
      {adminNotes.map((n) => (
        <div key={n.h}>
          <h4>{n.h}</h4>
          {n.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ))}

      <h3>The republic acts and issuances, grouped</h3>
      {raGroups.map((g) => (
        <div key={g.id}>
          <h4>{g.label}</h4>
          <TableChecklist def={g} />
        </div>
      ))}

      <Note>
        Region and division level issuances sometimes prescribe their own
        templates for the Application of Education and Application of
        Learning and Development submissions. Ask the HRMO whether Region V
        or SDO Camarines Sur has one before finalising those two documents.
      </Note>

      <Note warn>
        This shelf is a study aid reasoned from public issuances, not a
        certified legal text. A few entries — most notably the 2024
        procurement law update — are flagged because they are recent
        changes worth confirming with the BAC or HRMO rather than assumed.
        Section numbers and current-vs-superseded status should be verified
        against the official text before being relied on in the actual
        assessment.
      </Note>
    </>
  );
}
