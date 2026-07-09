"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { ButtonColorful } from "@/components/ui/button-colorful";

const timeline = [
  {
    year: "2017",
    title: "Sąsiuvinis iš palėpės",
    text: "Tvarkydami senelės Onos namus Anykščiuose, radome ranka rašytų receptų sąsiuvinį — su miltų dulkėmis tarp puslapių ir pastabomis paraštėse: „tešlai reikia ramybės“. Tą žiemą iškepėme pirmą babką pagal jos receptą.",
  },
  {
    year: "2018",
    title: "Virtuvė Užupyje",
    text: "Iš pradžių kepėme tik draugams. Paskui — draugų draugams. Kai kaimynai ėmė belstis klausdami, „kas čia taip kvepia“, supratome, kad iš virtuvės jau išaugome.",
  },
  {
    year: "2019",
    title: "Gimsta „Kepalas“",
    text: "Pylimo gatvėje atidarėme pirmąją tikrą kepyklą su akmenine krosnimi. Pavadinimas atėjo savaime — juk viskas čia sukasi apie vieną gerą kepalą. Užraugėme raugą, kuris gyvas iki šiol.",
  },
  {
    year: "2022",
    title: "Miestas mus priėmė",
    text: "Prie duonos prisijungė bobos, babkos ir šventiniai užsakymai. Prieš Kalėdas kepėme naktimis — ir vis tiek eilė nusidriekdavo iki kampo. Išmokome vieną dalyką: niekada nedidinti tempo tešlos sąskaita.",
  },
  {
    year: "Šiandien",
    title: "Tas pats sąsiuvinis",
    text: "Mūsų komandoje — aštuoni kepėjai, o krosnys įsijungia 4:30 ryto. Bet kiekvienas receptas vis dar prasideda nuo to paties sąsiuvinio puslapių. Ir nuo klausimo: ar senelė Ona tuo didžiuotųsi?",
  },
];

const principles = [
  {
    number: "01",
    title: "Laikas — ingredientas",
    text: "Raugui — 48 valandos. Bobos tešlai — trys kildinimai. Skubanti duona visada išduoda save skoniu.",
  },
  {
    number: "02",
    title: "Trumpa sudėtis",
    text: "Jei ingrediento nerastumėte savo virtuvėje — jo nebus ir mūsų kepiniuose. Miltai, vanduo, druska, sviestas, kiaušiniai. Tiek.",
  },
  {
    number: "03",
    title: "Kaimynystė",
    text: "Likusią dienos duoną kas vakarą atiduodame bendruomenės valgyklai. Duona kepama dalintis — taip mus mokė.",
  },
];

