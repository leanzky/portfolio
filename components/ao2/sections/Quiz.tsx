"use client";

import { useState, useSyncExternalStore } from "react";
import { quizQuestions } from "../data";
import {
  getQuizServerSnapshot,
  getQuizSnapshot,
  recordAttempt,
  subscribeQuiz,
} from "@/lib/ao2/quiz";
import styles from "../ao2.module.css";

export function QuizSection() {
  const record = useSyncExternalStore(subscribeQuiz, getQuizSnapshot, getQuizServerSnapshot);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === quizQuestions.length;
  const score = quizQuestions.reduce(
    (n, q) => n + (answers[q.id] === q.correct ? 1 : 0),
    0
  );
  const pct = Math.round((score / quizQuestions.length) * 100);

  function pick(qid: string, choiceIndex: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: choiceIndex }));
  }

  function submit() {
    if (!allAnswered) return;
    setSubmitted(true);
    recordAttempt(score, quizQuestions.length);
  }

  function retake() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <>
      <h2>Practice quiz</h2>
      <p className={styles.lede}>
        Twenty-four multiple-choice questions pulled from every tab in this
        reviewer — duties and scoring, templates, procurement and property,
        hiring and promotion, leave law, and the reference shelf. Answer
        all of them, then check your score against the explanation for
        each. This is a self-check, not a leaked exam question.
      </p>

      {record.attempts > 0 && (
        <p className={styles.quizMeta}>
          {`Personal best: ${record.bestScore} of ${record.bestTotal} · Last attempt: ${record.lastScore} of ${record.lastTotal} · ${record.attempts} attempt${record.attempts === 1 ? "" : "s"} so far.`}
        </p>
      )}

      {submitted && (
        <div className={styles.quizScoreBanner}>
          <p className={styles.quizScoreBig}>
            {score} / {quizQuestions.length}
          </p>
          <p className={styles.quizScoreSub}>{pct}% correct this attempt</p>
        </div>
      )}

      {submitted && (
        <div className={styles.quizActions}>
          <button type="button" className={styles.quizRetake} onClick={retake}>
            Retake the quiz
          </button>
        </div>
      )}

      {quizQuestions.map((q, i) => {
        const selected = answers[q.id];
        const isCorrect = submitted && selected === q.correct;
        const isWrong = submitted && selected !== undefined && selected !== q.correct;
        return (
          <div
            key={q.id}
            className={`${styles.quizQuestion} ${
              isCorrect ? styles.quizCorrect : isWrong ? styles.quizWrong : ""
            }`}
          >
            <p className={styles.quizNum}>Question {i + 1} of {quizQuestions.length}</p>
            <p className={styles.quizAsk}>{q.question}</p>
            <ul className={styles.quizOptions}>
              {q.choices.map((choice, ci) => {
                const isSelected = selected === ci;
                const isTheCorrectOne = submitted && ci === q.correct;
                const isSelectedWrong = submitted && isSelected && ci !== q.correct;
                return (
                  <li key={ci} className={styles.quizOption}>
                    <input
                      type="radio"
                      name={q.id}
                      id={`${q.id}-${ci}`}
                      checked={isSelected}
                      disabled={submitted}
                      onChange={() => pick(q.id, ci)}
                    />
                    <label
                      htmlFor={`${q.id}-${ci}`}
                      className={
                        isTheCorrectOne
                          ? styles.quizOptionCorrect
                          : isSelectedWrong
                            ? styles.quizOptionWrong
                            : undefined
                      }
                    >
                      {choice}
                      {isTheCorrectOne && <span className={styles.quizMark}> &#10003;</span>}
                      {isSelectedWrong && <span className={styles.quizMark}> &#10007;</span>}
                    </label>
                  </li>
                );
              })}
            </ul>
            {submitted && <p className={styles.quizExplain}>{q.explanation}</p>}
          </div>
        );
      })}

      {!submitted && quizQuestions.length > 0 && (
        <div className={styles.quizActions}>
          <button
            type="button"
            className={styles.quizSubmit}
            disabled={!allAnswered}
            onClick={submit}
          >
            {allAnswered
              ? "Check my answers"
              : `Answer all questions (${answeredCount} of ${quizQuestions.length})`}
          </button>
        </div>
      )}
    </>
  );
}
