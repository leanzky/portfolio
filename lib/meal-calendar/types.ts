export type MealCategory =
  | "1_meal"
  | "2_meals"
  | "3_meals"
  | "4_meals"
  | "excessive";

export const MEAL_CATEGORIES: {
  id: MealCategory;
  label: string;
  shortLabel: string;
  colorClass: string; // background color for the calendar day dot
}[] = [
  { id: "1_meal", label: "1 Meal", shortLabel: "1", colorClass: "bg-emerald-400" },
  { id: "2_meals", label: "2 Meals", shortLabel: "2", colorClass: "bg-lime-400" },
  { id: "3_meals", label: "3 Meals", shortLabel: "3", colorClass: "bg-amber-400" },
  { id: "4_meals", label: "4 Meals", shortLabel: "4", colorClass: "bg-orange-500" },
  { id: "excessive", label: "Excessive Eating", shortLabel: "!!", colorClass: "bg-rose-500" },
];

export type MealLogRow = {
  id: string;
  user_id: string;
  log_date: string; // "YYYY-MM-DD"
  category: MealCategory;
  created_at: string;
  updated_at: string;
};