export function StoryContent() {
  return (
    <>
      {/* Page hero */}
      <section className="grain relative overflow-hidden pb-16 pt-36 sm:pt-44">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-caramel-400/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <Reveal onLoad>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-600">
              Mūsų istorija
            </p>
          </Reveal>
          <Reveal onLoad delay={0.12}>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-brown-900 sm:text-6xl">
              Trys kartos, vienas raugas ir{" "}
              <span className="text-caramel-600">daug kantrybės</span>
            </h1>
          </Reveal>
          <Reveal onLoad delay={0.24}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brown-600">
              Kepalas Bakery gimė ne iš verslo plano, o iš seno receptų
              sąsiuvinio. Čia — visa mūsų kelionė nuo palėpės Anykščiuose iki
              kepyklos Pylimo gatvėje.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Opening narrative with drop cap + image */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_0.85fr]">
          <Reveal>
            <div className="space-y-6 text-lg leading-relaxed text-brown-700">
              <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:font-semibold first-letter:leading-[0.85] first-letter:text-caramel-600">
                Viskas prasidėjo nuo kvapo. Kas vasarą, atvažiavus pas senelę
                Oną į Anykščius, mus pasitikdavo tas pats ritualas: penktadienio
                vakarą ji užmaišydavo tešlą, o šeštadienio rytą visas namas
                kvepėdavo šiltu kepalu. Duonos riekė su sviestu ir medumi buvo
                pirmoji ir svarbiausia dienos pamoka.
              </p>
              <p>
                Senelė niekada nesinaudojo svarstyklėmis. „Ranka žino“, —
                sakydavo ji, minkydama tešlą prie lango. Tik po daugelio metų,
                radę jos sąsiuvinį, supratome, kad už to „ranka žino“ slypėjo
                dešimtmečiai tikslių, kruopščiai tobulintų proporcijų —
                surašytų pieštuku, ištrintų ir vėl perrašytų.
              </p>
              <p>
                Tas sąsiuvinis šiandien guli mūsų kepykloje, stiklinėje
                vitrinoje prie krosnies. Ne kaip muziejaus eksponatas — juo vis
                dar naudojamės. Kiekviena babka, kurią išsinešate, prasideda
                nuo jo puslapių.
              </p>
            </div>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.21, 0.65, 0.35, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-warm-lg">
              <Image
                src="/images/babka-winter.jpg"
                alt="Aguoninė babka pagal senelės Onos receptą"
                fill
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-center text-sm italic text-brown-500">
              Aguoninė babka — pirmasis receptas iš senelės sąsiuvinio
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Reveal>
            <figure className="grain relative overflow-hidden rounded-[2.5rem] bg-brown-900 px-8 py-14 text-center sm:px-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-caramel-500/25 blur-3xl"
              />
              <blockquote className="relative font-display text-3xl font-medium italic leading-snug text-sand-100 sm:text-4xl">
                „Duona nemėgsta skubančių rankų.
                <br />
                Ji mėgsta <span className="text-caramel-400">kantrias</span>.“
              </blockquote>
              <figcaption className="relative mt-6 text-sm uppercase tracking-[0.2em] text-sand-300/70">
                Ona · 1934–2016 · pirmoji mūsų kepėja
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Reveal className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-600">
              Kelionė
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-brown-900 sm:text-5xl">
              Nuo palėpės iki Pylimo gatvės
            </h2>
          </Reveal>

          <div className="relative mt-16">
            <div
              aria-hidden
              className="absolute bottom-0 left-[1.05rem] top-0 w-px bg-gradient-to-b from-caramel-400 via-caramel-500/40 to-transparent sm:left-1/2"
            />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.7,
                    ease: [0.21, 0.65, 0.35, 1],
                  }}
                  className={`relative flex gap-6 pl-12 sm:w-1/2 sm:pl-0 ${
                    i % 2 === 0
                      ? "sm:mr-auto sm:pr-12 sm:text-right"
                      : "sm:ml-auto sm:pl-12"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute top-1 grid h-9 w-9 place-items-center rounded-full border-2 border-caramel-500 bg-sand-100 left-0 ${
                      i % 2 === 0
                        ? "sm:left-auto sm:-right-[1.125rem]"
                        : "sm:-left-[1.125rem]"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-caramel-500" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-caramel-600">
                      {item.year}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-brown-900">
                      {item.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-brown-600">
                      {item.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="grain relative overflow-hidden bg-sand-200/70 py-20 sm:py-28">
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-600">
              Kuo tikime
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-brown-900 sm:text-5xl">
              Trys taisyklės, kurių <br className="hidden sm:block" />
              <span className="text-caramel-600">niekada nelaužome</span>
            </h2>
          </Reveal>

          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {principles.map((principle) => (
              <StaggerItem key={principle.number}>
                <div className="h-full rounded-3xl bg-sand-50 p-8 shadow-warm transition-transform duration-500 hover:-translate-y-1.5">
                  <p className="font-display text-5xl font-semibold text-caramel-500/40">
                    {principle.number}
                  </p>
                  <h3 className="mt-4 font-display text-xl font-semibold text-brown-900">
                    {principle.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-brown-600">
                    {principle.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-24 text-center sm:py-28">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <Reveal>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-brown-900 sm:text-5xl">
              Istorijos skaniausia dalis —{" "}
              <span className="text-caramel-600">paragauti</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-brown-600">
              Užsukite į Pylimo g. 21 arba užsisakykite kepinius rytojaus
              rytui. Sąsiuvinio receptai laukia jūsų stalo.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/#kepiniai">
                <ButtonColorful
                  label="Peržiūrėti kepinius"
                  className="h-12 px-8 text-base"
                />
              </Link>
              <Link
                href="/#kontaktai"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-brown-800 transition-colors hover:text-caramel-600"
              >
                Susisiekti
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
