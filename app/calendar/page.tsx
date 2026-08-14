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

  // Only this page is installable. The manifest's scope is /calendar, so the
  // portfolio around it stays an ordinary website and the home-screen icon
  // opens straight into the tracker.
  manifest: "/health.webmanifest",
  icons: {
    icon: [{ url: "/health/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/health/icon-512.png", sizes: "512x512", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Health",
  },
};

export default function HealthPage() {
  return <HealthRoot />;
}
