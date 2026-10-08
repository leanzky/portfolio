/**
 * Assessment-format content and worked example documents for the AO II
 * reviewer. Split from data.ts only to keep that file navigable; the types
 * come from there.
 *
 * Sourcing: the format notes come from two public walkthrough videos by a
 * former DepEd AO II, cross-checked against DepEd Order 007, s. 2023. They
 * describe common practice, not any one division's memorandum.
 *
 * Every school, person, property number and amount in the examples is
 * invented for practice.
 */

import type { AdminNote, ChecklistDef, TemplateDef } from "./data";

export const potentialBreakdown: { part: string; points: number; what: string }[] = [
  { part: "Written examination", points: 5, what: "A scenario-based written task, usually answered by composing a letter or similar document" },
  { part: "Work sample test", points: 10, what: "A practical, skills-based test: documents, spreadsheets, computations" },
  { part: "Behavioural events interview (BEI)", points: 5, what: "Panel interview, normally held right after the work sample" },
];

export const assessmentFormatNotes: AdminNote[] = [
  {
    h: "It is not a board or Civil Service style exam",
    body: [
      "There is no multiple-choice paper like the LET or the Civil Service exam. For non-teaching positions the written examination and the work sample test are practical: they measure what you can actually produce. (The English Proficiency Test people mention is a teacher-side exam, not part of this one.)",
      "Per DepEd Order 007, s. 2023, the written examination is a standardised measure of knowledge, language proficiency, ability to present ideas, judgment and leadership. In practice you are handed a scenario and asked to answer it as a document, most often a letter.",
      "The test and its rubric are built by a subject matter expert and tailored to the vacancy. A vacancy in a supply office gets supply scenarios (requests, incident reports for lost or damaged property). An HR vacancy gets HR scenarios. Find out which office your item sits in: school, district, SDS or ASDS office, supply, HR or accounting.",
    ],
  },
  {
    h: "Tasks that have been reported",
    body: [
      "Documents: memorandum, business letter, request letter, incident report, narrative report, accomplishment report, minutes of the meeting, invitation, certificates, project proposal, action research. Worked examples of nearly all of these are in the Examples tab.",
      "Excel: encode given numbers into a spreadsheet (a budget or a payroll), build tables and reports, make a pivot table, add a chart or graph. Layout and readability count.",
      "Computation: a payroll or ledger item such as the deduction for a teacher's tardiness, or a school's monthly MOOE where allotment minus expenses is expected to come out to zero at month end.",
      "File handling: organise electronic files, convert Word to PDF and PDF back to Word, and be ready to upload.",
      "Financial: a financial report, a liquidation report, an accomplishment report.",
    ],
  },
  {
    h: "Bring your own setup",
    body: [
      "Reported practice is that applicants bring their own laptop, their own internet connection and an extension cord. Phone data works for connectivity. Do not assume the division will provide any of it, and check the memorandum for the actual instruction.",
      "Open every tool you will need once at home first: Word, Excel, a PDF converter. A dead battery or a first-launch sign-in screen is lost time on a timed task.",
    ],
  },
  {
    h: "The BEI as described by the same source",
    body: [
      "Usually a panel of three, sometimes two or four. The standard questions: tell us about yourself, why DepEd, what an AO II does (know the four key result areas), how you prioritise several deadlines, how you deal with difficult teachers, parents and suppliers, your greatest accomplishment, the values a public servant should have, and why we should hire you.",
      "What is being measured: communication, confidence, professionalism, problem solving, integrity and knowledge of DepEd operations. Honesty scores, and panels notice embellishment. Say what you actually know and did.",
      "Because the work sample and the BEI happen back to back, the same preparation serves both: know the duties of the exact vacancy.",
    ],
  },
  {
    h: "How much to trust this section",
    body: [
      "It comes from two public walkthrough videos by someone who worked as an AO II and now teaches, plus DepEd Order 007. It describes common practice, not your division's memorandum. The actual tasks, time limits, equipment rules and the exact split of the 20 potential points are set by the SDO and announced in a separate memorandum. Treat the memorandum as final.",
    ],
  },
];

