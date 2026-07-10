"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { ButtonColorful } from "@/components/ui/button-colorful";

const gallery = [
  {
    src: "/images/apie/suktinukai.jpg",
    alt: "KEPALAS kepėjas prie ką tik suformuotų suktinukų",
  },
  {
    src: "/images/apie/sokoladine-tesla.jpg",
    alt: "Tešla su šokolado įdaru kočiojama rankomis",
  },
  {
    src: "/images/apie/bandeles.jpg",
    alt: "Padėklas šviežiai suformuotų bandelių",
  },
  {
    src: "/images/apie/formavimas.jpg",
    alt: "Rankomis formuojamas kepalas",
  },
  {
    src: "/images/apie/pintines.jpg",
    alt: "Tešla dedama į kildinimo pintines",
  },
  {
    src: "/images/apie/rugine-duona.jpg",
    alt: "Ruginės duonos formos, pabarstytos miltais",
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
              Apie mus
            </p>
          </Reveal>
          <Reveal onLoad delay={0.12}>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-brown-900 sm:text-6xl">
              Skoniai, kurie artimi{" "}
              <span className="text-caramel-600">jūsų namams</span>
            </h1>
          </Reveal>
          <Reveal onLoad delay={0.24}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brown-600">
              „KEPALAS“ – tai daugiau nei tiesiog kepykla. Tai vieta, kurioje
              kasdien gimsta šviežumas ir kokybė, skirta tiems, kurie vertina
              natūralų skonį ir nuoširdų požiūrį į maistą.
            </p>
          </Reveal>
        </div>
      </section>

      {/* APIE MUS — opening narrative with founders photo */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_0.85fr]">
          <Reveal>
            <div className="space-y-6 text-lg leading-relaxed text-brown-700">
              <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:font-semibold first-letter:leading-[0.85] first-letter:text-caramel-600">
                Mūsų tikslas – sujungti modernias kepimo technologijas su
                šiltais, namų jaukumu alsuojančiais kepiniais, kurie skatina
                dalintis ir mėgautis kiekvienu kąsniu.
              </p>
              <p>
                Ši idėja gimė iš mūsų šeimos noro kurti kažką prasmingo ir
                skanaus, kažką, kuo galėtume didžiuotis ir kuo galėtų džiaugtis
                aplinkiniai. „KEPALAS“ nėra tiesiog verslas – tai mūsų šeimos
                istorija, kurioje kiekvienas kepinys turi savo vietą. Viskas
                prasidėjo, kai nusprendėme sujungti savo aistrą kepimui su noru
                atnešti šiek tiek laimės ir gardžių akimirkų į mūsų
                kaimynystę.
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
                src="/images/apie/seima.jpg"
                alt="„KEPALAS“ įkūrėjai kepykloje su glėbiu šviežios duonos"
                fill
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-center text-sm italic text-brown-500">
              Mūsų šeima — „KEPALAS“ pradžia ir širdis
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
                „KEPALAS“ nėra tiesiog verslas – tai mūsų{" "}
                <span className="text-caramel-400">šeimos istorija</span>,
                kurioje kiekvienas kepinys turi savo vietą.“
              </blockquote>
              <figcaption className="relative mt-6 text-sm uppercase tracking-[0.2em] text-sand-300/70">
                KEPALAS Bakery · šeimos kepykla Vilniuje
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Craftsmanship — oven photo */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.21, 0.65, 0.35, 1] }}
            className="order-2 lg:order-1"
          >
            <div className="relative aspect-[3/2] overflow-hidden rounded-[2.5rem] shadow-warm-lg">
              <Image
                src="/images/apie/krosnis.jpg"
                alt="Kepėjas atidžiai prižiūri duonos kepalus krosnyje"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-600">
                Rankų darbo meistrystė
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-brown-900 sm:text-5xl">
                Dėmesys <span className="text-caramel-600">kiekvienam</span>{" "}
                kąsniui
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 text-lg leading-relaxed text-brown-600">
                Kiekvienas mūsų gaminys yra sukurtas su didžiausiu dėmesiu
                kokybei. Naudojame tik aukščiausios rūšies produktus, atsargiai
                atrinktus tiekėjus ir tradicinius, rankų darbo metodus.
                „KEPALAS“ nėra fabrikas – tai rankų darbo meistrystės ir meilės
                derinys, kuris atsispindi kiekviename kąsnyje.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Community — Justiniškės */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-600">
                Mūsų bendruomenė
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-brown-900 sm:text-5xl">
                Justiniškių <span className="text-caramel-600">širdyje</span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-5 text-lg leading-relaxed text-brown-600">
                Įsikūrę Justiniškėse, mes didžiuojamės būdami dalimi šios gyvos
                ir įvairios bendruomenės. Mūsų kepyklos durys visada atviros
                vietiniams gyventojams – ir jaunam, ir senam. Kiekvieną dieną
                siekiame sukurti vietą, kurioje žmonės galėtų susitikti,
                bendrauti ir mėgautis gardžiais kepiniais, kurie suartina.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <p className="mt-5 text-lg leading-relaxed text-brown-600">
                Mūsų asortimente rasite visko – nuo šviežiai keptos sourdough
                duonos iki įvairiausių saldžių kepinių. Tačiau mes nesustojame
                ties vienu receptu – nuolat eksperimentuojame ir ieškome naujų
                skonių, kad kiekvienas apsilankymas būtų nauja, gardi patirtis.
                „KEPALAS“ yra vieta, kurioje tradicija susitinka su
                kūrybiškumu, o kiekvienas kepinys yra unikalus.
              </p>
            </Reveal>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.21, 0.65, 0.35, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-warm-lg">
              <Image
                src="/images/apie/bendruomene.jpg"
                alt="Kaimynystės gyventojos prie „KEPALAS“ kepyklos prekystalio"
                fill
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-center text-sm italic text-brown-500">
              Kepyklos durys visada atviros — ir jaunam, ir senam
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sweet side — cheesecake banner */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[2.5rem] shadow-warm-lg sm:aspect-[21/9]">
              <Image
                src="/images/apie/surio-pyragas.jpg"
                alt="Sūrio pyrago gabalėliai puošiami avietėmis"
                fill
                sizes="90vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brown-900/70 via-transparent to-transparent" />
              <p className="absolute bottom-6 left-8 max-w-md font-display text-2xl font-semibold text-sand-50 sm:text-3xl">
                Nuo raugo duonos iki saldžių kepinių
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="grain relative overflow-hidden bg-sand-200/70 py-20 sm:py-28">
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-600">
              Užkulisiai
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-brown-900 sm:text-5xl">
              Akimirkos iš mūsų{" "}
              <span className="text-caramel-600">kepyklos</span>
            </h2>
          </Reveal>

          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((photo) => (
              <StaggerItem key={photo.src} className="group">
                <div className="relative aspect-[3/2] overflow-hidden rounded-3xl shadow-warm">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
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
              Užsukite pas mus į Taikos g. 104, Vilniuje — kepyklos durys
              atviros trečiadieniais–penktadieniais 9–17 val., savaitgaliais
              9–16 val.
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
