"use client";

import Link from "next/link";
import { Clock, Mail, MapPin } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ButtonColorful } from "@/components/ui/button-colorful";

const details = [
  {
    icon: MapPin,
    title: "Adresas",
    lines: ["Taikos g. 104, Vilnius"],
  },
  {
    icon: Clock,
    title: "Darbo laikas",
    lines: ["III–V 9:00–17:00", "VI–VII 9:00–16:00", "I–II nedirbame"],
  },
  {
    icon: Mail,
    title: "Užsakymai",
    lines: ["kepalasbakery@gmail.com"],
  },
];

export function ContactCta() {
  return (
    <section
      id="kontaktai"
      className="grain relative scroll-mt-24 overflow-hidden bg-brown-900 py-24 text-sand-100 sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full bg-caramel-500/20 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-400">
            Užsakymai
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-sand-50 sm:text-5xl">
            Gardžios akimirkos prasideda{" "}
            <span className="text-caramel-400">čia</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-sand-300">
            Parašykite mums dėl užsakymo arba tiesiog užsukite į kepyklą
            Justiniškėse. Didesniems užsakymams ir šventėms kepame pagal
            individualius pageidavimus.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a href="mailto:kepalasbakery@gmail.com">
              <ButtonColorful
                label="Užsakyti el. paštu"
                className="h-12 px-8 text-base"
              />
            </a>
            <a
              href="https://maps.google.com/?q=Taikos+g.+104,+Vilnius"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 items-center gap-2 rounded-full border border-sand-100/25 px-7 text-sm font-semibold text-sand-100 transition-colors hover:border-caramel-400 hover:text-caramel-400"
            >
              <MapPin size={16} />
              Kaip mus rasti
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mx-auto mt-16 grid max-w-4xl gap-6 text-left sm:grid-cols-3">
            {details.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-sand-100/10 bg-sand-50/5 p-6 backdrop-blur transition-colors duration-500 hover:border-caramel-400/40"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-caramel-500/20 text-caramel-400">
                  <item.icon size={20} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-sand-50">
                  {item.title}
                </h3>
                {item.lines.map((line) => (
                  <p key={line} className="mt-1 text-sm text-sand-300">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.35}>
          <p className="mt-12 text-sm text-sand-300/70">
            Norite sužinoti, kas slypi už mūsų kepinių?{" "}
            <Link
              href="/istorija"
              className="font-semibold text-caramel-400 underline-offset-4 transition-colors hover:text-caramel-300 hover:underline"
            >
              Skaitykite apie mus →
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
