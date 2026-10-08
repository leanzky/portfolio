/**
 * All reviewer content, kept out of the components so the components stay
 * thin renderers. This is the file to edit when the memorandum changes, a
 * new law needs adding, or a template needs correcting.
 *
 * Accuracy note carried through the whole reviewer: this is a study aid
 * reasoned from public issuances, not a certified legal text. Section
 * numbers, exact amounts, and current-vs-superseded status of an issuance
 * should be confirmed against the official text or the HRMO before being
 * relied on in the actual assessment.
 */

import { assessmentKit } from "./assessment";
import { assessmentQuiz } from "./assessmentQuiz";

export type ChecklistItem = { id: string; label: string; why?: string };
export type ChecklistDef = {
  id: string;
  label: string;
  tabId: string;
  items: ChecklistItem[];
};

export type TableRow = { id: string; cols: string[] };
export type TableDef = {
  id: string;
  label: string;
  tabId: string;
  headers: string[];
  rows: TableRow[];
};

/* ============================================================
   THE POSITION — key result areas
   ============================================================ */

export type KraSection = { h: string; items: string[] };
export type Kra = { id: string; title: string; sections: KraSection[]; open?: boolean };

export const kras: Kra[] = [
  {
    id: "kra1",
    title: "KRA 1 — Personnel Administration",
    open: true,
    sections: [
      {
        h: "Recruitment and selection",
        items: [
          "Provide human resources management support to the school head and coordinate with the AO IV (HRMO II) of the Schools Division Office on the recruitment and selection of applicants in the assigned school; on promotion and deployment, by checking and validating the completeness and authenticity of documents to be submitted to the HRMO for preparation and issuance of appointment; and on preparing the Equivalent Record Form of qualified teachers for submission to the SDO.",
        ],
      },
      {
        h: "Personnel records",
        items: [
          "Regularly update 201 files and maintain the database of personal information of school personnel.",
          "Act for or assist the designated Agency Authorized Officer in verifying and approving GSIS loans and agency remittance advice as may be delegated.",
          "Consolidate the daily time record of school personnel and prepare the monthly report of service (Form 7).",
          "Monitor and record attendance and absence, and report issues and concerns to the school head.",
          "Act on leave applications and facilitate recommendation by the school head and approval by the SDS.",
          "Update vacation service and leave credits and communicate them regularly to all concerned.",
          "Maintain the confidentiality of personal information of school personnel to which he has legal access.",
          "Coordinate with the BIR, GSIS, PhilHealth, Pag-IBIG, CSC, and other agencies on policies affecting personnel.",
        ],
      },
      {
        h: "Compensation and benefits",
        items: [
          "Compute and submit to the SDO the applicable personnel benefits for processing, funding, and release, such as maternity benefits, step increments, salary differentials, overtime pay, and proportional vacation pay.",
          "Monitor and prepare notices for step increments and adjustments, and submit them to the HRMO for checking and verification.",
          "Process retirement and separation benefits for indorsement by the school head to the SDO.",
        ],
      },
      {
        h: "Other HR functions",
        items: [
          "Update school personnel on the latest HR related policies.",
          "Develop and present innovative strategies for improving HR practice in the school.",
          "Assist the school head in performance management, rewards and recognition, and learning and development.",
          "Prepare and submit HR related reports; coordinate regularly with the HRMO.",
          "Facilitate submission and approval by the SDS of Permit to Study, Practice of Profession, Authority to Travel, and other school requests.",
        ],
      },
    ],
  },
  {
    id: "kra2",
    title: "KRA 2 — Property Custodianship",
    sections: [
      {
        h: "",
        items: [
          "Facilitate procurement of supplies, materials, and equipment based on the approved SIP or AIP, or as directed by the school head.",
          "Ensure that supplies, materials, equipment, textbooks, and other learning resource materials are stored properly in a secured facility.",
          "Keep an updated inventory of all supplies, materials, equipment, textbooks, and other learning resource materials.",
          "Issue supplies, materials, equipment, textbooks, and learning resource materials to requesting teaching and non teaching personnel.",
          "Prepare and submit reports on all property accountability of the school.",
        ],
      },
    ],
  },
  {
    id: "kra3",
    title: "KRA 3 — General Administrative Support",
    sections: [
      {
        h: "",
        items: [
          "Assist the school head in the preparation of School Form 7 and the loading of teachers.",
          "Assist the school planning team in the preparation of the SIP and AIP.",
          "Provide general administrative support to the school head and teachers, including reproduction of learning materials, encoding of reports, and preparation of documents.",
          "Perform other functions as may be assigned by the school head.",
        ],
      },
    ],
  },
  {
    id: "kra4",
    title: "KRA 4 — Financial Management",
    sections: [
      {
        h: "",
        items: [
          "Assist the school head in preparing the cash disbursement register, the authority to debit or credit account, and liquidation reports including supporting documents.",
          "For implementing units, assist the school head in preparing reports required by the COA, the DBM, and other oversight agencies.",
          "Facilitate submission of all financial documents to the SDO and to the bank where necessary.",
          "Provide assistance in other financial related tasks of the school head.",
        ],
      },
    ],
  },
];

/* ============================================================
   SCORING
   ============================================================ */

export const scoringRows: { criterion: string; points: number; decidedBy: string; you?: boolean }[] = [
  { criterion: "Education", points: 5, decidedBy: "Transcript, diploma, graduate units" },
  { criterion: "Training", points: 10, decidedBy: "Certificates of training, hours counted" },
  { criterion: "Experience", points: 15, decidedBy: "Certificates of employment, service records" },
  { criterion: "Performance", points: 20, decidedBy: "Performance ratings from the last rating period" },
  { criterion: "Outstanding Accomplishments", points: 10, decidedBy: "Contributions recognised by an authorised body" },
  { criterion: "Application of Education", points: 10, decidedBy: "Written submission plus means of verification" },
  { criterion: "Application of Learning and Development", points: 10, decidedBy: "Written submission plus means of verification" },
  {
    criterion: "Potential — written test, behavioural event interview, work sample test",
    points: 20,
    decidedBy: "Assessment day. This is the part you can still move.",
    you: true,
  },
];

export const timelineRows: { label: string; value: string }[] = [
  { label: "Submission of documents", value: "19 August to 1 September 2026, SDO Receiving Section" },
  { label: "Online orientation", value: "20 August 2026, 10:00 AM onwards, Microsoft Teams" },
  { label: "Initial evaluation", value: "1 September 2026 onwards, HRMO and HRMPSB" },
  { label: "Written test, interview, comparative assessment", value: "To be announced in a separate memorandum" },
  { label: "Finalisation and approval of results", value: "To be announced in a separate memorandum" },
];

/* ============================================================
   WRITTEN TEST COVERAGE
   ============================================================ */

