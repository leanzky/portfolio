import type { Metadata, Viewport } from "next";
import { HealthRoot } from "@/components/health/HealthRoot";

// Used daily on a phone and worth adding to the home screen, so the browser
// chrome should match the page rather than flashing white.
export const viewport: Viewport = {
  themeColor: "#d9d3c5",
};

export const metadata: Metadata = {
  title: "Another Chance of Health | Health Tracker",
  description: "Private health log and 12-week plan.",
  // Personal health data — never in search results.
  robots: { index: false, follow: false },
};

export default function HealthPage() {
  return <HealthRoot />;
}
