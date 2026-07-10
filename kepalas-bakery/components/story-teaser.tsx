"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "@/components/reveal";
import { ButtonColorful } from "@/components/ui/button-colorful";

export function StoryTeaser() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.21, 0.65, 0.35, 1] }}
          className="relative order-2 lg:order-1"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-warm-lg sm:aspect-square lg:aspect-[4/5]">
            <Image
              src="/images/apie/seima.jpg"
              alt="„KEPALAS“ įkūrėjai kepykloje su glėbiu šviežios duonos"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-4 rounded-3xl bg-caramel-500 px-6 py-5 text-sand-50 shadow-warm sm:-right-8">
            <p className="font-display text-3xl font-semibold">Justiniškės</p>
            <p className="text-sm text-sand-100/90">Taikos g. 104, Vilnius</p>
          </div>
        </motion.div>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-600">
              Apie mus
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-brown-900 sm:text-5xl">
              Daugiau nei kepykla —{" "}
              <span className="text-caramel-600">šeimos istorija</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 text-lg leading-relaxed text-brown-600">
              Ši idėja gimė iš mūsų šeimos noro kurti kažką prasmingo ir
              skanaus — kažką, kuo galėtume didžiuotis ir kuo galėtų džiaugtis
              aplinkiniai. Viskas prasidėjo, kai nusprendėme sujungti savo
              aistrą kepimui su noru atnešti šiek tiek laimės ir gardžių
              akimirkų į mūsų kaimynystę.
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <blockquote className="mt-6 border-l-4 border-caramel-500 pl-5 font-display text-xl italic leading-relaxed text-brown-700">
              „KEPALAS“ nėra tiesiog verslas – tai mūsų šeimos istorija,
              kurioje kiekvienas kepinys turi savo vietą.“
              <footer className="mt-2 text-sm not-italic text-brown-500">
                — KEPALAS šeima
              </footer>
            </blockquote>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="mt-8">
              <Link href="/istorija">
                <ButtonColorful
                  label="Skaityti visą istoriją"
                  className="h-12 px-7 text-base"
                />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