export const writtenCoverage: ChecklistDef = {
  id: "written",
  label: "Written test coverage",
  tabId: "written",
  items: [
    { id: "w1", label: "Republic Act 6713 — Code of Conduct and Ethical Standards", why: "The eight norms of conduct, the prohibited acts, and the duty to act promptly on letters and requests within fifteen working days. This is the single most likely source of ethics questions." },
    { id: "w2", label: "Republic Act 9184 — Government Procurement Reform Act", why: "Modes of procurement, when public bidding is required, the role of the BAC, and why splitting of contracts is prohibited. Tie it to the SIP and AIP as the basis for school purchases." },
    { id: "w3", label: "COA rules on cash advances and liquidation", why: "COA Circular 97-002 and COA Circular 2012-001. Who may be granted a cash advance, the purposes allowed, the liquidation periods, and the consequence of failing to liquidate." },
    { id: "w4", label: "The disbursement cycle", why: "Appropriation, obligation, disbursement. The documents at each step: disbursement voucher, official receipt, purchase order, inspection and acceptance report, liquidation report. Know why no disbursement may precede an appropriation." },
    { id: "w5", label: "Republic Act 10173 — Data Privacy Act", why: "What counts as personal and sensitive personal information, lawful processing, and the duty of confidentiality over 201 files. Expect at least one scenario question about releasing employee information." },
    { id: "w6", label: "Leave law and the Omnibus Rules on Leave", why: "Vacation and sick leave accrual, monetisation, maternity and paternity leave, special leave benefits, and the difference between leave without pay and absence without leave." },
    { id: "w7", label: "DTR, Form 7, and School Form 7", why: "Do not confuse them. Form 7 is the monthly report of service for personnel. School Form 7 is the school personnel assignment and subject loading report. A question that swaps them is an easy trap." },
    { id: "w8", label: "Step increments, salary differentials, and benefits", why: "Length of service and meritorious performance as bases for step increment, plus the computation of proportional vacation pay and overtime. Know which office funds and releases each." },
    { id: "w9", label: "Property and supply management", why: "Inventory custodian slip, property acknowledgement receipt, requisition and issue slip, and the annual physical count. Know who signs what." },
    { id: "w10", label: "DepEd Order 007, s. 2023 and DepEd Order 021, s. 2024", why: "You are being hired under these. Know the definitions of outstanding accomplishments, application of education, and application of learning and development, and the composition and role of the HRMPSB." },
    { id: "w11", label: "SIP, AIP, and the school planning cycle", why: "What the School Improvement Plan contains, how the Annual Implementation Plan derives from it, and why procurement must be anchored on it." },
    { id: "w12", label: "MOOE and school fund sources", why: "What school MOOE may and may not be spent on, the difference between an implementing unit and a non implementing unit, and where the school head's authority ends." },
    { id: "w13", label: "Hiring, promotion, and appointment process", why: "Publication of vacancy, the HRMPSB, qualification standards, next-in-rank, the three salary grade rule, probationary status, and CSC attestation. Covered in full in the Hiring, Promotion & Leave tab." },
    { id: "w14", label: "Republic Act 9155 — Governance of Basic Education Act", why: "School-based management, the School Head's dual role as instructional and administrative leader, and how authority is decentralised from Central Office down to the school." },
    { id: "w15", label: "General ability items", why: "Reading comprehension, correct English usage in official correspondence, basic numerical reasoning and percentages, and simple analytical items. These usually carry more weight than applicants expect." },
    { id: "w16", label: "Office correspondence conventions", why: "Memorandum versus letter versus indorsement, the parts of an official communication, and the standard salutations and closings used in DepEd." },
  ],
};

/* ============================================================
   BEI — story bank + question bank
   ============================================================ */

export const storyBank: ChecklistDef = {
  id: "stories",
  label: "Story bank",
  tabId: "bei",
  items: [
    { id: "s1", label: "The procurement automation at Quanby", why: "Covers process improvement, initiative, and working across departments. Lead with the problem in the old process." },
    { id: "s2", label: "The operations dashboard at Payformers", why: "Covers organising messy work into one traceable flow, and serving internal users." },
    { id: "s3", label: "The database security and access control work", why: "Covers confidentiality, accountability, and catching a problem before it caused damage." },
    { id: "s4", label: "The records and office work at Bicol University", why: "Your closest match to clerical duties. Do not skip it because it is the smallest role." },
    { id: "s5", label: "A mistake you made and corrected", why: "This will be asked. Have one ready that is real, owned, and closed out." },
    { id: "s6", label: "A difficult person or a request you had to refuse", why: "Describe the behaviour, not the character. Say what you offered instead of a flat no." },
  ],
};

export const questionBank: { tag: string; ask: string; hint: string }[] = [
  ["Personnel Administration", "Tell me about a time you had to keep information confidential when someone with authority over you wanted it.", "Confidentiality of 201 files is a legal duty, not a courtesy. A good answer names the rule, describes how you declined without being obstructive, and says where you routed the request instead."],
  ["Personnel Administration", "Describe a time you found an error in a record that someone else had prepared.", "They are testing whether you correct quietly and constructively. Say how you verified it was an error before raising it, and who you told."],
  ["Personnel Administration", "Give an example of a time you had to explain a technical or complicated matter to someone who did not have your background.", "You will be explaining benefits and deductions to teachers. Use a real instance and describe how you checked they had actually understood."],
  ["Personnel Administration", "Tell me about a time you had to organise records that were in a poor state.", "Draw on the records and data work at Bicol University or the systems work since. Describe the state before, the method, and what retrieval looked like afterwards."],
  ["Property Custodianship", "Describe a time you improved a purchasing or supply process.", "This is the procurement automation story. Lead with the problem in the old process, not with the technology."],
  ["Property Custodianship", "Tell me about a time you had to account for something that was missing or unaccounted for.", "If you do not have a supplies example, an equivalent about reconciling records or transactions works, provided you say so honestly rather than stretching the facts."],
  ["Property Custodianship", "How have you handled a request you could not fulfil immediately?", "They want to see that you tell people the truth about timelines instead of leaving them waiting."],
  ["Financial Management", "Tell me about a time you noticed something in a transaction that did not look right.", "Say what you observed, what you checked, and who you escalated to. Escalating correctly is the right answer, not fixing it alone."],
  ["Financial Management", "Describe a time you had to complete work with incomplete documents.", "The correct instinct is to hold the release and chase the document, not to proceed. Show that instinct in a real story."],
  ["Financial Management", "Give an example of a time you were responsible for meeting a strict deadline.", "Liquidation deadlines are the daily version of this. Give the deadline, the obstacle, and what you gave up to hit it."],
  ["General Administrative Support", "Tell me about a time you had to do work outside your job description.", "Reference the elastic clause. Show willingness without sounding like you have no sense of boundaries."],
  ["General Administrative Support", "Describe a time you handled several urgent requests at once.", "Say how you decided the order. A defensible prioritisation rule matters more than the outcome."],
  ["General Administrative Support", "Tell me about a time you made a mistake at work.", "Answer this one. Refusing to name a real mistake reads as evasive. State it plainly, say what you did to fix it, and what changed afterwards."],
  ["Working with others", "Describe a difficult person you had to work with and how you handled it.", "Do not criticise the person. Describe the behaviour, what you tried, and what worked."],
  ["Working with others", "Tell me about a time you received criticism of your work.", "What you did with it is the point, not whether it was fair."],
  ["Working with others", "Give an example of a time you had to say no to a colleague or a superior.", "Pair it with what you offered instead. Saying no without an alternative is the weaker answer."],
  ["Integrity", "Tell me about a time you were asked to do something you believed was improper.", "Even a small example works. Describe the pressure honestly and what you did."],
  ["Integrity", "Describe a situation where doing the right thing cost you time or goodwill.", "The panel is checking that public service values are lived rather than recited."],
  ["Motivation and fit", "Why are you leaving a technical career for a school administrative position?", "This will be asked. Answer it directly and without apology, connect it to the division where you were educated, and avoid implying the role is a fallback."],
  ["Motivation and fit", "What do you think will be the hardest part of this job for you?", "Name a real one, most credibly the clerical and regulatory volume, and say concretely how you are already closing that gap."],
  ["Motivation and fit", "Where do you see the role in your first three months?", "Concrete and modest beats visionary. Learn the station's records, inventory, and outstanding audit observations first."],
].map(([tag, ask, hint]) => ({ tag, ask, hint }));

/* ============================================================
   WORK SAMPLE
   ============================================================ */

export const workSampleDrills: ChecklistDef = {
  id: "work",
  label: "Work sample drills",
  tabId: "work",
  items: [
    { id: "k1", label: "Consolidate a set of daily time records into a monthly report of service", why: "Given several DTRs with tardiness, undertime, and absences, produce the summary and compute the leave to be charged. Practise the arithmetic until it is automatic." },
    { id: "k2", label: "Assemble a disbursement voucher package", why: "Given a transaction, list every supporting document required and identify what is missing. State plainly when a payment cannot yet be released and why." },
    { id: "k3", label: "Prepare a supplies inventory and an issuance record", why: "Build the inventory from a delivery list, record issuances to named personnel, and show the running balance. Neatness and consistent columns matter as much as the totals." },
    { id: "k4", label: "Draft a memorandum or an official letter", why: "A memo to personnel about a deadline, or a letter of transmittal to the SDO. Correct parts, correct salutation, no spelling errors, one page. Templates for both are in the Templates tab." },
    { id: "k5", label: "Compute a benefit", why: "Proportional vacation pay, a step increment adjustment, a salary differential, or a terminal leave estimate. Show your work, because the method is being scored as much as the figure." },
    { id: "k6", label: "Spot the audit red flags in a set of documents", why: "Splitting of transactions, an unliquidated cash advance beyond the period, a missing inspection and acceptance report, the same supplier repeatedly. Name the problem and cite the rule." },
    { id: "k7", label: "Basic spreadsheet operations under time pressure", why: "Sorting, filtering, SUM and IF, and a clean printable layout. Your technical background is a genuine advantage here, so do not waste it by over building. Deliver something simple and readable." },
    { id: "k8", label: "Handle a request for personnel information", why: "Someone asks for a copy of a colleague's record. The right answer involves the Data Privacy Act, the duty of confidentiality, and referring the request through the school head. This may appear as a written scenario rather than a task." },
    { id: "k9", label: "Draft an indorsement routing a document to another office", why: "One or two sentences: what is attached, what action or comment is requested, and to whom it goes next. Practise the standard opening phrase until it is automatic." },
    { id: "k10", label: "Walk through the hiring process for a vacant Administrative Assistant item", why: "Publication period, who screens, who ranks, who appoints, and where CSC attestation fits. A likely oral or written scenario given this is exactly the process you are going through." },
    { id: "k11", label: "Encode given figures in Excel, then build a summary table, a pivot and a chart", why: "Reported as a standard task. The Examples tab has a supplies issuance sheet to rebuild from scratch." },
    { id: "k12", label: "Compute a tardiness deduction and a salary differential, showing every step", why: "Daily rate, undertime equivalent, deduction. Worked example in the Examples tab." },
    { id: "k13", label: "Reconcile a monthly MOOE allotment against expenses", why: "Allotment minus expenses should be explained down to the last peso, ideally zero. Worked example in the Examples tab." },
    { id: "k14", label: "Convert Word to PDF and PDF to Word, and organise a folder of electronic files", why: "Reported as part of the skills test. Do it on your own laptop with a stopwatch." },
    { id: "k15", label: "Write an incident report, a request letter, an invitation and minutes from a one-line scenario", why: "Eight practice scenarios are on the Written test tab. Do them against the clock, then compare with the Examples tab." },
    { id: "k16", label: "Write an accomplishment or narrative report with counts and amounts in every line", why: "Organise by key result area. Evidence beats adjectives." },
  ],
};

