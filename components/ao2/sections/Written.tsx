import { Checklist, Note } from "../Shared";
import { writtenCoverage } from "../data";
import {
  assessmentFormatNotes,
  assessmentKit,
  potentialBreakdown,
  scenarioPrompts,
} from "../assessment";
import styles from "../ao2.module.css";

export function WrittenSection() {
  return (
    <>
      <h2>Written test</h2>
      <p className={styles.lede}>
        The knowledge coverage further down is derived from the four key result areas and
        from the issuances the position is required to follow. It is a
        reasoned study plan, not a leaked outline. Nobody outside the
        HRMPSB knows the actual questions. The Reference Shelf tab has the
        full reading list this coverage draws from, and the Hiring,
        Promotion &amp; Leave tab has the process detail behind item w13.
      </p>

      <h3>What the assessment day is made of</h3>
      <p>
        The 20 potential points are split across three exercises. The split
        below is the common one under DepEd Order 007, s. 2023. Your
        division&apos;s memorandum has the final say.
      </p>
      <table>
        <thead>
          <tr>
            <th>Part</th>
            <th>Points</th>
            <th>What it is</th>
          </tr>
        </thead>
        <tbody>
          {potentialBreakdown.map((r) => (
            <tr key={r.part}>
              <td>{r.part}</td>
              <td className={styles.num}>{r.points}</td>
              <td>{r.what}</td>
            </tr>
          ))}
          <tr className={styles.rowTotal}>
            <td>Potential</td>
            <td className={styles.num}>
              {potentialBreakdown.reduce((n, r) => n + r.points, 0)}
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {assessmentFormatNotes.map((n) => (
        <div key={n.h}>
          <h4>{n.h}</h4>
          {n.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ))}

      <h3>Practice scenarios</h3>
      <p>
        The written test hands you a situation and expects a document back.
        Answer each of these in writing, against the clock, then compare
        with the Examples tab.
      </p>
      <table>
        <thead>
          <tr>
            <th>Scenario</th>
            <th>A good answer shows</th>
          </tr>
        </thead>
        <tbody>
          {scenarioPrompts.map((s) => (
            <tr key={s.id}>
              <td>{s.prompt}</td>
              <td>{s.shows}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Assessment-day kit</h3>
      <Checklist def={assessmentKit} />

      <h3>Knowledge coverage</h3>
      <Checklist def={writtenCoverage} />

      <Note warn>
        <strong>The trap to avoid.</strong> Your background is technical, so
        the temptation is to over prepare on systems and under prepare on
        leave law, benefits computation, and property forms. The clerical
        core of this job is where a computer science graduate is most
        likely to lose points, and it is also where the panel will be
        watching hardest.
      </Note>
    </>
  );
}
