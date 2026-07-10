"use client";

import { Flame, HandHeart, Sparkles, Wheat } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";

const values = [
  {
    icon: Wheat,
    title: "Aukščiausios rūšies produktai",
    text: "Naudojame tik atsargiai atrinktų tiekėjų produktus — natūralų skonį girdite kiekviename kąsnyje.",
  },
  {
    icon: HandHeart,
    title: "Rankų darbo metodai",
    text: "„KEPALAS“ nėra fabrikas — tai tradicinių metodų ir rankų darbo meistrystės derinys.",
  },
  {
    icon: Flame,
    title: "Šviežia kiekvieną dieną",
    text: "Kepiniai gimsta kasdien mūsų kepykloje Justiniškėse — nuo raugo duonos iki desertų.",
  },
  {
    icon: Sparkles,
    title: "Tradicija ir kūrybiškumas",
    text: "Nesustojame ties vienu receptu — nuolat eksperimentuojame ir ieškome naujų skonių.",
  },
];

export function Craft() {
  return (
    <section className="grain relative overflow-hidden bg-sand-200/70 py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/3 h-[26rem] w-[26rem] rounded-full bg-caramel-400/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-600">
            Kodėl KEPALAS?
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-brown-900 sm:text-5xl">
            Amatas, kurio <span className="text-caramel-600">neskubiname</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-brown-600">
            Geri kepiniai neturi paslapčių — tik kokybiškus produktus,
            nuoširdų požiūrį į maistą ir laiką, kurio negailime.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <StaggerItem key={value.title}>
              <div className="group h-full rounded-3xl bg-sand-50 p-7 shadow-warm transition-all duration-500 hover:-translate-y-1.5 hover:bg-brown-900">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-caramel-500/15 text-caramel-600 transition-colors duration-500 group-hover:bg-caramel-500 group-hover:text-sand-50">
                  <value.icon size={22} />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-brown-900 transition-colors duration-500 group-hover:text-sand-50">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brown-500 transition-colors duration-500 group-hover:text-sand-300">
                  {value.text}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