export const assessmentKit: ChecklistDef = {
  id: "kit",
  label: "Assessment-day kit",
  tabId: "written",
  items: [
    { id: "kit1", label: "Laptop fully charged, charger and an extension cord", why: "Reported as the applicant's responsibility. A strip with several outlets is safer than a single cord." },
    { id: "kit2", label: "Internet backup: phone with data and tethering tested", why: "Test the hotspot with the laptop at home. Know your data balance." },
    { id: "kit3", label: "Word, Excel and a PDF converter installed and opened once", why: "First launch prompts and sign-in screens eat time. Do them the night before." },
    { id: "kit4", label: "Practised Word to PDF and PDF to Word under a time limit", why: "Know the Save As and Print to PDF routes without looking." },
    { id: "kit5", label: "Practised a pivot table and a chart in Excel", why: "Insert, PivotTable, drag fields, then Insert chart. Keep it simple and readable." },
    { id: "kit6", label: "Practised SUM, SUMIF and IF on a payroll-style sheet", why: "Total, subtotal by category, and a check column." },
    { id: "kit7", label: "Memorised the undertime equivalent table", why: "15 min = 0.031, 30 min = 0.062, 45 min = 0.094, 1 hour = 0.125 day. Confirm against the current CSC table." },
    { id: "kit8", label: "Pens, calculator, ruler and original IDs", why: "For anything handwritten or signed on the day." },
    { id: "kit9", label: "Asked whether any reference material may be brought", why: "Never assume a reference file is permitted. Ask the HRMO." },
  ],
};

export const scenarioPrompts: { id: string; prompt: string; shows: string }[] = [
  { id: "sc1", prompt: "A supplier delivered 20 reams of bond paper against a purchase order for 25. The school head asks you to write to the supplier.", shows: "A clear reference to the PO and delivery receipt, the shortage stated in numbers, a firm deadline, and a polite tone that does not accept the delivery as complete." },
  { id: "sc2", prompt: "Two laptops assigned to the ICT room cannot be found during the annual physical count. Prepare the report.", shows: "Incident report structure, property numbers, who last had custody, actions taken so far, and escalation rather than a quiet settlement." },
  { id: "sc3", prompt: "A teacher asks you for a copy of a colleague's service record because she wants to check seniority.", shows: "Data Privacy Act and confidentiality of 201 files. Decline politely, explain the rule, and offer the proper route through the school head or HRMO." },
  { id: "sc4", prompt: "The division asks every school to submit updated 201 file requirements in one week. Inform all personnel.", shows: "A memorandum from the school head with number and series, a numbered body, a deadline, where to submit, and a compliance line." },
  { id: "sc5", prompt: "Brigada Eskwela opens in two weeks. Invite the Punong Barangay and the PTA president.", shows: "An invitation with the purpose, date, time, venue, what you ask of them, and a contact for confirmation." },
  { id: "sc6", prompt: "A parent complains that her child's certificate was issued with a misspelled name. Respond.", shows: "Acknowledgement, apology without blame, the correction process and requirements, and a realistic timeline." },
  { id: "sc7", prompt: "A cash advance for a training is still unliquidated after the deadline. Notify the accountable officer.", shows: "The liquidation period under COA rules, the amount and date, a settlement date, and the consequence for any further advance." },
  { id: "sc8", prompt: "You have three tasks due today: a payroll cutoff, a visitor's request for a certification, and a supplier follow-up. Explain how you will order them.", shows: "A defensible rule (fixed external deadline first, then legal or financial exposure, then courtesy items) and who you inform." },
];

export const exampleNotes: string[] = [
  "The school, people, property numbers and amounts are fictional. Replace them; never reuse them in a real submission.",
  "Salary figures are practice numbers, not the actual SG 11 rate.",
  "Formats follow common DepEd and COA practice. Your division may prefer its own layout, so check the memorandum or ask the HRMO.",
];

