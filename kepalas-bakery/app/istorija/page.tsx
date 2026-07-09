import type { Metadata } from "next";
import { StoryContent } from "@/components/story-content";

export const metadata: Metadata = {
  title: "Mūsų istorija",
  description:
    "Kepalas Bakery istorija — nuo senelės Onos receptų sąsiuvinio Anykščiuose iki amatininkų kepyklos Pylimo gatvėje Vilniuje.",
};

export default function IstorijaPage() {
  return <StoryContent />;
}
