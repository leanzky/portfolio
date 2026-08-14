"use client";

import { useState } from "react";
import { dailyRhythm, exercises, workouts } from "@/data/health-plan";
import { phaseFor, phaseIndex, formatDate } from "@/lib/health/metrics";
import type { HealthDayInput, HealthDayRow } from "@/lib/health/types";

/** Strength days: Mon/Wed/Fri (0 = Sunday). Nothing during the setup
    weekend — phase 0 is shopping and a baseline weigh-in, not training. */
function workoutForDay(dateKey: string, phaseNumber: string) {
  if (phaseNumber === "0") return null;
  const day = new Date(dateKey + "T00:00:00").getDay();
  if (day === 1 || day === 5) return workouts[0];
  if (day === 3) return workouts[1];
  return null;
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  placeholder,
  step = "1",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="mt-1.5 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 focus-within:border-foreground/40">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-base outline-none"
          style={{ fontVariantNumeric: "tabular-nums" }}
        />
        {suffix && <span className="shrink-0 text-xs text-muted">{suffix}</span>}
      </span>
    </label>
  );
}

function MealField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 focus-within:border-foreground/40">
      <span className="w-20 shrink-0 text-xs font-medium text-muted">{label}</span>
      <input
        type="text"
        value={value}
        maxLength={500}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        // text-base keeps iOS from zooming the page on focus.
        className="min-h-12 w-full bg-transparent text-base outline-none placeholder:text-muted/50"
      />
    </label>
  );
}

function Toggle({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition ${
        checked
          ? "border-emerald-700/40 bg-emerald-700/[0.07]"
          : "border-border bg-background hover:border-foreground/25"
      }`}
    >
      <span
        aria-hidden
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border text-xs font-bold ${
          checked
            ? "border-emerald-700/50 bg-emerald-700/20 text-emerald-800"
            : "border-border text-transparent"
        }`}
      >
        ✓
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {detail && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{detail}</span>}
      </span>
    </button>
  );
}

