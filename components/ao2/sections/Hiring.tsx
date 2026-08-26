import { Note, TableChecklist } from "../Shared";
import {
  appointmentTypes,
  awolNote,
  hiringProcess,
  leaveTable,
  monetizationNote,
  promotionNotes,
} from "../data";
import styles from "../ao2.module.css";

export function HiringSection() {
  return (
    <>
      <h2>Hiring, promotion &amp; leave</h2>
      <p className={styles.lede}>
        You are living this process right now, which makes it one of the
        most testable topics on the written exam and the likeliest work
        sample scenario: walk it, or a leave computation inside it, from
        memory.
      </p>

      <h3>The recruitment and selection process</h3>
      {hiringProcess.map((s) => (
        <p key={s.step}>
          <strong>{s.step}</strong> — {s.detail}
        </p>
      ))}

      <h3>Appointment types</h3>
      <TableChecklist def={appointmentTypes} />

      <h3>Promotion</h3>
      {promotionNotes.map((n) => (
        <div key={n.h}>
          <h4>{n.h}</h4>
          <p>{n.body}</p>
        </div>
      ))}

      <h3>Leave</h3>
      <TableChecklist def={leaveTable} />

      <Note>{awolNote}</Note>
      <Note>{monetizationNote}</Note>

      <Note warn>
        The standard terminal leave and monetisation formula uses a
        constant factor of 0.0481927. Confirm the current computation and
        any updated rate with the HRMO or accounting office before quoting
        it as fact in the assessment — DBM issuances can update the
        constant, and this reviewer is not a substitute for the current
        circular.
      </Note>
    </>
  );
}
