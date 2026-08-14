import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        // Next's static handler does not know this extension, and Chrome and
        // Firefox both want a manifest served as JSON before they will offer
        // "Install" rather than a plain bookmark.
        source: "/health.webmanifest",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
    ];
  },
};

export default nextConfig;
