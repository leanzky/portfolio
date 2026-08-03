import type { Metadata } from "next";
import { WordBlitzGame } from "@/components/scrabble-slam/WordBlitzGame";

export const metadata: Metadata = {
  title: "Scrabble Slam! | Leandro Francia",
  description:
    "A fast-paced solo word game: change one letter of the central word at a time to empty your hand before the clock runs out.",
};

export default function ScrabbleSlamPage() {
  return <WordBlitzGame />;
}
