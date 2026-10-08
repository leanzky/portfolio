/**
 * Extra quiz questions drawn from the assessment-format notes and the worked
 * examples. Appended to quizQuestions in data.ts. Figures match the Examples
 * tab (daily rate 30,000 / 22, undertime table, MOOE sheet).
 */

import type { QuizQuestion } from "./data";

export const assessmentQuiz: QuizQuestion[] = [
  {
    id: "q25",
    question: "Under the usual split of the 20 potential points, how many go to the work sample test?",
    choices: ["5", "10", "15", "20"],
    correct: 1,
    explanation: "Written examination 5, work sample test 10, behavioural events interview 5. The work sample is the biggest single piece, so practical drills matter more than anything you can memorise.",
  },
  {
    id: "q26",
    question: "For a non-teaching AO II vacancy, the written examination most commonly takes the form of:",
    choices: [
      "A 100-item multiple-choice test like the Civil Service exam",
      "A scenario you answer by writing a document, usually a letter",
      "The English Proficiency Test",
      "An oral quiz on Republic Acts",
    ],
    correct: 1,
    explanation: "It is practical: you are given a situation and asked to respond in writing. It measures language, how you present ideas, judgment and leadership. The English Proficiency Test is a teacher-side exam.",
  },
  {
    id: "q27",
    question: "The content of the written and work sample tests is usually tailored to:",
    choices: ["The applicant's degree", "The office where the vacancy sits", "The applicant's age", "A single national question bank"],
    correct: 1,
    explanation: "A subject matter expert builds the test for the vacancy. A supply office item gets supply scenarios; an HR item gets HR scenarios. Find out which office your item belongs to.",
  },
  {
    id: "q28",
    question: "A teacher was late 20, 15 and 10 minutes on three days in a month. Using the CSC undertime table, the total of 45 minutes equals:",
    choices: ["0.062 day", "0.094 day", "0.125 day", "0.045 day"],
    correct: 1,
    explanation: "45 minutes is 0.094 day on the standard table (15 min = 0.031, 30 min = 0.062, 45 min = 0.094, 60 min = 0.125). Add the minutes first, then convert once.",
  },
  {
    id: "q29",
    question: "Using 22 working days as the divisor, what is the daily rate for a monthly salary of Php 30,000.00?",
    choices: ["Php 1,000.00", "Php 1,363.64", "Php 1,250.00", "Php 1,500.00"],
    correct: 1,
    explanation: "30,000 divided by 22 is 1,363.64. The 22-day divisor is the common convention; confirm which divisor your division applies.",
  },
  {
    id: "q30",
    question: "Daily rate Php 1,363.64 and tardiness of 0.094 day. What is the deduction?",
    choices: ["Php 94.00", "Php 128.18", "Php 136.36", "Php 142.50"],
    correct: 1,
    explanation: "1,363.64 x 0.094 = 128.18. Show the daily rate, the equivalent fraction and the multiplication; the method earns marks even if the arithmetic slips.",
  },
  {
    id: "q31",
    question: "A salary adjustment from Php 30,000 to Php 31,500 took effect January 1 but was paid only from April. What differential is owed?",
    choices: ["Php 1,500", "Php 3,000", "Php 4,500", "Php 6,000"],
    correct: 2,
    explanation: "The difference is 1,500 a month, and January, February and March were underpaid: 1,500 x 3 = 4,500.",
  },
  {
    id: "q32",
    question: "A projector is found missing in the monthly count. What should the AO II's incident report recommend?",
    choices: [
      "Charge the room's custodian immediately",
      "Quietly buy a replacement",
      "Elevate to the SDO for guidance on the Report of Loss and the investigation, with no charge or settlement until then",
      "Drop the item from the inventory",
    ],
    correct: 2,
    explanation: "State the facts and the actions already taken, then escalate. An AO II does not decide liability or settle a loss quietly, and an item cannot simply be removed from the books without the proper process.",
  },
  {
    id: "q33",
    question: "Which part of the minutes of a meeting is the most useful and the easiest to be graded on?",
    choices: [
      "A word-for-word transcript",
      "The action items: what, who, and by when",
      "The opinion of each attendee",
      "The seating arrangement",
    ],
    correct: 1,
    explanation: "Minutes record decisions and assignments, not who said what. Also note attendance, absences and that a quorum existed.",
  },
  {
    id: "q34",
    question: "What does \"Memorandum No. 41, s. 2026\" tell you?",
    choices: [
      "It is page 41 of a 2026 issuance",
      "It is the 41st memorandum in the 2026 series",
      "It was issued in the 41st week",
      "It amends Memorandum 41 of 2025",
    ],
    correct: 1,
    explanation: "Number and series year let the memo be cited and filed. Keep a log so two memos never share a number.",
  },
  {
    id: "q35",
    question: "A supplier delivers 20 reams against a purchase order for 25. What is the correct handling?",
    choices: [
      "Accept it as complete and pay in full",
      "Record the shortage on the inspection and acceptance report and write to the supplier for the balance by a set date",
      "Cancel the purchase order",
      "Ignore the difference if the supplier apologises",
    ],
    correct: 1,
    explanation: "Never accept a partial delivery as complete. Document the shortage, request the balance in writing with a deadline, and pay only for what was accepted.",
  },
  {
    id: "q36",
    question: "A teacher asks you for a colleague's service record to check seniority. The best response is:",
    choices: [
      "Hand over a photocopy because both are employees",
      "Decline, cite the confidentiality of 201 files under the Data Privacy Act, and offer the proper route through the school head or HRMO",
      "Show it on your screen only",
      "Ask the colleague to text permission",
    ],
    correct: 1,
    explanation: "Personnel records are personal information. Decline politely, explain the rule and offer the proper channel instead of a flat no.",
  },
  {
    id: "q37",
    question: "A school's monthly MOOE allotment is Php 50,000 and expenses total Php 41,350. What is the balance?",
    choices: ["Php 7,650", "Php 8,650", "Php 9,350", "Php 8,350"],
    correct: 1,
    explanation: "50,000 minus 41,350 is 8,650. If a zero balance is expected, explain the difference (unpaid obligations, unliquidated advances, unspent allotment) instead of forcing the figure.",
  },
  {
    id: "q38",
    question: "How many people usually sit on a behavioural events interview panel, according to former AO IIs?",
    choices: ["One", "Two to four, commonly three", "Six", "Exactly five"],
    correct: 1,
    explanation: "It varies by division, from two to four members, with three the usual. Address the whole panel, not one person.",
  },
  {
    id: "q39",
    question: "Which Excel function totals the quantity only for rows where the category is Paper?",
    choices: ["SUM", "IF", "SUMIF", "COUNT"],
    correct: 2,
    explanation: "SUMIF(range, criteria, sum_range), for example SUMIF(D:D,\"Paper\",E:E). A pivot table gives the same result by category without writing formulas.",
  },
  {
    id: "q40",
    question: "The panel asks something you do not fully know. What scores best?",
    choices: [
      "Give a confident guess",
      "Say what you do know, be honest about the gap, and explain how you would verify it",
      "Change the subject",
      "Say nothing",
    ],
    correct: 1,
    explanation: "Panels measure honesty, confidence and integrity as well as knowledge, and they notice embellishment. Honest and specific beats confident and wrong.",
  },
  {
    id: "q41",
    question: "About laptops and internet on assessment day, what is the safest assumption?",
    choices: [
      "The division provides both",
      "You bring your own laptop, extension cord and internet unless the memorandum says otherwise",
      "No computers are used",
      "Only paper is allowed",
    ],
    correct: 1,
    explanation: "Reported practice is that applicants bring their own setup. Read the memorandum, ask the HRMO, and test everything beforehand.",
  },
  {
    id: "q42",
    question: "What makes a project objective measurable?",
    choices: [
      "A catchy project name",
      "A baseline and a target, such as 12.5 percent late DTRs reduced to below 3 percent",
      "A longer description",
      "A larger budget",
    ],
    correct: 1,
    explanation: "A baseline shows the size of the problem and a target shows what success looks like. Both make monitoring and the later accomplishment report straightforward.",
  },
  {
    id: "q43",
    question: "How should an AO II's monthly accomplishment report be organised?",
    choices: [
      "By date, with no grouping",
      "By key result area, with a count or amount in each line",
      "As one paragraph of general statements",
      "By the names of people met",
    ],
    correct: 1,
    explanation: "The four key result areas are how the panel and the rating system look at the job. Counts and amounts are evidence; adjectives are not.",
  },
  {
    id: "q44",
    question: "Which statement does NOT belong in an incident report?",
    choices: [
      "The date, time and place the loss was discovered",
      "The property number and acquisition cost",
      "A conclusion that a named person is guilty",
      "The actions already taken",
    ],
    correct: 2,
    explanation: "Report facts and actions, then recommend escalation. Deciding fault is for the investigation, not for the person writing the report.",
  },
];
