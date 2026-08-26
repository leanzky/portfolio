"use client";

import { useState } from "react";
import { Checklist, Note, Star } from "../Shared";
import { questionBank, storyBank } from "../data";
import styles from "../ao2.module.css";

export function BeiSection() {
  const [term, setTerm] = useState("");
  const q = term.trim().toLowerCase();
  const shown = questionBank.filter((item) =>
    q ? `${item.tag} ${item.ask} ${item.hint}`.toLowerCase().includes(q) : true
  );

  return (
    <>
      <h2>Behavioural event interview</h2>
      <p className={styles.lede}>
        A behavioural event interview asks what you actually did, not what
        you would do. Hypothetical answers score badly. Every answer needs
        a real situation, a real action taken by you, and a real result.
      </p>

      <Star />

      <Note>
        <strong>Build a story bank first.</strong> You need roughly six real
        stories, not thirty answers. Most panels can be answered from the
        same six, retold with a different emphasis. Write them out once:
        the procurement automation at Quanby, the operations dashboard at
        Payformers, the database security work, the office and records
        work at Bicol University, a time you handled a mistake, and a time
        you dealt with a difficult person. Then practise mapping the
        question to the story.
      </Note>

      <Checklist def={storyBank} />

      <div className={styles.searchrow}>
        <label htmlFor="qsearch" style={{ fontFamily: "var(--ui)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
          Filter
        </label>
        <input
          type="search"
          id="qsearch"
          placeholder="Type a word, for example confidential, deadline, error, procurement"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <span className={styles.count}>
          {shown.length} of {questionBank.length} questions
        </span>
      </div>

      <div>
        {shown.length === 0 ? (
          <p className={styles.qHint}>
            No question matches that word. Clear the filter to see all {questionBank.length}.
          </p>
        ) : (
          shown.map((item, i) => (
            <div key={i} className={styles.q}>
              <span className={styles.qTag}>{item.tag}</span>
              <p className={styles.qAsk}>{item.ask}</p>
              <p className={styles.qHint}>{item.hint}</p>
            </div>
          ))
        )}
      </div>

      <h3>Questions you should ask them</h3>
      <ul>
        <li>Whether the school is an implementing unit, since it changes the financial reporting the role carries.</li>
        <li>How many administrative assistants and aides are in the station, since the position supervises them.</li>
        <li>What the current state of the 201 files and property inventory is, and whether there are outstanding audit observations to clear.</li>
        <li>What the school head most needs the role to fix in the first three months.</li>
      </ul>
    </>
  );
}
