"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { ButtonColorful } from "@/components/ui/button-colorful";

const products = [
  {
    name: "Šokoladinė babka",
    description:
      "Sluoksniuota mielinė tešla, susipynusi su tirpstančiu belgišku šokoladu.",
    price: "16 €",
    image: "/images/babka-round.jpg",
    tag: "Bestseleris",
  },
  {
    name: "Aguoninė babka",
    description:
      "Tradicinis pynės kepalas su gausiu naminiu aguonų įdaru ir sviestine tešla.",
    price: "12 €",
    image: "/images/babka-winter.jpg",
    tag: "Sezono skonis",
  },
  {
    name: "Migdolinė boba",
    description:
      "Puri, ilgai brandinta boba su traškia migdolų plutele ir razinomis.",
    price: "14 €",
    image: "/images/boba-full.jpg",
    tag: "Šventinis",
  },
  {
    name: "Šokoladinė boba",
    description:
      "Kakavinė boba su cukraus perliukais — švelni, drėgna ir kvapni.",
    price: "14 €",
    image: "/images/boba-close.jpg",
    tag: "Naujiena",
  },
];

export function Products() {
  return (
    <section id="kepiniai" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-600">
            Mūsų kepiniai
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-brown-900 sm:text-5xl">
            Iškepta šįryt, <span className="text-caramel-600">jūsų stalui</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-brown-600">
            Kepame mažomis partijomis, todėl kiekvienas kepalas gauna tiek
            laiko, kiek jam iš tiesų reikia. Užsakykite iki 18:00 — atsiimsite
            rytoj dar šiltus.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <StaggerItem key={product.name} className="group">
              <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-sand-50 shadow-warm transition-all duration-500 hover:-translate-y-2 hover:shadow-warm-lg">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-sand-50/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-caramel-700 backdrop-blur">
                    {product.tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold text-brown-900">
                      {product.name}
                    </h3>
                    <p className="whitespace-nowrap font-display text-lg font-semibold text-caramel-600">
                      {product.price}
                    </p>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-brown-500">
                    {product.description}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-12 flex justify-center" delay={0.1}>
          <Link href="/#kontaktai">
            <ButtonColorful
              label="Užsakyti visam savaitgaliui"
              className="h-12 px-8 text-base"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
