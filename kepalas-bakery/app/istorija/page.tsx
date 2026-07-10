import type { Metadata } from "next";
import { StoryContent } from "@/components/story-content";

export const metadata: Metadata = {
  title: "Apie mus",
  description:
    "„KEPALAS“ – šeimos kepykla Justiniškėse, Vilniuje. Skoniai, kurie artimi jūsų namams: sourdough duona, saldūs kepiniai ir nuoširdus požiūris į maistą.",
};

export default function IstorijaPage() {
  return <StoryContent />;
}