/* ============================================================
   TEMPLATES — one per common AO2 output, mapped to a KRA
   ============================================================ */

export type TemplateDef = {
  id: string;
  kra: string;
  title: string;
  when: string;
  body: string;
  notes: string[];
};

export const templates: TemplateDef[] = [
  {
    id: "memo",
    kra: "KRA 3 — General Administrative Support",
    title: "Memorandum",
    when: "An internal instruction to personnel within the school — a deadline, a schedule, a directive from the school head issued in the school head's name.",
    body:
`Republic of the Philippines
Department of Education
Region V (Bicol)
Schools Division of Camarines Sur
[SCHOOL NAME]

MEMORANDUM
No. ___, s. 2026

TO:        All Teaching and Non-Teaching Personnel
FROM:       [Name of School Head], School Head
DATE:       [Date]
SUBJECT:    [One line, specific — e.g. Submission of Updated 201 File Requirements]

1. [Purpose — why this memo exists, in one sentence.]

2. [Instruction — what the reader must do, stated as an action, not a wish.]

3. [Deadline and where/how to comply — date, time, office, or form.]

4. For guidance and strict compliance.

[Signature over printed name]
School Head`,
    notes: [
      "Number and series (\"No. ___, s. 2026\") let the memo be cited and filed. Keep a log of numbers issued so two memos never share one.",
      "A memo moves information or gives instructions inside the school. It is issued in the name of the school head, even if an AO II drafts it.",
      "Body paragraphs are numbered, short, and end in an instruction or a fact — not in a question.",
      "\"For guidance and strict compliance\" is the standard DepEd closing line for a directive memo; use \"For information and guidance\" if nothing is actually required of the reader.",
    ],
  },
  {
    id: "letter",
    kra: "KRA 3 — General Administrative Support",
    title: "Official letter",
    when: "Correspondence to someone outside the school — a supplier, a parent, another office, the SDO when a letter (not a memo) is the appropriate form.",
    body:
`[School letterhead]

[Date]

[Name]
[Position]
[Office / Address]

Dear [Title] [Surname]:

[Opening — state the reason for writing in the first sentence.]

[Body — the request, information, or explanation. One idea per paragraph.]

[Closing — what you need from the reader, and by when, if anything.]

Thank you for your attention to this matter.

Respectfully yours,

[Signature over printed name]
[Position]`,
    notes: [
      "A letter, unlike a memo, is addressed to a named person outside the immediate chain of command and uses a salutation and a complimentary close.",
      "Keep it to one page. If it needs a second page, the real document is probably a report with a one-paragraph transmittal letter in front of it.",
      "State the ask in the first paragraph. A letter that buries its purpose in paragraph three reads as evasive, not polite.",
    ],
  },
  {
    id: "indorsement",
    kra: "KRA 3 — General Administrative Support",
    title: "Indorsement",
    when: "Routing an existing document — someone else's letter, request, or report — to another office, with a brief instruction or comment attached.",
    body:
`1st Indorsement
[Date]

Respectfully forwarded to [Office / Position], [purpose — e.g. for appropriate action / for comment and recommendation / for information].

[One to two sentences of context or instruction, if needed. An indorsement that only routes without comment may skip this.]

[Signature over printed name]
[Position]`,
    notes: [
      "An indorsement never restates the attached document. It routes it and says what should happen to it next.",
      "Each office that forwards it further adds the next indorsement below the last — \"2nd Indorsement,\" and so on — so the full routing history stays on one physical trail.",
      "The three stock purposes are \"for appropriate action,\" \"for comment and recommendation,\" and \"for information.\" Pick the one that actually matches what you want the next office to do.",
      "Attach the original document. An indorsement without its attachment is meaningless to the receiving office.",
    ],
  },
  {
    id: "transmittal",
    kra: "KRA 4 — Financial Management",
    title: "Transmittal letter",
    when: "Forwarding a set of documents or a report to the SDO — the cover note that says what is enclosed and why.",
    body:
`[School letterhead]

[Date]

[Name / Office receiving the documents, e.g. The Schools Division Superintendent, Attn: HRMO]

Sir/Madam:

Respectfully transmitted are the following documents/reports for your [reference / appropriate action / consolidation]:

  1. [Document name and coverage period]
  2. [Document name and coverage period]

For your information and reference.

Respectfully yours,

[Signature over printed name]
School Head`,
    notes: [
      "A transmittal letter is short on purpose — it is a cover note, not the report itself. List what is attached; do not summarise it.",
      "Use this for the monthly report of service, DTR consolidations, liquidation reports, and any batch of documents sent to the SDO.",
    ],
  },
  {
    id: "certification",
    kra: "KRA 1 — Personnel Administration",
    title: "Certification",
    when: "A short sworn statement of fact issued on request — employment, no pending case, GWA, fund availability.",
    body:
`Republic of the Philippines
Department of Education
[School Name]

CERTIFICATION

TO WHOM IT MAY CONCERN:

This is to certify that [Name], [position], is/was [the fact being certified — e.g. employed in this school from (date) to (date) / entitled to (number) days of vacation leave as of (date)].

This certification is issued upon the request of [Name] for whatever legal purpose it may serve.

Issued this [day] of [month], [year] at [place].

[Signature over printed name]
[Position — the person authorised to certify this fact]`,
    notes: [
      "Certify only what you can personally verify from a record you maintain. A certification you cannot back with a document is the kind of paper that gets an office investigated.",
      "\"For whatever legal purpose it may serve\" is standard, but if you know the actual purpose (a loan, a scholarship application), naming it is more precise and equally acceptable.",
    ],
  },
  {
    id: "dv",
    kra: "KRA 4 — Financial Management",
    title: "Disbursement voucher (DV) package",
    when: "Every payment out of school funds — reimbursement, supplier payment, travel, training, a benefit release.",
    body:
`DISBURSEMENT VOUCHER — fields on the prescribed form (Annex A, COA Circular 2012-001)

  Payee: __________________________  TIN: __________
  Address: ______________________________________
  Particulars (what is being paid, and for what period/transaction): ___
  Responsibility Center / Account Code: __________
  ORS/BURS No.: __________          Amount: ₱__________

  Box A — Certified: Expenses/cash advance necessary, lawful, and incurred
          under my direct supervision.  [Requesting/approving official]

  Box B — Certified: Supporting documents complete and proper; previously
          recorded obligation valid; cash available.  [Budget / Accounting]

  Box C — Approved for Payment.  [Head of Agency or authorised official]

  Box D — Received Payment.  [Payee, with signature, date, and OR/reference]`,
    notes: [
      "The four boxes are four different people certifying four different things. Box A is not repeating Box C — do not let a single signature stand in for all of them.",
      "No disbursement voucher is processed without a prior obligation recorded against an appropriation. If there is no ORS/BURS number, there is nothing to pay against yet.",
      "Supporting documents vary by transaction — see the table below. The rule that never changes: a DV moves only as far as its weakest supporting document.",
    ],
  },
  {
    id: "pr-po",
    kra: "KRA 2 — Property Custodianship",
    title: "Purchase Request → Purchase Order",
    when: "Any procurement of supplies, materials, or equipment, from a single small purchase to a bid.",
    body:
`PURCHASE REQUEST

  Office: __________          PR No.: __________     Date: __________
  ┌────┬─────────────────────┬─────┬──────┬───────────┬────────┐
  │ No.│ Item / Description  │ Qty │ Unit │ Unit Cost │ Total  │
  ├────┼─────────────────────┼─────┼──────┼───────────┼────────┤
  │    │                     │     │      │           │        │
  └────┴─────────────────────┴─────┴──────┴───────────┴────────┘
  Purpose: ______________________________________________
  Requested by: __________     Approved by (School Head): __________

  →  Canvass / bidding as required by mode of procurement
  →  PURCHASE ORDER issued to the winning supplier
  →  Delivery, then INSPECTION AND ACCEPTANCE REPORT (IAR) signed
     before the item is accepted into the property records
  →  DV prepared for payment, with the PR, PO, and IAR attached`,
    notes: [
      "The purchase must trace back to the approved SIP or AIP, or a specific directive of the school head. A PR with no plan behind it is the first thing an auditor asks about.",
      "The Inspection and Acceptance Report is what turns a delivery into an accountable item. Nothing goes on the inventory, and no payment is released, without it.",
      "Splitting one purchase into several smaller PRs to avoid a higher procurement mode is prohibited under RA 9184 and its successor rules — this is one of the most commonly tested traps.",
    ],
  },
  {
    id: "property-forms",
    kra: "KRA 2 — Property Custodianship",
    title: "Property forms — PAR, ICS, RIS",
    when: "Receiving, issuing, and drawing down property and supplies.",
    body:
`PROPERTY ACKNOWLEDGEMENT RECEIPT (PAR)
  Used for: equipment and property, plant & equipment items — generally
  those with an estimated useful life of more than one year and above the
  government's capitalisation/semi-expendable threshold.
  Fields: Item, description, quantity, unit value, date acquired,
  property number, and the signature of the accountable employee who
  receives and is answerable for the item.

INVENTORY CUSTODIAN SLIP (ICS)
  Used for: semi-expendable property — durable but below the threshold
  that would make it a PAR item (e.g. a stapler, a desk fan).
  Fields: same structure as the PAR, at a lower monetary bar.

REQUISITION AND ISSUE SLIP (RIS)
  Used for: consumable supplies drawn from stock — paper, ink, cleaning
  materials — that are used up rather than tracked long-term.
  Fields: Requesting office, item, quantity requested, quantity issued,
  stock number, and signatures of the requesting party and the property
  custodian who releases it.`,
    notes: [
      "The dividing line to remember: PAR and ICS track items you expect back or account for over time. RIS tracks items that are consumed.",
      "An annual Report of Physical Count of Property, Plant and Equipment (RPCPPE) reconciles what the records say against what is physically on the shelf. A mismatch here is the most common single audit finding in a small office.",
      "Issue nothing without a signed slip. A verbal issuance is an unaccounted item the moment anyone asks where it went.",
    ],
  },
  {
    id: "liquidation",
    kra: "KRA 4 — Financial Management",
    title: "Liquidation report",
    when: "Closing out a cash advance — for a training, a travel, or a petty/field expense.",
    body:
`LIQUIDATION REPORT

  Cash Advance No.: __________   Date granted: __________
  Amount granted: ₱__________    Purpose: ______________

  ┌────┬────────────────┬──────────┬───────────┐
  │ No.│ Particulars    │ OR/Ref.  │ Amount    │
  ├────┼────────────────┼──────────┼───────────┤
  │    │                │          │           │
  └────┴────────────────┴──────────┴───────────┘

  Total expenses: ₱__________
  Amount to be refunded / reimbursed: ₱__________

  Certified correct: [Accountable officer]
  Approved: [Head of office / authorised official]`,
    notes: [
      "Every line needs an official receipt or an equivalent document behind it. An expense without a receipt is not liquidated — it is still an outstanding cash advance.",
      "Liquidation has a deadline that runs from the purpose of the advance (commonly within a set number of days after the activity or travel ends, per COA Circular 97-002 as amended). A late liquidation blocks the officer's next cash advance until settled.",
      "If actual expenses were less than the amount granted, the difference is refunded. If more, the officer requests reimbursement — the liquidation report is what supports either direction.",
    ],
  },
  {
    id: "step-increment",
    kra: "KRA 1 — Personnel Administration",
    title: "Notice of step increment / salary adjustment",
    when: "Informing an employee, and the HRMO, that a step increment or salary adjustment has been computed and is being forwarded for processing.",
    body:
`MEMORANDUM
No. ___, s. 2026

TO:        [Employee name], [Position]
FROM:       [Name of School Head], School Head
DATE:       [Date]
SUBJECT:    Step Increment Due to [Length of Service / Meritorious
            Performance]

This is to inform you that, based on our records, you are due a step
increment effective [date], under [basis — e.g. three years of continuous
and satisfactory service in the same position / meritorious performance
rating].

Present step: [__]     Present salary: ₱[______]
New step:     [__]     New salary:     ₱[______]

This has been forwarded to the HRMO for verification and processing.

[Signature over printed name]
School Head`,
    notes: [
      "The two recognised bases for a step increment are length of service and meritorious performance — know both, and know which one a given scenario is describing.",
      "The AO II's role is to compute and forward. The HRMO verifies, and the actual release runs through the SDO — do not present this as something the school pays out on its own.",
    ],
  },
];

