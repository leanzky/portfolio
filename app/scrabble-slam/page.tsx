import type { Metadata } from "next";
import { ScrabbleSlamApp } from "@/components/scrabble-slam/ScrabbleSlamApp";

export const metadata: Metadata = {
  title: "Scrabble Slam! | Leandro Francia",
  description:
    "A fast-paced word game: change one letter of the central word at a time to empty your hand before the clock runs out. Play solo or race a friend live.",
};

export default function ScrabbleSlamPage() {
  return <ScrabbleSlamApp />;
}
