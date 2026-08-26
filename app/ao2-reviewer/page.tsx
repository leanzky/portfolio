import type { Metadata } from "next";
import { AO2Reviewer } from "@/components/ao2/AO2Reviewer";

export const metadata: Metadata = {
  title: "AO II Reviewer | Leandro Francia",
  description:
    "A personal study aid for the DepEd Administrative Officer II assessment: duties, scoring, templates, laws, and a hiring/promotion/leave reference.",
  // Personal exam prep, not a public search result.
  robots: { index: false, follow: false },
};

export default function AO2ReviewerPage() {
  return <AO2Reviewer />;
}