export const dvSupportingDocs: TableDef = {
  id: "dv-docs",
  label: "Common supporting documents by transaction type",
  tabId: "templates",
  headers: ["Transaction", "Typical supporting documents"],
  rows: [
    { id: "d1", cols: ["Reimbursement of expense", "Approved request/authority, official receipts, DV, ORS/BURS"] },
    { id: "d2", cols: ["Payment for supplies/equipment", "PR, canvass or bid documents, PO, sales invoice/OR, Inspection and Acceptance Report, DV"] },
    { id: "d3", cols: ["Travel expense", "Approved travel order/authority, itinerary of travel, certificate of appearance/travel completed, official receipts where required"] },
    { id: "d4", cols: ["Training/seminar cash advance", "Approved authority to attend, notice of training, budget breakdown, liquidation report and receipts after"] },
    { id: "d5", cols: ["Salary and benefits", "Payroll/plantilla basis, DTR, approved leave forms where applicable, computation sheet"] },
  ],
};

/* ============================================================
   REFERENCE SHELF — administration + republic acts, grouped
   ============================================================ */

export type AdminNote = { h: string; body: string[] };

export const adminNotes: AdminNote[] = [
  {
    h: "The hierarchy of issuances",
    body: [
      "From the top down: the Constitution and statutes (Republic Acts) set policy; the President implements them through Executive Orders (broad, policy-setting), Administrative Orders (a specific administrative act), Memorandum Orders and Memorandum Circulars (narrower instructions to agencies); each department then issues its own agency-level rules — for DepEd, these are DepEd Orders, Memoranda, and Regional/Division Memoranda, which is where the memorandum that governs your own hiring sits.",
      "A lower issuance cannot contradict a higher one. If a Division Memorandum conflicts with a CSC rule, the CSC rule governs — this is the kind of question a written test likes to ask as a scenario rather than a definition.",
    ],
  },
  {
    h: "RA 9155 and school-level governance",
    body: [
      "The Governance of Basic Education Act (2001) decentralises authority from the Central Office down to the school. The School Head is given both an instructional leadership role and an administrative/operational one — hiring support, property custodianship, and financial management at the school level exist because of this law, not despite it.",
      "School-Based Management (SBM) is the operating principle that follows from RA 9155: schools plan, implement, and are accountable for their own improvement through the School Improvement Plan (SIP), with the School Head as the accountable officer and often a School Governing Council as a participatory body.",
      "The chain of offices — School → Schools Division Office → Regional Office → Central Office — is also where the words \"indorse,\" \"submit for approval,\" and \"forward for information\" in your own job description come from. Know which office is the next stop for which kind of document; it is the practical spine of KRA 3.",
    ],
  },
  {
    h: "Records and the correspondence system",
    body: [
      "Communications are classified by what they do, not by their tone: a memorandum instructs or informs within an office; a letter communicates with someone outside it; an indorsement routes an existing document onward with a brief comment. Confusing these on a work sample is an easy way to lose points on an otherwise correct answer.",
      "Every official communication is numbered in series (\"No. ___, s. [year]\") so it can be filed, retrieved, and cited later. A 201 file, a property ledger, and a memo log are all instances of the same underlying discipline: nothing exists administratively until it is written down and findable again.",
    ],
  },
  {
    h: "Delegation and accountability",
    body: [
      "Authority can be delegated; accountability cannot. A School Head who assigns a task to the AO II remains answerable for the outcome — this is why the \"elastic clause\" in the job description (DBM Budget Circular 2004-3) expands what an AO II may be asked to do without ever shifting where ultimate responsibility sits.",
      "Under COA rules, an officer who has physical custody of government property or funds is an accountable officer — primarily accountable if the property is entrusted directly to them, secondarily accountable if they merely have access or approve its movement. This is the legal reason a property custodian signs a PAR or ICS personally rather than the transaction being handled anonymously.",
      "The three E's — economy, efficiency, and effectiveness — are the standard COA measures against which government spending and administration are judged. A work sample or interview answer that shows awareness of all three, not just \"we didn't overspend,\" reads as more complete.",
    ],
  },
];

