import { Checklist } from "../Shared";
import { workSampleDrills } from "../data";
import styles from "../ao2.module.css";

export function WorkSampleSection() {
  return (
    <>
      <h2>Work sample test</h2>
      <p className={styles.lede}>
        A work sample gives you a task and a time limit and watches how you
        produce something usable. For this position the likely tasks come
        straight from the four key result areas. Practise producing each of
        these cold, on paper and in a spreadsheet — the Templates tab has a
        fill-in model for most of them.
      </p>

      <Checklist def={workSampleDrills} />

      <h3>How work samples are usually marked</h3>
      <ul>
        <li>
          <strong>Completeness.</strong> Did you produce the whole output,
          or run out of time halfway. Finish a rough version first, then
          refine.
        </li>
        <li>
          <strong>Accuracy.</strong> Arithmetic and document requirements.
          One wrong total undermines an otherwise good sheet.
        </li>
        <li>
          <strong>Compliance.</strong> Whether the output would survive an
          audit. Say out loud in your notes which rule you applied.
        </li>
        <li>
          <strong>Presentation.</strong> Legible, labelled, dated, and
          signed where a signature belongs.
        </li>
      </ul>
    </>
  );
}
