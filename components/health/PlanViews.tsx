"use client";

import {
  bpCategories,
  bpTechnique,
  doctorQuestions,
  eatingOut,
  exercises,
  exerciseSafety,
  medication,
  mobilityRoutine,
  phases,
  plateRule,
  profile,
  redFlags,
  sampleDays,
  shoppingList,
  swaps,
  whenNoGulay,
  workouts,
} from "@/data/health-plan";
import { phaseFor, toDateKey } from "@/lib/health/metrics";

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-5">{children}</div>;
}

function Heading({ title, blurb }: { title: string; blurb: string }) {
  return (
    <header className="border-b border-border pb-5">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-3xl leading-relaxed text-muted">{blurb}</p>
    </header>
  );
}

/* ------------------------------------------------------------------ */

export function PlanView() {
  const currentPhase = phaseFor(toDateKey(new Date()));

  return (
    <div className="space-y-6">
      <Heading
        title="The twelve weeks"
        blurb={`Four phases from ${new Date(profile.startDate).toLocaleDateString(undefined, { day: "numeric", month: "long" })} to ${new Date(profile.endDate).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}. Each phase changes two or three things and nothing else — that is deliberate. Plans fail because they change everything at once.`}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Starting</p>
          <p className="mt-1 text-2xl font-semibold">{profile.startWeightKg} kg</p>
          <p className="mt-1 text-xs text-muted">BMI 40.6 at {profile.heightCm} cm</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            12-week goal
          </p>
          <p className="mt-1 text-2xl font-semibold">{profile.goal12WeekKg} kg</p>
          <p className="mt-1 text-xs text-muted">
            −6 kg, about half a kilo a week. 5% is where blood pressure responds.
          </p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Six-month goal
          </p>
          <p className="mt-1 text-2xl font-semibold">{profile.goal6MonthKg} kg</p>
          <p className="mt-1 text-xs text-muted">
            10%. This is often where a doctor reviews the dose.
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        {phases.map((phase) => {
          const active = phase.id === currentPhase.id;
          return (
            <div
              key={phase.id}
              className={`rounded-xl border p-5 ${
                active ? "border-emerald-700/40 bg-emerald-700/[0.05]" : "border-border bg-card"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xl font-bold text-muted/50">{phase.number}</span>
                  <h3 className="text-lg font-semibold">{phase.title}</h3>
                </div>
                <span className="font-mono text-xs text-muted">{phase.weeks}</span>
              </div>

              {active && (
                <span className="mt-2 inline-block rounded-full border border-emerald-700/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                  You are here
                </span>
              )}

              <p className="mt-3 leading-relaxed text-foreground/80">{phase.goal}</p>

              <ul className="mt-4 space-y-2">
                {phase.changes.map((change, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/75">
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-border px-3 py-1 text-xs">
                  {phase.walkTarget}
                </span>
                <span className="rounded-full border border-border px-3 py-1 text-xs">
                  {phase.strengthTarget}
                </span>
              </div>

              <p className="mt-4 border-l-2 border-border pl-4 text-sm leading-relaxed text-muted">
                <span className="font-medium text-foreground/70">Done when: </span>
                {phase.checkpoint}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function MoveView() {
  return (
    <div className="space-y-6">
      <Heading
        title="Moving"
        blurb="No running, no jogging, no jumping — none of it is necessary and all of it is hard on your joints at this weight. Walking plus twice-weekly strength does the job, and the strength work is what keeps the weight coming off muscle-free."
      />

      <Card>
        <h3 className="font-semibold">Walking is the main event</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75">
          Two short walks beat one long one when you are starting out — easier on the knees, easier
          to fit in, and easier to do on a day you do not feel like it. Pace: you should be able to
          talk in full sentences but not sing. If you are gasping, slow down; you are not scoring
          points for speed.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {phases.slice(1).map((phase) => (
            <div key={phase.id} className="rounded-lg border border-border bg-background/60 p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Phase {phase.number}
              </p>
              <p className="mt-1 text-sm font-medium">{phase.walkTarget}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Walk before 7am or after 5pm. Philippine midday heat is not worth fighting, and losartan
          makes dehydration harder on your kidneys than it would otherwise be. Carry water.
        </p>
      </Card>

      {workouts.map((workout) => (
        <Card key={workout.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-semibold">{workout.name}</h3>
            <span className="text-xs text-muted">{workout.when}</span>
          </div>
          <p className="mt-1.5 text-sm text-muted">{workout.blurb}</p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                  <th className="py-2.5 pr-4 font-medium">Exercise</th>
                  <th className="py-2.5 pr-3 font-medium">Ph 1</th>
                  <th className="py-2.5 pr-3 font-medium">Ph 2</th>
                  <th className="py-2.5 pr-3 font-medium">Ph 3</th>
                  <th className="py-2.5 font-medium">Ph 4</th>
                </tr>
              </thead>
              <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                {workout.blocks.map((block) => {
                  const exercise = exercises.find((e) => e.id === block.exerciseId);
                  return (
                    <tr key={block.exerciseId} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pr-4 font-medium">{exercise?.name}</td>
                      {block.prescription.map((value, i) => (
                        <td key={i} className="py-2.5 pr-3 text-muted">
                          {value}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">
            Rest 60–90 seconds between rounds. If the last rep of a set feels easy, use the harder
            version next time.
          </p>
        </Card>
      ))}

      <Card>
        <h3 className="font-semibold">How to do each one</h3>
        <div className="mt-4 space-y-3">
          {exercises.map((exercise) => (
            <details
              key={exercise.id}
              className="group rounded-lg border border-border bg-background/50 px-4"
            >
              {/* min-h-11: this is tapped with a thumb, not clicked */}
              <summary className="flex min-h-11 cursor-pointer list-none items-center py-2.5 font-medium marker:content-none">
                <span className="mr-2 text-muted group-open:hidden">+</span>
                <span className="mr-2 hidden text-muted group-open:inline">−</span>
                {exercise.name}
              </summary>
              <div className="mb-3 space-y-2.5 pl-6 text-sm leading-relaxed">
                <p className="text-foreground/80">{exercise.how}</p>
                <p className="border-l-2 border-amber-600/40 pl-3 text-foreground/75">
                  <span className="font-medium">Cue: </span>
                  {exercise.cue}
                </p>
                <p className="text-muted">
                  <span className="font-medium">Easier: </span>
                  {exercise.easier}
                </p>
                <p className="text-muted">
                  <span className="font-medium">Harder: </span>
                  {exercise.harder}
                </p>
              </div>
            </details>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Five minutes of mobility, daily</h3>
        <ul className="mt-3 space-y-2">
          {mobilityRoutine.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/75">
              <span className="font-mono text-xs text-muted">{i + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="rounded-xl border border-rose-600/30 bg-rose-600/[0.04] p-5">
        <h3 className="font-semibold text-rose-900">When to stop</h3>
        <ul className="mt-3 space-y-2.5">
          {exerciseSafety.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/80">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose-700/60" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function EatView() {
  return (
    <div className="space-y-6">
      <Heading
        title="Eating"
        blurb="No counting, no weighing, no imported ingredients. One measured cup of rice, half a plate of gulay, and the sodium cut. That is most of it."
      />

      <Card>
        <h3 className="font-semibold">The plate</h3>
        <div className="mt-4 space-y-3">
          {plateRule.map((rule) => (
            <div key={rule.part} className="rounded-lg border border-border bg-background/60 p-4">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                  {rule.part}
                </span>
                <span className="font-medium">{rule.what}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{rule.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Swaps that do the work</h3>
        <p className="mt-1 text-sm text-muted">
          Sodium is the fastest lever you have on blood pressure. These are ordered roughly by how
          much they matter.
        </p>
        <div className="mt-4 space-y-2.5">
          {swaps.map((swap) => (
            <div key={swap.from} className="rounded-lg border border-border bg-background/50 p-4">
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted line-through decoration-rose-700/40">{swap.from}</span>
                <span aria-hidden className="text-muted">
                  →
                </span>
                <span className="font-medium">{swap.to}</span>
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{swap.why}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Three days that look like real days</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {sampleDays.map((day) => (
            <div key={day.label} className="rounded-lg border border-border bg-background/50 p-4">
              <p className="font-medium">{day.label}</p>
              <div className="mt-3 space-y-3">
                {[day.breakfast, day.lunch, day.dinner, day.snack].map((meal) => (
                  <div key={meal.name}>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      {meal.name}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {meal.items.map((item) => (
                        <li key={item} className="text-sm leading-relaxed text-foreground/80">
                          {item}
                        </li>
                      ))}
                    </ul>
                    {meal.note && (
                      <p className="mt-1 text-xs leading-relaxed text-muted">{meal.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">When there is no gulay</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Vegetables are not always available, and a plan that collapses on those days is not a
          plan. In rough order of how well they keep.
        </p>
        <div className="mt-4 space-y-3">
          {whenNoGulay.map((item, index) => (
            <div
              key={item.option}
              className={`rounded-lg border p-4 ${
                index === whenNoGulay.length - 1
                  ? "border-amber-600/30 bg-amber-600/[0.04]"
                  : "border-border bg-background/50"
              }`}
            >
              <p className="text-sm font-medium">{item.option}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Palengke list</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {shoppingList.map((group) => (
            <div
              key={group.group}
              className={`rounded-lg border p-4 ${
                group.group.startsWith("Do not")
                  ? "border-rose-600/30 bg-rose-600/[0.04]"
                  : "border-border bg-background/50"
              }`}
            >
              <p className="text-sm font-medium">{group.group}</p>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {group.items.map((item) => (
                  <li key={item} className="text-sm text-foreground/75">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">When you are not at home</h3>
        <div className="mt-4 space-y-3">
          {eatingOut.map((entry) => (
            <div key={entry.situation}>
              <p className="text-sm font-medium">{entry.situation}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{entry.move}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/* Blood pressure is no longer tracked in the app, so these live here rather
   than in metrics — they are only used to explain a reading you were given
   at a clinic or pharmacy. Status colours ship with a label, never alone. */
const BP_TONE: Record<string, string> = {
  good: "text-[#0ca30c] border-[#0ca30c]/40 bg-[#0ca30c]/10",
  warning: "text-[#a06f00] border-[#fab219]/50 bg-[#fab219]/10",
  serious: "text-[#b4552b] border-[#ec835a]/50 bg-[#ec835a]/10",
  critical: "text-[#d03b3b] border-[#d03b3b]/50 bg-[#d03b3b]/10",
};

const SEVERITY_STYLE: Record<string, string> = {
  high: "border-rose-600/35 bg-rose-600/[0.05]",
  medium: "border-amber-600/35 bg-amber-600/[0.05]",
  low: "border-border bg-background/50",
};

export function SafetyView() {
  return (
    <div className="space-y-6">
      <Heading
        title="Safety and medication"
        blurb="The most important tab here. General information, not medical advice — it does not replace the doctor who prescribed your medication, and nothing here changes a dose."
      />

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold">{medication.name}</h3>
        <p className="mt-1 text-sm text-muted">{medication.contains}</p>
        <p className="mt-3 rounded-lg border border-border bg-background/60 p-4 text-sm leading-relaxed text-foreground/75">
          {medication.disclaimer}
        </p>

        <div className="mt-4 space-y-3">
          {medication.notes.map((note) => (
            <div
              key={note.title}
              className={`rounded-lg border p-4 ${SEVERITY_STYLE[note.severity] ?? SEVERITY_STYLE.low}`}
            >
              <p className="text-sm font-semibold">{note.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{note.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-rose-600/40 bg-rose-600/[0.06] p-5">
        <h3 className="font-semibold text-rose-900">Get help immediately</h3>
        <p className="mt-1 text-sm text-foreground/75">
          Emergency number in the Philippines is <strong>911</strong>.
        </p>
        <div className="mt-4 space-y-2.5">
          {redFlags.map((flag) => (
            <div key={flag.sign} className="rounded-lg border border-rose-600/25 bg-background/50 p-4">
              <p className="text-sm font-medium">{flag.sign}</p>
              <p className="mt-1 text-sm text-rose-800">{flag.action}</p>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <h3 className="font-semibold">Getting your blood pressure checked</h3>
        <p className="mt-1 text-sm text-muted">
          You are not tracking this daily — there is no monitor, and daily readings are not
          necessary. What matters is a properly taken reading about once a month, because a badly
          taken one sends you and your doctor chasing a number that was never real.
        </p>
        <ol className="mt-4 space-y-2">
          {bpTechnique.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/80">
              <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <h3 className="font-semibold">What the numbers mean</h3>
        <div className="mt-4 space-y-2">
          {bpCategories.map((category) => (
            <div key={category.label} className={`rounded-lg border p-4 ${BP_TONE[category.tone]}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold">{category.label}</span>
                <span className="text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {category.range}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{category.meaning}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          These are general home-reading bands. Your own target is set by your doctor and may be
          different — ask at your next visit.
        </p>
      </Card>

      <Card>
        <h3 className="font-semibold">Ask your doctor these</h3>
        <p className="mt-1 text-sm text-muted">
          Bring your charts to the week 11–12 appointment. Twelve weeks of home readings is more
          useful than anything measured in a clinic on one afternoon.
        </p>
        <ul className="mt-4 space-y-2.5">
          {doctorQuestions.map((question, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/80">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />
              <span>{question}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