export const raGroups: TableDef[] = [
  {
    id: "ra-ethics",
    label: "Constitutional basis and ethics",
    tabId: "law",
    headers: ["Issuance", "Why it matters to this position"],
    rows: [
      { id: "g1", cols: ["1987 Constitution, Article XI", "Public office is a public trust. The source of administrative, civil, and criminal accountability for public officers."] },
      { id: "g2", cols: ["1987 Constitution, Article IX-D", "The mandate of the Commission on Audit over all government accounts."] },
      { id: "g3", cols: ["RA 6713", "Code of Conduct and Ethical Standards. Norms of conduct, prohibited acts, and the fifteen working day rule on action."] },
      { id: "g4", cols: ["RA 3019", "Anti-Graft and Corrupt Practices Act. The criminal exposure behind careless disbursement, e.g. entering into a contract manifestly disadvantageous to the government."] },
      { id: "g5", cols: ["RA 7080", "Plunder Law. Amassing ill-gotten wealth of a large aggregate amount through a combination of unlawful acts by a public officer — the extreme end of the same accountability chain as RA 3019."] },
      { id: "g6", cols: ["RA 6770", "Ombudsman Act. Gives the Office of the Ombudsman jurisdiction over administrative and criminal complaints against public officers, alongside the CSC's administrative jurisdiction."] },
      { id: "g7", cols: ["Presidential Decree 1445", "Government Auditing Code. The foundational law behind COA's authority and the Government Accounting Manual."] },
    ],
  },
  {
    id: "ra-civil-service",
    label: "Civil service and personnel",
    tabId: "law",
    headers: ["Issuance", "Why it matters to this position"],
    rows: [
      { id: "c1", cols: ["EO 292, Book V", "Administrative Code of 1987. The civil service framework: appointment, discipline, position classification, and the oath-taking provision cited in your own submission requirements."] },
      { id: "c2", cols: ["RA 6656", "Protects security of tenure of civil service employees affected by a government reorganisation."] },
      { id: "c3", cols: ["CSC Omnibus Rules on Appointments and Other HR Actions (ORAOHRA)", "The rulebook behind publication of vacancies, qualification standards, appointment types, promotion, and CSC attestation. Covered in full in the Hiring, Promotion & Leave tab."] },
      { id: "c4", cols: ["CSC Omnibus Rules on Leave", "Accrual, monetisation, and the leave types processed daily. Covered in full in the Hiring, Promotion & Leave tab."] },
      { id: "c5", cols: ["RA 8291", "GSIS Act of 1997. Governs the loans, retirement, and other benefits an AO II helps verify, approve, and process for personnel."] },
    ],
  },
  {
    id: "ra-procurement-finance",
    label: "Procurement and financial management",
    tabId: "law",
    headers: ["Issuance", "Why it matters to this position"],
    rows: [
      { id: "p1", cols: ["RA 9184 and its IRR", "Government Procurement Reform Act. Governs every school purchase you will facilitate — modes of procurement, the BAC, and the prohibition on splitting contracts."] },
      { id: "p2", cols: ["RA 12009 (New Government Procurement Act, 2024)", "Reorganises and updates RA 9184. Confirm with your BAC/HRMO which set of implementing rules currently applies to school-level transactions during the transition, since this is a recent change."] },
      { id: "p3", cols: ["Government Accounting Manual", "The accounting rules a school follows, including the books and registries maintained."] },
      { id: "p4", cols: ["COA Circular 97-002", "Granting, utilisation, and liquidation of cash advances."] },
      { id: "p5", cols: ["COA Circular 2012-001", "Documentary requirements for common government transactions — the source for the disbursement voucher template in this reviewer."] },
    ],
  },
  {
    id: "ra-data-transparency",
    label: "Data, privacy, and transparency",
    tabId: "law",
    headers: ["Issuance", "Why it matters to this position"],
    rows: [
      { id: "t1", cols: ["RA 10173", "Data Privacy Act. Governs the 201 files and the personnel database maintained at school level."] },
      { id: "t2", cols: ["RA 11032", "Ease of Doing Business and Efficient Government Service Delivery Act. Prescribed processing times, no-noon-break rule, and the duty to cut red tape."] },
      { id: "t3", cols: ["EO 2, s. 2016", "Freedom of Information in the Executive Branch. Affects how requests for public records are handled and referred."] },
    ],
  },
  {
    id: "ra-education",
    label: "Basic education governance",
    tabId: "law",
    headers: ["Issuance", "Why it matters to this position"],
    rows: [
      { id: "e1", cols: ["RA 9155", "Governance of Basic Education Act. School-based management and the decentralisation of authority to the School Head — see the Administration notes above."] },
      { id: "e2", cols: ["RA 4670", "Magna Carta for Public School Teachers. Teaching load, transfer, and disciplinary safeguards for teaching personnel — many of the personnel actions an AO II processes concern teachers covered by this law."] },
      { id: "e3", cols: ["RA 10533", "Enhanced Basic Education Act of 2013 (the K to 12 law). Context for the current basic education structure and curriculum."] },
      { id: "e4", cols: ["DepEd Order 007, s. 2023 and DepEd Order 021, s. 2024", "The hiring guidelines you are being assessed under, including Enclosure 5 for non-teaching positions and the point system table."] },
      { id: "e5", cols: ["DBM Budget Circular 2004-3", "Why an AO II may be assigned the duties of several former positions — the elastic clause."] },
    ],
  },
  {
    id: "ra-welfare",
    label: "Leave and family welfare laws",
    tabId: "law",
    headers: ["Issuance", "Why it matters to this position"],
    rows: [
      { id: "w1", cols: ["RA 11210", "105-Day Expanded Maternity Leave Law. Full detail in the leave table in the Hiring, Promotion & Leave tab."] },
      { id: "w2", cols: ["RA 8187", "Paternity Leave Act. Seven days for married male employees, first four deliveries of the legitimate spouse."] },
      { id: "w3", cols: ["RA 8972, as amended by RA 11861", "Expanded Solo Parents' Welfare Act. Grants parental leave and other benefits to qualified solo parents."] },
      { id: "w4", cols: ["RA 9710", "Magna Carta of Women. Grants a special leave benefit for women undergoing surgery caused by gynaecological disorders."] },
      { id: "w5", cols: ["RA 9262", "Anti-Violence Against Women and Their Children Act. Grants leave to a qualifying victim to attend to related legal, medical, or counselling needs."] },
      { id: "w6", cols: ["RA 8552", "Domestic Adoption Act. Basis for adoption leave benefits comparable to maternity or paternity leave."] },
    ],
  },
  {
    id: "ra-protection",
    label: "Workplace and school protection laws",
    tabId: "law",
    headers: ["Issuance", "Why it matters to this position"],
    rows: [
      { id: "s1", cols: ["RA 7877", "Anti-Sexual Harassment Act. Covers harassment by a person with authority in a work or training environment."] },
      { id: "s2", cols: ["RA 11313", "Safe Spaces Act. Extends harassment coverage to online and public spaces, relevant to a school setting."] },
      { id: "s3", cols: ["RA 7610", "Special Protection of Children Against Abuse, Exploitation and Discrimination Act. Underlies DepEd's child protection reporting duties, which an AO II may support administratively."] },
      { id: "s4", cols: ["RA 10627", "Anti-Bullying Act. School-level policy and reporting obligations."] },
      { id: "s5", cols: ["RA 10911", "Anti-Age Discrimination in Employment Act. Relevant to how vacancy announcements and hiring criteria must be worded."] },
    ],
  },
];

