import type { Metadata, Viewport } from "next";
import { AO2Reviewer } from "@/components/ao2/AO2Reviewer";

export const viewport: Viewport = {
  themeColor: "#1f3864",
};

export const metadata: Metadata = {
  title: "AO II Reviewer | Leandro Francia",
  description:
    "A personal study aid for the DepEd Administrative Officer II assessment: duties, scoring, templates, laws, and a hiring/promotion/leave reference.",
  // Personal exam prep, not a public search result.
  robots: { index: false, follow: false },
  // Installable and usable offline: the manifest is scoped to this route and
  // /ao2-sw.js keeps a saved copy, so the rest of the portfolio is untouched.
  manifest: "/ao2.webmanifest",
  icons: {
    icon: [{ url: "/ao2/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/ao2/icon-512.png", sizes: "512x512", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "AO II" },
};

export default function AO2ReviewerPage() {
  return <AO2Reviewer />;
}
