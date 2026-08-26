import { Checklist, Note } from "../Shared";
import { writtenCoverage } from "../data";
import styles from "../ao2.module.css";

export function WrittenSection() {
  return (
    <>
      <h2>Written test</h2>
      <p className={styles.lede}>
        The coverage below is derived from the four key result areas and
        from the issuances the position is required to follow. It is a
        reasoned study plan, not a leaked outline. Nobody outside the
        HRMPSB knows the actual questions. The Reference Shelf tab has the
        full reading list this coverage draws from, and the Hiring,
        Promotion &amp; Leave tab has the process detail behind item w13.
      </p>

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