/* ============================================================
   HIRING, PROMOTION & LEAVE
   ============================================================ */

export const hiringProcess: { step: string; detail: string }[] = [
  { step: "1. Vacancy occurs", detail: "A plantilla position is created, vacated, or reclassified. The appointing authority determines that it will be filled." },
  { step: "2. Publication", detail: "The vacancy is published, typically for at least ten calendar days, through the CSC website or field office and a conspicuous place in the agency, per CSC posting rules. This gives every qualified employee and outside applicant a fair chance to apply — a step that is skipped only for legally recognised exceptions, such as some promotions within the agency in specific circumstances." },
  { step: "3. Screening against Qualification Standards", detail: "The HRMPSB checks each applicant's education, training, experience, and eligibility against the Qualification Standards for the position, and against the point system that applies to its salary grade." },
  { step: "4. Comparative assessment", detail: "For the positions this reviewer covers, this is the written test, behavioural event interview, and work sample — the twenty points on the scoring table that assessment day decides." },
  { step: "5. Deliberation and ranking", detail: "The HRMPSB deliberates on the combined scores and prepares a ranked list of candidates deemed qualified, which it submits to the appointing authority." },
  { step: "6. Selection by the appointing authority", detail: "The appointing authority is not bound to choose the single highest scorer — appointment is a discretionary act among those found qualified, so long as the choice is not made in an arbitrary or discriminatory way." },
  { step: "7. Appointment paper and CSC attestation", detail: "The appointment is prepared on the prescribed form, submitted to the CSC for attestation within the period the rules require, and CSC attests its validity if the qualification standards, eligibility, and process were properly followed." },
  { step: "8. Assumption of duty", detail: "The appointee takes the oath of office, assumes the position, and submits the required post-appointment documents, including the Statement of Assets, Liabilities and Net Worth (SALN) and an updated Personal Data Sheet." },
];

export const appointmentTypes: TableDef = {
  id: "appointment-types",
  label: "Appointment types",
  tabId: "hiring",
  headers: ["Type", "What it means"],
  rows: [
    { id: "a1", cols: ["Original", "First appointment to the career service, typically carrying a probationary period."] },
    { id: "a2", cols: ["Promotion", "Movement to a position with a higher salary grade, greater duties, and greater responsibility."] },
    { id: "a3", cols: ["Transfer", "Movement to a position of equivalent rank, level, or salary, without a break in service, whether in the same or a different agency."] },
    { id: "a4", cols: ["Reemployment", "Appointment of a person previously separated from the service through no delinquency or misconduct — e.g. after resignation or reaching a retirement age exception."] },
    { id: "a5", cols: ["Reinstatement", "Restoration to a position from which someone was earlier removed, following exoneration or a favourable decision on appeal."] },
    { id: "a6", cols: ["Reappointment", "Appointment of a person who has previously been permanently appointed, to the same position, following an interruption of service."] },
    { id: "a7", cols: ["Demotion", "Movement to a position with a lower salary grade, typically requiring the employee's written consent except when imposed as a disciplinary penalty."] },
    { id: "a8", cols: ["Casual / Contract of Service / Job Order", "Not appointments in the career service sense. Distinct engagement categories with different rights and different processing — an AO II is expected to know which is which, since 201 file and benefits treatment differ."] },
  ],
};

export const promotionNotes: { h: string; body: string }[] = [
  {
    h: "Next-in-rank rule",
    body: "An employee occupying the position immediately below the vacancy, in the same line of work, has priority consideration — not an automatic right — for promotion. The appointing authority may still consider other qualified employees or outside applicants when doing so serves the best interest of the service, but a next-in-rank employee who is passed over must be informed of the reason and may protest the appointment.",
  },
  {
    h: "The three-salary-grade rule",
    body: "A promotion is generally limited to a position not more than three salary grades above an employee's current one, taken in a single move. An appointment beyond that gap must be justified — for example, as the next higher position in the agency's approved staffing pattern — or it risks being disapproved on attestation.",
  },
  {
    h: "Probationary status",
    body: "A first-time appointee to a permanent position in the career service generally serves a probationary period (commonly six months) during which conduct and performance are observed before the appointment is confirmed as permanent. An unsatisfactory probationer may be dropped, with due process, before permanent status attaches. Certain appointees are exempt or treated differently, such as someone already permanent elsewhere moving by promotion or transfer.",
  },
  {
    h: "Protest and appeal",
    body: "A qualified employee who believes an appointment was made in violation of the rules — commonly a passed-over next-in-rank employee — may file a protest with the agency's HRMPSB or the appointing authority within a set period from notice or posting of the appointment. If unresolved at that level, the matter may be elevated to the CSC Regional Office, then the CSC Proper, with further recourse to the Court of Appeals.",
  },
];

export const leaveTable: TableDef = {
  id: "leave-table",
  label: "Leave types",
  tabId: "hiring",
  headers: ["Leave type", "Basis", "Credit / duration", "Key conditions"],
  rows: [
    { id: "l1", cols: ["Vacation Leave (VL)", "CSC Omnibus Rules on Leave", "1.25 days per month, 15 days per year", "Cumulative; a minimum of five days per year is mandatory (forced leave) and cannot simply be left unused."] },
    { id: "l2", cols: ["Sick Leave (SL)", "CSC Omnibus Rules on Leave", "1.25 days per month, 15 days per year", "Cumulative; a medical certificate is required for absences of three or more consecutive working days."] },
    { id: "l3", cols: ["Special Privilege Leave (SPL)", "CSC Omnibus Rules on Leave", "3 days per year", "Non-cumulative, non-commutative — for personal milestones such as a birthday or wedding anniversary."] },
    { id: "l4", cols: ["Maternity Leave", "RA 11210 (105-Day Expanded Maternity Leave Law)", "105 days paid, +15 days if a qualified solo parent, +30 days optional and unpaid", "Applies regardless of civil status or the mode of delivery; up to 7 days may be allocated to the child's father or an alternate caregiver."] },
    { id: "l5", cols: ["Paternity Leave", "RA 8187", "7 days paid", "For the first four deliveries of the employee's legitimate spouse, spouse cohabiting with the employee."] },
    { id: "l6", cols: ["Parental Leave (solo parents)", "RA 8972, as amended by RA 11861", "7 working days per year", "On top of other leave credits; requires a Solo Parent Identification Card."] },
    { id: "l7", cols: ["Special Leave Benefit for Women", "RA 9710 (Magna Carta of Women)", "Up to 2 months paid", "For surgery caused by a gynaecological disorder, after at least six months of aggregate service in the preceding twelve months."] },
    { id: "l8", cols: ["Leave for victims under RA 9262", "RA 9262 (Anti-VAWC Act)", "Up to 10 days paid, extendible as necessary", "Requires a certification from the barangay, prosecutor, or court handling the case."] },
    { id: "l9", cols: ["Rehabilitation Privilege", "CSC rules", "Up to 6 months", "For an employee injured in the actual performance of duty, on top of ordinary sick leave."] },
    { id: "l10", cols: ["Special Emergency (Calamity) Leave", "CSC issuance", "Up to 5 days", "For an employee, or an immediate family member, affected by a calamity in an area under a state of calamity declaration."] },
    { id: "l11", cols: ["Adoption Leave", "RA 8552 (Domestic Adoption Act)", "Comparable to maternity/paternity leave", "Counted from the day the child is placed in the custody of the adoptive parent."] },
    { id: "l12", cols: ["Study Leave", "CSC rules", "Commonly up to 6 months for a review, or shorter for a specific exam", "Typically carries a return-service agreement with the agency."] },
    { id: "l13", cols: ["Terminal Leave", "CSC/DBM rules", "Monetisation of all accumulated VL and SL", "Applied for upon retirement, resignation, or death, using the standard formula: highest basic monthly salary x accumulated leave credits x 0.0481927. Tax-exempt."] },
    { id: "l14", cols: ["Leave Without Pay (LWOP)", "CSC Omnibus Rules on Leave", "As approved", "Used once VL/SL credits are exhausted. Approved in advance; does not earn further leave credit once it exceeds a set threshold, and affects continuity for step-increment computation."] },
  ],
};