export const examples: TemplateDef[] = [
  {
    id: "ex-request",
    kra: "KRA 3 — General Administrative Support",
    title: "Request letter for supplies",
    when: "Asking the school head to approve an issuance of supplies, tied to a requisition.",
    body:
`October 8, 2026

MARIA L. SANTOS
School Head
Sampaguita Elementary School
Brgy. San Isidro, Sample Town, Camarines Sur

Dear Ma'am Santos:

Greetings!

I respectfully request approval to procure 10 reams of A4 bond paper
(70 gsm) and 6 boxes of staple wire No. 35 for the school office. The
current stock is 2 reams and 1 box, which will run out within the week
because of the Quarter 2 report cards and the school forms due on
October 20.

The attached Request for Quotation and Requisition and Issue Slip No.
2026-10-014 list the items and the estimated cost of Php 3,255.00,
chargeable to the Office Supplies line of the October MOOE.

I am hopeful for your favorable response.

Respectfully yours,

JUAN D. REYES
Administrative Officer II

Noted/Approved:

MARIA L. SANTOS
School Head`,
    notes: [
      "Shape: greeting, the request in the first paragraph, the justification and numbers in the second, the attachments and charge account in the third, a courteous close.",
      "Specifics beat adjectives. 'Stock is 2 reams and runs out this week' is a reason; 'we badly need paper' is not.",
      "State the funding source. A request with no charge account usually comes back.",
      "Check: 10 reams at Php 285.00 = 2,850.00, plus 6 boxes at Php 67.50 = 405.00, gives 3,255.00.",
    ],
  },
  {
    id: "ex-incident",
    kra: "KRA 2 — Property Custodianship",
    title: "Incident report (missing property)",
    when: "Reporting lost, damaged or stolen government property so it can be investigated through the proper process.",
    body:
`INCIDENT REPORT

Sampaguita Elementary School
Report No.: 2026-IR-007
Date of report: October 8, 2026

TO:       MARIA L. SANTOS, School Head
FROM:     JUAN D. REYES, Administrative Officer II
SUBJECT:  Missing LCD projector, Room 4

1. WHAT HAPPENED
   During the monthly inventory check on October 7, 2026 at about
   2:30 PM, one (1) LCD projector, Epson EB-X06, Property No.
   2023-05-0142, acquisition cost Php 28,500.00, was found missing
   from Room 4. It was last verified in place on September 9, 2026.

2. PERSON IN CUSTODY
   Ms. Ana B. Dizon (Grade 5 adviser, Room 4), under Property
   Acknowledgement Receipt No. 2023-044.

3. ACTION TAKEN
   a. The room, ICT room and storeroom were searched the same day.
      The unit was not found.
   b. Ms. Dizon was asked for a written statement, attached.
   c. The guard's logbook shows no unusual entry between
      September 9 and October 7.
   d. The incident was blottered with the local police on
      October 8, 2026 (Blotter Entry No. 118-26, copy attached).

4. RECOMMENDATION
   Elevate the matter to the Schools Division Office for guidance on
   the Report of Loss and the investigation, and make no charge or
   settlement until that process is complete.

Prepared by:                        Noted by:

JUAN D. REYES                       MARIA L. SANTOS
Administrative Officer II           School Head

Attachments: Statement of Ms. Dizon; blotter extract; PAR No. 2023-044`,
    notes: [
      "Facts first, in the order they happened, with dates, times, property number and cost. No guessing about who is responsible.",
      "Always say what was done and by whom. Escalation is the correct recommendation. An AO II does not settle a loss quietly or decide liability.",
      "Attach the support: the custodian's statement, the blotter, and the PAR.",
    ],
  },
  {
    id: "ex-memo",
    kra: "KRA 1 — Personnel Administration",
    title: "Memorandum: updated 201 file requirements",
    when: "A filled-in version of the standard memorandum, from the school head to all personnel.",
    body:
`Republic of the Philippines
Department of Education
Region V (Bicol)
Schools Division of Camarines Sur
SAMPAGUITA ELEMENTARY SCHOOL

MEMORANDUM
No. 41, s. 2026

TO:       All Teaching and Non-Teaching Personnel
FROM:     MARIA L. SANTOS, School Head
DATE:     October 8, 2026
SUBJECT:  Submission of Updated 201 File Requirements

1. In line with the Division directive on records validation, all
   personnel are required to submit updated 201 file requirements.

2. Submit photocopies of: (a) latest Personal Data Sheet (CS Form
   212, revised 2025); (b) certificates of seminars and trainings
   attended from 2025 to date; (c) latest appointment or Service
   Record; and (d) SALN for 2025, where applicable.

3. Deadline is on or before October 15, 2026, 4:00 PM, at the School
   Administrative Office, attention Mr. Juan D. Reyes, AO II. Late
   submissions will be reported to the Division HRMO.

4. For guidance and strict compliance.

MARIA L. SANTOS
School Head`,
    notes: [
      "Compare with the blank memorandum in the Templates tab and find each part.",
      "Item 2 lists exactly what to bring, so nobody has to ask. Item 3 has a date, a time, a place and a person.",
      "Keep a log of memo numbers. No. 41 means there were 40 before it this year.",
    ],
  },
  {
    id: "ex-invitation",
    kra: "KRA 3 — General Administrative Support",
    title: "Invitation letter",
    when: "Inviting an outside guest or partner to a school event.",
    body:
`October 8, 2026

HON. ROBERTO M. CRUZ
Punong Barangay
Barangay San Isidro, Sample Town, Camarines Sur

Dear Kapitan Cruz:

Warmest greetings from Sampaguita Elementary School!

The school will hold the opening of Brigada Eskwela on Monday,
October 19, 2026 at 8:00 AM at the school grounds. This is our yearly
community effort to prepare classrooms and facilities, and your
support has always made it possible.

We would be honored to have you as our guest of honor and to deliver
a short message to our volunteers. We also ask for the barangay's help
in encouraging volunteers and, if possible, in lending hand tools for
the day.

Kindly confirm your attendance with Mr. Juan D. Reyes, Administrative
Officer II, at 0917-000-0000 on or before October 14, 2026.

Maraming salamat po.

Respectfully yours,

MARIA L. SANTOS
School Head`,
    notes: [
      "An invitation answers who, what, when, where and why in the first two paragraphs.",
      "State what you are asking of the guest and give a confirm-by date with a contact.",
      "Match the register to the guest. A barangay captain is addressed formally and warmly.",
    ],
  },
  {
    id: "ex-minutes",
    kra: "KRA 3 — General Administrative Support",
    title: "Minutes of the meeting",
    when: "Recording a staff or committee meeting so decisions and assignments can be traced.",
    body:
`MINUTES OF THE SCHOOL STAFF MEETING
Sampaguita Elementary School
Date: October 6, 2026      Time: 3:30 PM to 4:45 PM
Venue: Faculty Room

PRESENT: Maria L. Santos (School Head, presiding); Ana B. Dizon;
         Pedro C. Lim; Rosa T. Garcia; Juan D. Reyes (AO II, recorder)
ABSENT:  Elena V. Ramos (on approved sick leave)

I.   CALL TO ORDER
     The School Head called the meeting to order at 3:30 PM. A quorum
     was present.

II.  AGENDA
     1. Quarter 2 report cards
     2. Brigada Eskwela
     3. 201 file update

III. DISCUSSION AND DECISIONS
     1. Report cards will be distributed on October 30. Advisers
        submit grades to the registrar by October 23.
     2. Opening is set for October 19. Mr. Lim will lead the volunteer
        sign-up. The AO II will prepare invitations and a supply list.
     3. All personnel must submit updated 201 files by October 15
        (Memorandum No. 41, s. 2026).

IV.  ACTION ITEMS
     Item                          Person           Due
     Grades to registrar           Advisers         Oct 23
     Volunteer list                Mr. Lim          Oct 12
     Invitations and supply list   Mr. Reyes        Oct 9
     201 file submission           All personnel    Oct 15

V.   ADJOURNMENT
     There being no other business, the meeting adjourned at 4:45 PM.

Prepared by:                      Approved by:
JUAN D. REYES                     MARIA L. SANTOS
Recorder                          School Head`,
    notes: [
      "Minutes record decisions and assignments, not who said what. Keep it short.",
      "The action item table (what, who, by when) is the most useful part and the easiest thing to be graded on.",
      "Note who was absent and why, and that a quorum existed.",
    ],
  },
  {
    id: "ex-certificate",
    kra: "KRA 3 — General Administrative Support",
    title: "Certificate of appreciation",
    when: "Recognising a volunteer, resource speaker or partner.",
    body:
`      Republic of the Philippines
        Department of Education
          Region V (Bicol)
   Schools Division of Camarines Sur
   SAMPAGUITA ELEMENTARY SCHOOL

     CERTIFICATE OF APPRECIATION
       is gratefully awarded to

         ROBERTO M. CRUZ
          Punong Barangay

for his generous support and active participation as Guest of Honor
during the Brigada Eskwela Opening Program held on October 19, 2026
at Sampaguita Elementary School, San Isidro, Sample Town,
Camarines Sur.

Given this 19th day of October, 2026 at Sampaguita Elementary School.


   MARIA L. SANTOS            ELENA P. NAVARRO
     School Head          PTA President`,
    notes: [
      "Spell the name and title exactly. A misspelled recipient is the most common fault.",
      "The body gives the reason, the event, the date and the place. The 'Given this ___ day' line is the standard closing.",
      "Keep a numbered log of certificates issued if your office requires it.",
    ],
  },
  {
    id: "ex-accomplishment",
    kra: "KRA 1 — Personnel Administration",
    title: "Monthly accomplishment report",
    when: "Summarising what the AO II delivered in the month, with numbers, for the school head.",
    body:
`ACCOMPLISHMENT REPORT
Juan D. Reyes, Administrative Officer II
Sampaguita Elementary School
For the month of September 2026

A. PERSONNEL ADMINISTRATION
   1. Prepared and submitted the Monthly Report of Service for 24
      personnel on time on October 1.
   2. Processed 9 leave applications (7 approved, 2 pending), updated
      leave cards and computed credits for all.
   3. Updated the 201 files of 6 newly assigned personnel.

B. PROPERTY CUSTODIANSHIP
   1. Conducted the monthly inventory: 214 items checked, 1
      discrepancy found and reported (IR No. 2026-IR-007).
   2. Issued supplies through 11 RIS. Balances recorded in the stock
      cards.

C. FINANCIAL MANAGEMENT
   1. Prepared 6 disbursement vouchers totalling Php 38,420.00,
      each with complete supporting documents.
   2. Liquidated 2 cash advances totalling Php 12,000.00 within the
      period. No outstanding advance as of September 30.

D. GENERAL ADMINISTRATIVE SUPPORT
   1. Drafted and filed 5 memoranda and 14 outgoing communications;
      logged 31 incoming communications.
   2. Organised the Brigada Eskwela committee records.

E. CHALLENGES AND PLANS FOR OCTOBER
   Two DTRs were submitted late. A reminder will go out one week
   before each cutoff and a calendar will be posted in the faculty
   room.

Prepared by:                       Noted by:
JUAN D. REYES, AO II               MARIA L. SANTOS, School Head`,
    notes: [
      "Organise by key result area, because that is how the panel and the rating system think about the job.",
      "Every line has a count or an amount. 'Processed 9 leave applications (7 approved, 2 pending)' is evidence; 'processed leave applications' is not.",
      "End with a challenge and a plan. Showing you spot problems and propose a fix reads as maturity.",
    ],
  },
  {
    id: "ex-narrative",
    kra: "KRA 3 — General Administrative Support",
    title: "Narrative report of an activity",
    when: "Writing up an event after it happens, usually for the school head and the division.",
    body:
`NARRATIVE REPORT
Brigada Eskwela Opening Program
October 19, 2026 · Sampaguita Elementary School

I.   BACKGROUND
     Brigada Eskwela is the annual national school maintenance effort
     in which parents, local leaders and volunteers help prepare
     classrooms before classes open.

II.  OBJECTIVES
     1. To repaint and repair 8 classrooms and the school fence.
     2. To mobilise at least 60 volunteers from the community.

III. PROCEEDINGS
     The program began at 8:00 AM with the flag ceremony and an
     opening message from the School Head. Punong Barangay Roberto M.
     Cruz, the guest of honor, encouraged volunteers to keep helping
     the school. Work teams were assigned per classroom and
     refreshments were served at 10:00 AM. Work ended at 4:00 PM.

IV.  RESULTS
     71 volunteers attended (parents 48, barangay 15, alumni 8).
     Eight classrooms were repainted and 12 broken chairs repaired.
     The fence repair was 70 percent complete.

V.   ISSUES AND RECOMMENDATIONS
     Paint ran short by 4 gallons. Recommend estimating materials per
     room at least a week before the event and asking partners earlier.

Prepared by: JUAN D. REYES, AO II
Noted by:    MARIA L. SANTOS, School Head

Attachments: attendance sheet, photo documentation, expense summary`,
    notes: [
      "A narrative report tells the story in order, but the results section has numbers measured against the objectives.",
      "Honest issues and a recommendation are expected. A report with no problems looks careless.",
      "Always attach attendance and photos. They are the means of verification.",
    ],
  },
  {
    id: "ex-payroll",
    kra: "KRA 4 — Financial Management",
    title: "Payroll computations: tardiness deduction and salary differential",
    when: "Practical computations a work sample can ask for. Show every step.",
    body:
`ASSUMPTIONS (practice figures only)
  Monthly basic salary:            Php 30,000.00
  Working days used as divisor:    22
  Daily rate:  30,000.00 / 22   =  Php 1,363.64

A. DEDUCTION FOR TARDINESS
   A teacher was late on three days in September:
     Sept 3    20 minutes
     Sept 10   15 minutes
     Sept 24   10 minutes
   Total = 45 minutes

   Equivalent of 45 minutes (CSC undertime table) = 0.094 day
   Deduction = 1,363.64 x 0.094 = Php 128.18

   Charge against leave credits if the employee files for it and
   credits are available. Otherwise deduct from salary.

B. SALARY DIFFERENTIAL
   Salary adjusted from Php 30,000.00 to Php 31,000.00, effective
   March 1, but paid only starting May. Covers March and April.

   Monthly difference:  31,000.00 - 30,000.00 = Php 1,000.00
   Months affected:     2
   Differential:        1,000.00 x 2          = Php 2,000.00

C. CHECK
   September pay after the tardiness deduction:
   30,000.00 - 128.18 = Php 29,871.82
   (before any other statutory deductions)`,
    notes: [
      "Write the assumption, the formula, the substitution and the answer. Partial credit follows the method.",
      "The 22 divisor and the undertime table are common conventions. Confirm against the CSC and DepEd guidance your division follows before using them for real.",
      "Keep two decimals on every peso amount and round at the end of each step.",
    ],
  },
  {
    id: "ex-mooe",
    kra: "KRA 4 — Financial Management",
    title: "Monthly MOOE utilisation (balance to zero)",
    when: "Reconciling a school's monthly maintenance and operating allotment against its expenses.",
    body:
`MOOE UTILISATION, SEPTEMBER 2026
Sampaguita Elementary School

  Allotment for the month:                    Php 45,000.00

  EXPENSE CLASS                               AMOUNT
  Utilities (water, electricity)            12,500.00
  Office supplies                           18,200.00
  Repairs and maintenance                    6,800.00
  Internet subscription                      3,500.00
  Other (transport, fees)                    4,000.00
                                            ---------
  TOTAL EXPENSES                            45,000.00

  BALANCE = 45,000.00 - 45,000.00  =  Php 0.00

  Spreadsheet formulas
    Total    =SUM(C5:C9)
    Balance  =C3-C10
    Check    =IF(C11=0,"Zero balance","Review")

  If the balance is not zero, show the difference, the reason
  (unpaid obligation, unliquidated advance, unspent allotment) and
  where it is carried.`,
    notes: [
      "One source says a monthly MOOE check should come out to zero. In practice an unspent balance can carry over. Show the arithmetic and explain any remainder rather than forcing the number.",
      "A Check cell using IF() is a quick way to show the sheet verifies itself.",
      "Keep expense classes consistent with the school's chart of accounts and its SIP and AIP line items.",
    ],
  },
  {
    id: "ex-excel",
    kra: "KRA 2 — Property Custodianship",
    title: "Supplies issuance sheet with summary and pivot",
    when: "An Excel task: encode given data, total it, summarise by category and chart it.",
    body:
`SHEET 1: Issuance
 A Date  B RIS No.     C Item           D Category  E Qty  F Unit  G Amount
 Sep 02  2026-09-001   Bond paper A4    Paper         5    285.00  =E2*F2
 Sep 03  2026-09-002   Staple wire #35  Fasteners     3     18.00  =E3*F3
 Sep 08  2026-09-003   Bond paper A4    Paper        10    285.00  =E4*F4
 Sep 10  2026-09-004   Marker, black    Writing      12     22.00  =E5*F5
 Sep 15  2026-09-005   Ballpen, blue    Writing      24      8.00  =E6*F6
 Sep 22  2026-09-006   Folder, long     Paper        50      6.50  =E7*F7
 TOTAL                                               =SUM(E2:E7)   =SUM(G2:G7)

SHEET 2: Summary by category
 Category    Qty issued              Amount
 Paper       =SUMIF(D:D,A2,E:E)      =SUMIF(D:D,A2,G:G)
 Writing     =SUMIF(D:D,A3,E:E)      =SUMIF(D:D,A3,G:G)
 Fasteners   =SUMIF(D:D,A4,E:E)      =SUMIF(D:D,A4,G:G)

WHAT THE SHEET SHOULD SHOW
 Paper       65 pcs    4,600.00   (1,425 + 2,850 + 325)
 Writing     36 pcs      456.00   (264 + 192)
 Fasteners    3 pcs       54.00
 Total      104 pcs    5,110.00

PIVOT TABLE ROUTE
 Select the data, Insert > PivotTable. Rows = Category, Values =
 Sum of Amount. Then Insert > Chart > Column for a quick graph.`,
    notes: [
      "Cross-check: the summary total must equal the issuance total. If the two differ, a category label has a typo.",
      "Freeze the header row, format amounts with two decimals, and set the print area so it prints on one page.",
      "Keep it simple and readable. The panel is checking accuracy and layout, not how clever your formulas are.",
    ],
  },
  {
    id: "ex-proposal",
    kra: "KRA 3 — General Administrative Support",
    title: "One-page project proposal / action research outline",
    when: "A short proposal for a school problem, which is among the reported task types.",
    body:
`PROJECT PROPOSAL
Title:          Project ON-TIME: Improving Timely Submission of Daily
                Time Records (DTR)
Proponent:      Juan D. Reyes, Administrative Officer II
Beneficiaries:  24 teaching and non-teaching personnel
Duration:       November 2026 to March 2027

1. RATIONALE / PROBLEM
   In the last 3 months, 9 of 72 DTRs (12.5 percent) were submitted
   after the cutoff, delaying the Monthly Report of Service and
   salary processing.

2. OBJECTIVES
   a. Reduce late DTR submissions from 12.5 percent to below 3
      percent by the end of March 2027.
   b. Release the Monthly Report of Service on or before the 3rd
      working day of each month.

3. ACTIVITIES
   Activity                         Person               Schedule
   Orientation on DTR rules         AO II                Nov 2026
   Posting of the cutoff calendar   AO II                Nov 2026
   Reminder one week before cutoff  AO II                Monthly
   Monthly tally and feedback       AO II, School Head   Monthly

4. BUDGET
   Printing of the cutoff calendar          Php 1,200.00
   Total                                    Php 1,200.00
   Source: MOOE, Office Supplies line

5. MONITORING AND EVALUATION
   Compare the monthly late-submission rate with the baseline and
   report it in the accomplishment report.

Prepared by: JUAN D. REYES        Approved: MARIA L. SANTOS`,
    notes: [
      "A proposal has the same bones whatever the topic: a measured problem, an objective with a target, activities with owners and dates, a budget with a fund source, and a way of checking.",
      "For action research, the same problem becomes a research question, and the activities become an intervention and a method of measuring change.",
      "Use a baseline number. It makes the objective measurable and the report easy to write later. (Check: 9 of 72 is 12.5 percent.)",
    ],
  },
];
