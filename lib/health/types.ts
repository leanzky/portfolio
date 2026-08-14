/** One check-in row per day. Everything except the date is optional — a day
    with only a walk logged is still a logged day. */
export type HealthDayRow = {
  id: string;
  user_id: string;
  log_date: string; // "YYYY-MM-DD"
  weight_kg: number | null;

  /** The five daily habits the program actually turns on. */
  walk_minutes: number;
  strength_done: boolean;
  meds_taken: boolean;
  veg_servings: number;
  water_glasses: number;

  /** What was actually eaten, in plain words. */
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  snacks: string | null;
  rice_cups: number | null;

  /** Honesty fields. Not failures — signal. */
  salty_slip: boolean;
  sleep_hours: number | null;
  notes: string | null;

  created_at: string;
  updated_at: string;
};

/** The fields a check-in form may write. */
export type HealthDayInput = Partial<
  Pick<
    HealthDayRow,
    | "weight_kg"
    | "walk_minutes"
    | "strength_done"
    | "meds_taken"
    | "veg_servings"
    | "water_glasses"
    | "breakfast"
    | "lunch"
    | "dinner"
    | "snacks"
    | "rice_cups"
    | "salty_slip"
    | "sleep_hours"
    | "notes"
  >
>;

/** Front and side only — a back photo needs a second pair of hands, and
    that friction is why it never gets taken. */
export type Pose = "front" | "side";

export type ProgressPhotoRow = {
  id: string;
  user_id: string;
  taken_on: string;
  storage_path: string;
  weight_kg: number | null;
  pose: Pose;
  note: string | null;
  created_at: string;
};

/** A photo row plus a short-lived signed URL to actually display it. */
export type ProgressPhoto = ProgressPhotoRow & { url: string | null };

export const POSES: { id: Pose; label: string; hint: string }[] = [
  { id: "front", label: "Front", hint: "Facing the camera, arms relaxed at your sides." },
  { id: "side", label: "Side", hint: "Turned ninety degrees, arms hanging naturally." },
];