export const awolNote: string =
  "Leave Without Pay is approved absence with no pay attached. Absence Without Official Leave (AWOL) is unapproved absence. An employee continuously absent without approved leave for at least thirty working days is dropped from the rolls — separated from the service — even though standard due process (a show-cause notice) is still the better practice before finalising it. The distinction between the two is a frequent trap question: LWOP is a leave category the employee applied for; AWOL is the absence of any application at all.";

export const monetizationNote: string =
  "Monetisation lets an employee convert unused leave credits into cash without actually taking the leave. The common rule allows monetisation of not less than ten days of accumulated vacation leave, provided the employee retains a minimum balance (commonly fifteen days) after the conversion, subject to the agency head's policy and the availability of funds. It uses the same 0.0481927 constant factor as terminal leave, applied only to the number of days being monetised rather than the full accumulated balance.";

/* ============================================================
   SUBMISSION PACK — deadline & assessment-day checklists
   ============================================================ */

export const deadlineChecklist: ChecklistDef = {
  id: "deadline",
  label: "Before the deadline",
  tabId: "master",
  items: [
    { id: "d1", label: "Register through the Microsoft Forms link and print the confirmation", why: "The printed registration must be attached to the submitted documents." },
    { id: "d2", label: "Fill the preferred school and district in every document", why: "Letter of intent and the header of each assessment submission. They must match each other." },
    { id: "d3", label: "Collect the employer certifications with real figures", why: "Content first, signature second. A signature above blank facts cannot be submitted." },
    { id: "d4", label: "Search every file for square brackets and remove them", why: "A placeholder left in a sworn submission is a disqualification risk, not a typo." },
    { id: "d5", label: "Have the Omnibus Sworn Statement attested and notarised", why: "Attested by a School Head or AO II, then sworn before an officer authorised to administer oaths." },
    { id: "d6", label: "Ask the HRMO whether Region V prescribes its own template", why: "Some regions mandate a specific format for Application of Education and Application of L&D. Their template overrides any other formatting." },
    { id: "d7", label: "Buy two long black tagboard folders and a brown envelope", why: "Black is the assigned colour for Administrative Officer II. Print name and position on the front of each." },
    { id: "d8", label: "Label and tab the documents in the order given in Enclosure 1", why: "Evaluators work faster through a tabbed folder, and it shows the exact skill the job requires." },
    { id: "d9", label: "Photocopy everything for your own file", why: "Submitted documents stay with the HRMPSB, which is not responsible for their safekeeping." },
    { id: "d10", label: "Submit at the SDO Receiving Section before 5:00 PM", why: "Addressed to the Schools Division Superintendent, attention HRMO. Nothing is accepted afterwards." },
  ],
};

export const assessDayChecklist: ChecklistDef = {
  id: "assessday",
  label: "Before the assessment day",
  tabId: "master",
  items: [
    { id: "a1", label: "Write out the six stories in the story bank in full", why: "Written once, they come out cleanly under pressure. Unwritten, they ramble." },
    { id: "a2", label: "Rehearse the career change question out loud", why: "Moving from a technical role into school administration will be asked about. A hesitant answer here undoes a strong folder." },
    { id: "a3", label: "Practise one full DTR consolidation and one benefit computation by hand", why: "The arithmetic needs to be automatic, not worked out on the day." },
    { id: "a4", label: "Assemble one disbursement voucher package from memory", why: "List the supporting documents without looking, then check yourself against COA Circular 2012-001." },
    { id: "a5", label: "Prepare the questions you will ask the panel", why: "Implementing unit status, staff supervised, state of the 201 files and inventory, outstanding audit observations." },
    { id: "a6", label: "Bring the original copies of every submitted document", why: "Applicants are encouraged to bring originals to the comparative assessment for validation." },
    { id: "a7", label: "Write out the hiring process from memory, step by step", why: "Publication, screening, comparative assessment, ranking, appointment, CSC attestation. This is now a documented likely written or oral topic." },
  ],
};

export const basicChecklist: ChecklistDef = {
  id: "basic",
  label: "Folder 1, basic requirements",
  tabId: "pack",
  items: [
    { id: "b1", label: "Checklist of Requirements and Omnibus Sworn Statement with Data Privacy Consent Form", why: "From Enclosure 5. Must be attested by a School Head or AO II and sworn before an officer authorised to administer oaths." },
    { id: "b2", label: "Screenshot of the Microsoft Forms registration response", why: "Register through the link in the memorandum and print the confirmation." },
    { id: "b3", label: "Letter of intent", why: "Must state the position applied for and the preferred school and district." },
    { id: "b4", label: "Personal Data Sheet, CS Form 212 revised 2025, with Work Experience Sheet", why: "Use the 2025 revision. An older form is a correctable error you do not want to be correcting on the deadline." },
    { id: "b5", label: "PRC licence or identification card, if applicable", why: "Not applicable to this position unless separately licensed." },
    { id: "b6", label: "Certificate of Eligibility or Report of Rating", why: "Career Service Professional, Second Level Eligibility. This is a hard requirement for AO II." },
    { id: "b7", label: "Transcript of Records and Diploma", why: "Including any graduate or post graduate units earned." },
    { id: "b8", label: "General Weighted Average, as shown in the TOR or a certification of GWA", why: "Requested explicitly and separately from the transcript." },
    { id: "b9", label: "Certificates of training", why: "All of them, with hours visible on the face of the certificate." },
    { id: "b10", label: "Certificate of Employment, Contract of Service, or signed Service Record", why: "Whichever applies to each employer." },
    { id: "b11", label: "Latest appointment, if applicable" },
    { id: "b12", label: "Performance ratings covering one year prior to the deadline, if applicable", why: "If the rating is not relevant to this position, submit the rating from the relevant work experience instead." },
  ],
};

export const compChecklist: ChecklistDef = {
  id: "comp",
  label: "Folder 2, comparative assessment",
  tabId: "pack",
  items: [
    { id: "c1", label: "Outstanding Accomplishments", why: "Only contributions recognised by an authorised body, linked to the KRA of your own position, with a stated positive result." },
    { id: "c2", label: "Application of Education", why: "Contributions that produced a positive outcome in a current or previous workplace as a result of the education earned." },
    { id: "c3", label: "Application of Learning and Development", why: "The same test, applied to the learnings from your training certificates." },
    { id: "c4", label: "Means of verification for each claim", why: "Certifications from the employers concerned. A claim without a document behind it is a claim the board cannot score." },
  ],
};

/* ============================================================
   MASTER REGISTRY — every checklist, for the rollup
   ============================================================ */

export const allChecklists: ChecklistDef[] = [
  deadlineChecklist,
  assessDayChecklist,
  writtenCoverage,
  storyBank,
  workSampleDrills,
  assessmentKit,
  basicChecklist,
  compChecklist,
];

export const allTables: TableDef[] = [
  dvSupportingDocs,
  ...raGroups,
  appointmentTypes,
  leaveTable,
];

/* ============================================================
   PRACTICE QUIZ — one self-check pulling from every tab
   ============================================================ */

