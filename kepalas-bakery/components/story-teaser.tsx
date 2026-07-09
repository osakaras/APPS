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
              src="/images/artisanalu.jpg"
              alt="Kepalas Bakery kepinių stalas — bobos, babkos ir tortai"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-4 rounded-3xl bg-caramel-500 px-6 py-5 text-sand-50 shadow-warm sm:-right-8">
            <p className="font-display text-3xl font-semibold">Nuo 2019</p>
            <p className="text-sm text-sand-100/90">kepame Vilniui</p>
          </div>
        </motion.div>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-600">
              Mūsų istorija
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-brown-900 sm:text-5xl">
              Viskas prasidėjo nuo{" "}
              <span className="text-caramel-600">senelės recepto</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 text-lg leading-relaxed text-brown-600">
              Vienas sąsiuvinis, ranka rašyti receptai ir kvapas, kurio
              neįmanoma pamiršti. Iš mažos virtuvės Užupyje išaugome į kepyklą,
              bet receptų sąsiuvinis liko tas pats — tik dabar juo dalijamės su
              visu miestu.
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <blockquote className="mt-6 border-l-4 border-caramel-500 pl-5 font-display text-xl italic leading-relaxed text-brown-700">
              „Duona nemėgsta skubančių rankų. Ji mėgsta kantrias.“
              <footer className="mt-2 text-sm not-italic text-brown-500">
                — Ona, mūsų senelė ir pirmoji kepėja
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
