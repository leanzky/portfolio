import { Note } from "../Shared";
import { scoringRows, timelineRows } from "../data";
import styles from "../ao2.module.css";

export function ScoreSection() {
  const total = scoringRows.reduce((n, r) => n + r.points, 0);
  return (
    <>
      <h2>How the 100 points break down</h2>
      <p className={styles.lede}>
        Administrative Officer II sits at Salary Grade 11, so the column
        that applies is SG 10 to 23 and SG 27. Positions at SG 24 to 33 use
        a different weighting for the same seven criteria — ask the HRMO if
        you are ever unsure which table governs a given vacancy. The row
        highlighted below is the one the assessment day decides; everything
        else is settled by the papers already in your folder.
      </p>

      <table>
        <thead>
          <tr>
            <th>Criterion</th>
            <th>Points</th>
            <th>Decided by</th>
          </tr>
        </thead>
        <tbody>
          {scoringRows.map((r) => (
            <tr key={r.criterion} className={r.you ? styles.rowYou : undefined}>
              <td>{r.you ? <strong>{r.criterion}</strong> : r.criterion}</td>
              <td className={styles.num}>{r.points}</td>
              <td>{r.you ? <strong>{r.decidedBy}</strong> : r.decidedBy}</td>
            </tr>
          ))}
          <tr className={styles.rowTotal}>
            <td>Total</td>
            <td className={styles.num}>{total}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <Note>
        Twenty points is one fifth of the ranking, and it is split across
        three separate exercises. Applicants who are close on paper are
        separated here. Treat the written test, the interview, and the work
        sample as three different skills, because they are.
      </Note>

      <h3>What happens, and when</h3>
      <table>
        <tbody>
          {timelineRows.map((r) => (
            <tr key={r.label}>
              <th>{r.label}</th>
              <td>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        The gap between the deadline and the assessment date is your
        preparation window. It is not announced yet, which means it can be
        short. Prepare before the memorandum comes out, not after.
      </p>
    </>
  );
}