export type QuizQuestion = {
  id: string;
  question: string;
  choices: string[];
  /** Index into choices. */
  correct: number;
  explanation: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "Of the 100 points in the ranking, how many are decided on the assessment day itself?",
    choices: ["10", "15", "20", "25"],
    correct: 2,
    explanation: "Potential — the written test, the behavioural event interview, and the work sample together — is worth 20 points. Everything else is already settled by the papers in your folder.",
  },
  {
    id: "q2",
    question: "Which document routes an existing letter or report to another office with a brief comment or instruction, rather than restating it?",
    choices: ["Memorandum", "Official letter", "Indorsement", "Certification"],
    correct: 2,
    explanation: "A memorandum instructs within an office and a letter communicates outside it; an indorsement routes an existing document onward, attached, with a short instruction such as \"for appropriate action.\"",
  },
  {
    id: "q3",
    question: "Which COA issuance governs the granting, utilisation, and liquidation of cash advances?",
    choices: ["COA Circular 2012-001", "COA Circular 97-002", "RA 9184", "Presidential Decree 1445"],
    correct: 1,
    explanation: "COA Circular 97-002 governs cash advances specifically. COA Circular 2012-001 is the one behind the documentary requirements used to build the disbursement voucher template — a related but different issuance.",
  },
  {
    id: "q4",
    question: "Breaking one purchase into several smaller purchase requests so each falls under a lower procurement mode is:",
    choices: [
      "A standard, encouraged cost-saving technique",
      "Splitting of contracts, prohibited under procurement law",
      "Required whenever the same supplier is used twice",
      "Only a problem if COA finds out",
    ],
    correct: 1,
    explanation: "Splitting of contracts to evade the procurement thresholds under RA 9184 is expressly prohibited — one of the most commonly tested traps in this area.",
  },
  {
    id: "q5",
    question: "Which document turns a delivery into an accountable item, and must exist before payment can be released?",
    choices: ["Purchase Request", "Purchase Order", "Inspection and Acceptance Report", "Requisition and Issue Slip"],
    correct: 2,
    explanation: "The Inspection and Acceptance Report (IAR) is what confirms the goods were actually received in good order. Nothing is accepted onto the inventory, and no DV is completed, without it.",
  },
  {
    id: "q6",
    question: "What is the key difference between a Property Acknowledgement Receipt (PAR) and an Inventory Custodian Slip (ICS)?",
    choices: [
      "PAR is for consumables, ICS is for equipment",
      "PAR is used above the semi-expendable threshold, ICS below it",
      "They are two names for the same form",
      "ICS is only used to track cash advances",
    ],
    correct: 1,
    explanation: "Both track durable property assigned to a custodian; the PAR is for the higher-value, longer-life items, and the ICS is for semi-expendable property below that monetary threshold. Consumables that are used up entirely are a Requisition and Issue Slip instead.",
  },
  {
    id: "q7",
    question: "In a Disbursement Voucher, which box certifies that supporting documents are complete and cash is available?",
    choices: ["Box A", "Box B", "Box C", "Box D"],
    correct: 1,
    explanation: "Box A is the requesting official certifying the expense is necessary and lawful. Box B is Budget/Accounting certifying documents and cash. Box C approves payment. Box D records receipt by the payee.",
  },
  {
    id: "q8",
    question: "Under the general CSC rule, a single promotion is generally limited to how many salary grades above an employee's current position?",
    choices: ["One", "Two", "Three", "Five"],
    correct: 2,
    explanation: "The three-salary-grade rule. A jump beyond that gap needs specific justification, such as being the next-higher position in the agency's approved staffing pattern, or it risks disapproval on attestation.",
  },
  {
    id: "q9",
    question: "A next-in-rank employee who is passed over for a promotion:",
    choices: [
      "Has an absolute right to the position",
      "Has priority consideration, not an automatic right, and may protest if passed over",
      "Automatically becomes ineligible for future promotions",
      "Must be reassigned to a different office",
    ],
    correct: 1,
    explanation: "Next-in-rank gives priority consideration, not an exclusive right. The appointing authority may still choose another qualified candidate in the best interest of the service, but the passed-over employee must be told why and may protest.",
  },
  {
    id: "q10",
    question: "What is the standard probationary period for a first-time permanent appointee to the career service?",
    choices: ["Three months", "Six months", "One year", "There is no probationary period"],
    correct: 1,
    explanation: "Commonly six months, during which conduct and performance are observed before the appointment is confirmed as permanent.",
  },
  {
    id: "q11",
    question: "Under RA 11210, how many days of paid maternity leave apply regardless of civil status or mode of delivery?",
    choices: ["60 days", "90 days", "105 days", "120 days"],
    correct: 2,
    explanation: "105 days, with 15 additional days for a qualified solo parent and an optional 30 unpaid days on top of that.",
  },
  {
    id: "q12",
    question: "What is the minimum number of consecutive working days of unauthorised absence before an employee may be dropped from the rolls for AWOL?",
    choices: ["5 days", "15 days", "30 days", "60 days"],
    correct: 2,
    explanation: "Thirty consecutive working days without approved leave. Standard due process — a show-cause notice — is still the better practice before finalising the separation.",
  },
  {
    id: "q13",
    question: "What actually distinguishes Leave Without Pay (LWOP) from Absence Without Official Leave (AWOL)?",
    choices: [
      "LWOP is paid and AWOL is not",
      "LWOP is approved in advance; AWOL has no approval at all",
      "They are the same thing under a different name",
      "AWOL only applies to sick leave",
    ],
    correct: 1,
    explanation: "LWOP is a leave category the employee applied for and had approved once VL/SL credits ran out. AWOL is unapproved absence — the absence of any application. A frequent trap question.",
  },
  {
    id: "q14",
    question: "The standard terminal leave and monetisation computation uses which constant factor?",
    choices: ["0.5", "1.25", "0.0481927", "22"],
    correct: 2,
    explanation: "Highest basic monthly salary x accumulated leave credits x 0.0481927 — confirm the current rate with HRMO/accounting before quoting it as fact, since DBM issuances can update the constant.",
  },
  {
    id: "q15",
    question: "Which law governs the confidentiality of the 201 files and the personnel database an AO II maintains?",
    choices: ["RA 9184", "RA 10173 (Data Privacy Act)", "RA 6713", "RA 9155"],
    correct: 1,
    explanation: "The Data Privacy Act governs lawful processing and confidentiality of personal and sensitive personal information, which is exactly what a 201 file contains.",
  },
  {
    id: "q16",
    question: "Under RA 6713, how many working days does a public official generally have to act on a letter or request?",
    choices: ["5 working days", "10 working days", "15 working days", "30 working days"],
    correct: 2,
    explanation: "Fifteen working days — one of the norms of conduct under the Code of Conduct and Ethical Standards, and a likely source of straightforward ethics questions.",
  },
  {
    id: "q17",
    question: "Which law decentralises authority from the DepEd Central Office down to the school and establishes School-Based Management?",
    choices: ["RA 9155", "RA 4670", "RA 10533", "RA 9710"],
    correct: 0,
    explanation: "The Governance of Basic Education Act (RA 9155). RA 4670 is the Magna Carta for Public School Teachers, RA 10533 is the K to 12 law, and RA 9710 is the Magna Carta of Women.",
  },
  {
    id: "q18",
    question: "The \"elastic clause\" that lets an AO II be assigned duties from several former positions comes from:",
    choices: ["RA 9184", "DBM Budget Circular 2004-3", "The CSC Omnibus Rules", "COA Circular 97-002"],
    correct: 1,
    explanation: "DBM Budget Circular No. 2004-3 — the correct thing to cite if asked in the interview how you would handle work outside your job description.",
  },
  {
    id: "q19",
    question: "Which appointment type describes moving to a position of equivalent rank, level, or salary without a break in service?",
    choices: ["Promotion", "Transfer", "Reinstatement", "Demotion"],
    correct: 1,
    explanation: "Transfer. Promotion moves to a higher salary grade; reinstatement restores someone earlier removed, following exoneration; demotion moves to a lower salary grade and generally needs written consent.",
  },
  {
    id: "q20",
    question: "In the STAR method for a behavioural interview answer, which letter stands for the concrete steps you personally took, and is usually the longest part of the answer?",
    choices: ["S", "T", "A", "R"],
    correct: 2,
    explanation: "Action. Situation and Task set up the story quickly; Action is where the actual evidence of what you did lives, and Result closes it with what changed.",
  },
  {
    id: "q21",
    question: "RA 8972, as amended by RA 11861, grants which leave benefit specifically to qualified solo parents?",
    choices: ["Special Privilege Leave", "Parental Leave, 7 working days a year", "Rehabilitation Privilege", "Adoption Leave"],
    correct: 1,
    explanation: "Seven working days of parental leave per year, on top of ordinary VL/SL, for an employee holding a Solo Parent Identification Card.",
  },
  {
    id: "q22",
    question: "RA 11032 primarily addresses:",
    choices: ["Data privacy", "Government procurement", "Ease of doing business and efficient government service delivery", "Anti-graft practices"],
    correct: 2,
    explanation: "Ease of Doing Business and Efficient Government Service Delivery Act — prescribed processing times and the duty to cut red tape.",
  },
  {
    id: "q23",
    question: "What is the short cover note used when forwarding a batch of reports or documents to the SDO called?",
    choices: ["Certification", "Transmittal letter", "Indorsement", "Memorandum"],
    correct: 1,
    explanation: "A transmittal letter. It lists what is enclosed and why — it does not summarise or restate the attached documents, which is what makes it different from a report.",
  },
  {
    id: "q24",
    question: "An officer who has physical custody of government property, and is personally answerable for it, is called under COA rules a:",
    choices: ["Requesting official", "Accountable officer", "Appointing authority", "Head of agency"],
    correct: 1,
    explanation: "An accountable officer — primarily accountable if the property is entrusted directly to them, secondarily accountable if they merely approve or have access to its movement. This is the legal reason a custodian signs a PAR or ICS personally.",
  },
  ...assessmentQuiz,
];
