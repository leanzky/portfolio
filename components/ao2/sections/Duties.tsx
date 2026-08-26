import { Kra, Note } from "../Shared";
import { kras } from "../data";
import styles from "../ao2.module.css";

export function DutiesSection() {
  return (
    <>
      <h2>What the job actually is</h2>
      <p className={styles.lede}>
        Four key result areas, taken from the job description attached to
        the Division Memorandum. Almost every interview question and work
        sample task will come from one of these four boxes, so read them as
        the syllabus, not as background.
      </p>

      <table>
        <tbody>
          <tr>
            <th>Position title</th>
            <td>Administrative Officer II</td>
            <th>Salary grade</th>
            <td>11</td>
          </tr>
          <tr>
            <th>Parenthetical title</th>
            <td>Administrative Officer I</td>
            <th>Governance level</th>
            <td>School</td>
          </tr>
          <tr>
            <th>Unit</th>
            <td>Elementary School or Junior High School</td>
            <th>Reports to</th>
            <td>School Head</td>
          </tr>
          <tr>
            <th>Supervises</th>
            <td colSpan={3}>Administrative Assistants and Administrative Aides in the school</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Job summary.</strong> Responsible for implementing effective
        and efficient administrative support and selected financial
        functions, particularly personnel administration, property
        custodianship, and financial related tasks in the school.
      </p>

      {kras.map((k) => (
        <Kra key={k.id} title={k.title} sections={k.sections} open={k.open} />
      ))}

      <Note>
        <strong>The elastic clause.</strong> The job description cites DBM
        Budget Circular No. 2004-3, under which a position allocated to the
        new title may be assigned any combination of the duties of the
        former titles it absorbed, including AO I, HRMO I, Information
        Officer I, Public Relations Officer I, and Budget Officer I. The
        actual scope is set by the Principal or School Head. If asked in the
        interview how you would handle work outside your job description,
        this is the correct thing to point at.
      </Note>
    </>
  );
}