function Counter({
  label,
  value,
  onChange,
  max,
  hint,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  max: number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            aria-label={`One fewer ${label}`}
            className="grid h-11 w-11 place-items-center rounded-lg border border-border text-xl leading-none transition active:bg-foreground/[0.06] hover:border-foreground/40"
          >
            −
          </button>
          <span
            className="w-7 text-center text-lg font-semibold"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            aria-label={`One more ${label}`}
            className="grid h-11 w-11 place-items-center rounded-lg border border-border text-xl leading-none transition active:bg-foreground/[0.06] hover:border-foreground/40"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export function TodayView({
  dateKey,
  row,
  onSave,
  saving,
}: {
  dateKey: string;
  row: HealthDayRow | undefined;
  onSave: (values: HealthDayInput) => Promise<void>;
  saving: boolean;
}) {
  // The form is seeded from the saved row once, at mount. The parent gives
  // this component a key that changes when the day changes or when the row
  // first arrives from Supabase, so React remounts it and these initialisers
  // run again — no effect syncing props into state, and no wiping what you
  // are halfway through typing every time the row is re-fetched.
  const text = (value: number | null | undefined) => (value != null ? String(value) : "");

  const [weight, setWeight] = useState(() => text(row?.weight_kg));
  const [walk, setWalk] = useState(() => (row?.walk_minutes ? String(row.walk_minutes) : ""));
  const [rice, setRice] = useState(() => text(row?.rice_cups));
  const [breakfast, setBreakfast] = useState(() => row?.breakfast ?? "");
  const [lunch, setLunch] = useState(() => row?.lunch ?? "");
  const [dinner, setDinner] = useState(() => row?.dinner ?? "");
  const [snacks, setSnacks] = useState(() => row?.snacks ?? "");
  const [sleep, setSleep] = useState(() => text(row?.sleep_hours));
  const [strength, setStrength] = useState(() => row?.strength_done ?? false);
  const [meds, setMeds] = useState(() => row?.meds_taken ?? false);
  const [slip, setSlip] = useState(() => row?.salty_slip ?? false);
  const [veg, setVeg] = useState(() => row?.veg_servings ?? 0);
  const [water, setWater] = useState(() => row?.water_glasses ?? 0);
  const [notes, setNotes] = useState(() => row?.notes ?? "");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const phase = phaseFor(dateKey);
  const workout = workoutForDay(dateKey, phase.number);
  const index = phaseIndex(dateKey);

  const num = (value: string) => (value.trim() === "" ? null : Number(value));
  const trimmed = (value: string) => (value.trim() === "" ? null : value.trim());

  async function save() {
    await onSave({
      weight_kg: num(weight),
      walk_minutes: Number(walk || 0),
      sleep_hours: num(sleep),
      rice_cups: num(rice),
      breakfast: trimmed(breakfast),
      lunch: trimmed(lunch),
      dinner: trimmed(dinner),
      snacks: trimmed(snacks),
      strength_done: strength,
      meds_taken: meds,
      salty_slip: slip,
      veg_servings: veg,
      water_glasses: water,
      notes: trimmed(notes),
    });
    setSavedAt(new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }));
  }

  return (
    <div className="space-y-6">
      {/* ---------- what today is ---------- */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {formatDate(dateKey)} · Phase {phase.number}
        </p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight">{phase.title}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-3 py-1 text-xs">
            Walk: {phase.walkTarget}
          </span>
          <span className="rounded-full border border-border px-3 py-1 text-xs">
            {workout ? workout.name : "No strength today — rest or a gentle stretch"}
          </span>
        </div>

        {workout && (
          <div className="mt-4 rounded-lg border border-border bg-background/60 p-4">
            <p className="text-sm font-medium">{workout.name}</p>
            <ul className="mt-2.5 space-y-1.5">
              {workout.blocks
                .filter((block) => block.prescription[index] !== "—")
                .map((block) => {
                  const exercise = exercises.find((e) => e.id === block.exerciseId);
                  return (
                    <li key={block.exerciseId} className="flex justify-between gap-4 text-sm">
                      <span>{exercise?.name}</span>
                      <span
                        className="shrink-0 font-medium text-muted"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {block.prescription[index]}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </div>

      {/* ---------- the check-in ---------- */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold">Today&apos;s check-in</h3>
        <p className="mt-1 text-xs text-muted">
          Fill in what you have. Anything left blank is simply not recorded.
        </p>

        <div className="mt-5 space-y-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
              Weight, walking, sleep
            </p>
            <div className="grid grid-cols-3 gap-3">
              <NumberField
                label="Weight"
                value={weight}
                onChange={setWeight}
                suffix="kg"
                step="0.1"
                placeholder="120.0"
              />
              <NumberField label="Walked" value={walk} onChange={setWalk} suffix="min" placeholder="30" />
              <NumberField label="Slept" value={sleep} onChange={setSleep} suffix="hrs" step="0.5" placeholder="7" />
            </div>
            <p className="mt-2 text-xs text-muted">
              Weigh once a week, Sunday morning, after the toilet and before eating. Daily weighing
              measures water, not fat.
            </p>
          </div>

          {/* The food log. Free text on purpose — anything that needs a
              database lookup per item does not get filled in on a phone. */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
              What you ate
            </p>
            <div className="space-y-2.5">
              <MealField label="Breakfast" value={breakfast} onChange={setBreakfast} placeholder="2 eggs, 1 cup rice, kape" />
              <MealField label="Lunch" value={lunch} onChange={setLunch} placeholder="Inihaw na tilapia, kangkong, 1 cup rice" />
              <MealField label="Dinner" value={dinner} onChange={setDinner} placeholder="Monggo with malunggay, 1 cup rice" />
              <MealField label="Snacks" value={snacks} onChange={setSnacks} placeholder="Saba, peanuts" />
            </div>
            <div className="mt-3 max-w-[10rem]">
              <NumberField
                label="Rice today"
                value={rice}
                onChange={setRice}
                suffix="cups"
                step="0.5"
                placeholder="3"
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Write it plainly — no counting, no weighing. The point is that a bad week is
              explainable afterwards instead of a mystery.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Counter label="Vegetable servings" value={veg} onChange={setVeg} max={20} hint="Aim for 4–5" />
            <Counter label="Glasses of water" value={water} onChange={setWater} max={30} hint="Aim for 8" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle label="Took Veztenor" detail="Same time every day" checked={meds} onChange={setMeds} />
            <Toggle label="Did the strength work" detail={workout?.name ?? "Any session counts"} checked={strength} onChange={setStrength} />
            <Toggle
              label="Salty slip"
              detail="Noodles, canned meat, tuyo, cubes"
              checked={slip}
              onChange={setSlip}
            />
          </div>

          <label className="block">
            <span className="text-xs font-medium text-muted">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Knee felt fine. Walked before the rain. Swollen ankles again."
              // text-base, not text-sm: iOS Safari zooms the whole page when
              // you focus an input smaller than 16px, and never zooms back.
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base outline-none focus:border-foreground/40"
            />
          </label>

          {/* Sticks to the bottom of the screen on a phone, so you never have
              to scroll back up past the whole form to save. */}
          <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-4 border-t border-border bg-card/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="min-h-12 flex-1 rounded-lg bg-accent px-6 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-50 sm:flex-none"
            >
              {saving ? "Saving…" : "Save today"}
            </button>
            {savedAt && <span className="text-xs text-muted">Saved at {savedAt}</span>}
          </div>
        </div>
      </div>

      {/* ---------- the shape of the day ---------- */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold">The shape of the day</h3>
        <ol className="mt-4 space-y-3">
          {dailyRhythm.map((entry) => (
            <li key={entry.time} className="flex gap-4">
              <span className="w-28 shrink-0 font-mono text-[11px] uppercase tracking-wider text-muted">
                {entry.time}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{entry.what}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">{entry.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
