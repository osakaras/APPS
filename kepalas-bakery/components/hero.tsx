"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, Star } from "lucide-react";
import { ButtonColorful } from "@/components/ui/button-colorful";
import { Reveal } from "@/components/reveal";

const stats = [
  { value: "100%", label: "šeimos kepykla" },
  { value: "15+", label: "rūšių kepinių" },
  { value: "III–VII", label: "šviežia iš krosnies" },
];

export function Hero() {
  return (
    <section className="grain relative overflow-hidden pb-20 pt-32 sm:pt-40">
      {/* Warm ambient glows — caramel on sand, nothing cold */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-caramel-400/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] left-[-12%] h-[28rem] w-[28rem] rounded-full bg-sand-300/60 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal onLoad delay={0.05}>
            <p className="inline-flex items-center gap-2 rounded-full border border-caramel-500/30 bg-sand-50/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-caramel-700">
              <span className="h-1.5 w-1.5 rounded-full bg-caramel-500" />
              Amatininkų kepykla · Vilnius
            </p>
          </Reveal>

          <Reveal onLoad delay={0.15}>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-brown-900 sm:text-6xl lg:text-7xl">
              Duona, kuri
              <br />
              kvepia{" "}
              <span className="relative inline-block text-caramel-600">
                namais
                <svg
                  aria-hidden
                  viewBox="0 0 220 12"
                  className="absolute -bottom-1 left-0 w-full text-caramel-400"
                  fill="none"
                >
                  <path
                    d="M3 9C60 3 150 3 217 7"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal onLoad delay={0.28}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brown-600">
              Šeimos kepykloje Justiniškėse kasdien gimsta sourdough duona,
              suktinukai ir saldūs kepiniai. Tik aukščiausios kokybės
              produktai, tradiciniai metodai ir rankų darbas — jokių
              kompromisų.
            </p>
          </Reveal>

          <Reveal onLoad delay={0.4}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/#kepiniai">
                <ButtonColorful
                  label="Užsakyti kepinius"
                  className="h-12 px-7 text-base"
                />
              </Link>
              <Link
                href="/istorija"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-brown-800 transition-colors hover:text-caramel-600"
              >
                Apie mus
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </Reveal>

          <Reveal onLoad delay={0.52}>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-brown-800/10 pt-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-2xl font-semibold text-brown-900 sm:text-3xl">
                    {stat.value}
                  </dd>
                  <dd className="mt-1 text-xs leading-snug text-brown-500">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Hero image with floating badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.21, 0.65, 0.35, 1] }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-warm-lg">
            <Image
              src="/images/babka-round.jpg"
              alt="Šokoladinė babka ant sidabrinio padėklo"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-brown-900/10" />
          </div>

          <motion.div
            className="absolute -left-4 top-10 rounded-2xl bg-sand-50/95 px-4 py-3 shadow-warm backdrop-blur sm:-left-8"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-2 text-caramel-500">
              <Star size={14} fill="currentColor" strokeWidth={0} />
              <p className="text-xs font-semibold uppercase tracking-wider text-caramel-700">
                Šeimos kepykla
              </p>
            </div>
            <p className="mt-1 text-xs font-semibold text-brown-800">
              Justiniškės, Vilnius
            </p>
          </motion.div>

          <motion.div
            className="absolute -right-3 bottom-12 rounded-2xl bg-brown-900/95 px-4 py-3 text-sand-100 shadow-warm backdrop-blur sm:-right-6"
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <p className="font-display text-lg font-semibold text-caramel-400">
              Šviežia kasdien
            </p>
            <p className="text-xs text-sand-300">Taikos g. 104, Vilnius</p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="mt-16 flex justify-center"
      >
        <Link
          href="/#kepiniai"
          aria-label="Slinkti prie kepinių"
          className="grid h-11 w-11 animate-float-slow place-items-center rounded-full border border-brown-800/15 text-brown-600 transition-colors hover:border-caramel-500 hover:text-caramel-600"
        >
          <ArrowDown size={18} />
        </Link>
      </motion.div>
    </section>
  );
}
