import { Checklist, Note } from "../Shared";
import { basicChecklist, compChecklist } from "../data";
import styles from "../ao2.module.css";

export function PackSection() {
  return (
    <>
      <h2>Submission pack</h2>
      <p className={styles.lede}>
        Incomplete submission removes you from the pool of official
        applicants before anything is scored. Two long tagboard folders,
        black for this position, name and position printed on the front.
      </p>

      <h3>Folder 1 — Basic requirements</h3>
      <Checklist def={basicChecklist} />

      <h3>Folder 2 — Comparative assessment, sealed brown envelope</h3>
      <Checklist def={compChecklist} />

      <Note warn>
        <strong>Before sealing.</strong> Search every document for square
        brackets. Any placeholder left in a signed submission is worse than
        the sentence being absent, and the Omnibus Sworn Statement makes
        false or fraudulent documents a ground for disqualification. Sign
        the flap of the brown envelope across the seal, as Enclosure 1
        requires.
      </Note>

      <h3>Practical details</h3>
      <ul>
        <li>
          Two long size ordinary tagboard folders. Folder colour for
          Administrative Officer II is <strong>black</strong>.
        </li>
        <li>Name and position applied for printed on the front of both folders and the envelope.</li>
        <li>Documents labelled or tabbed, in the order listed in Enclosure 1.</li>
        <li>Bring original copies to the comparative assessment for validation.</li>
        <li>Submit to the SDO Receiving Section, addressed to the Schools Division Superintendent, attention HRMO.</li>
        <li>
          Submitted documents stay with the HRMPSB after the rank list is
          released, and the committee is not responsible for their
          safekeeping. Keep your own copies.
        </li>
      </ul>
    </>
  );
}
