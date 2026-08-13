import type { Metadata } from "next";
import { GameshowsRoot } from "@/components/gameshows/GameshowsRoot";
import { gameshowsMeta } from "@/data/gameshows";

export const metadata: Metadata = {
  title: `${gameshowsMeta.title} | Leandro Francia`,
  description: gameshowsMeta.description,
  // A passphrase page has no business in search results.
  robots: { index: false, follow: false },
};

export default function GameshowsPage() {
  return <GameshowsRoot />;
}
