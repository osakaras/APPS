import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Products } from "@/components/products";
import { Craft } from "@/components/craft";
import { StoryTeaser } from "@/components/story-teaser";
import { ContactCta } from "@/components/contact-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Products />
      <Craft />
      <StoryTeaser />
      <ContactCta />
    </>
  );
}
