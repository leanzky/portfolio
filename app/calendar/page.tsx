import type { Metadata } from "next";
import { HealthRoot } from "@/components/health/HealthRoot";

export const metadata: Metadata = {
  title: "Blood pressure & weight | Leandro Francia",
  description: "Private health log and 12-week plan.",
  // Personal health data — never in search results.
  robots: { index: false, follow: false },
};

export default function HealthPage() {
  return <HealthRoot />;
}
