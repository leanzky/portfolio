import type { Metadata } from "next";
import { MealCalendarApp } from "@/components/meal-calendar/MealCalendarApp";

export const metadata: Metadata = {
  title: "Meal Calendar | Leandro Francia",
  description: "A personal calendar for logging how much you ate each day.",
};

export default function CalendarPage() {
  return <MealCalendarApp />;
}
