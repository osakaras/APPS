"use client";

import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";
import { ButtonColorful } from "@/components/ui/button-colorful";

const WOLT_URL = "https://wolt.com/lt/ltu/vilnius/venue/kepalas-taikos-g";

const products = [
  {
    name: "Ruginė duona",
    description:
      "Tamsi raugo duona su sėklomis — be cukraus ir be mielių.",
    price: "6,70 €",
    image: "/images/apie/rugine-duona.jpg",
    tag: "Duona",
  },
  {
    name: "Šokoladinė bandelė",
    description: "Puri bandelė su šokoladu ir švelniu kremu.",
    price: "3,30 €",
    image: "/images/apie/suktinukai.jpg",
    tag: "Bandelės",
  },
  {
    name: "Niujorko sūrio pyragas",
    description:
      "Klasikinis, švelnus ir kreminis — su traškiu sausainių pagrindu.",
    price: "5,60 €",
    image: "/images/apie/surio-pyragas.jpg",
    tag: "Desertai",
  },
  {
    name: "Tinginys",
    description:
      "Su naminiais sausainiais, glaistytas šokoladu.",
    price: "3,50 €",
    image: "/images/apie/sokoladine-tesla.jpg",
    tag: "Desertai",
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
            Kepame mažomis partijomis, todėl kiekvienas kepinys gauna tiek
            laiko, kiek jam iš tiesų reikia. Užsisakykite per Wolt arba
            užsukite į kepyklą Taikos g. 104 — visas asortimentas laukia
            vietoje.
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

        <Reveal className="mt-12 flex flex-col items-center gap-3" delay={0.1}>
          <a href={WOLT_URL} target="_blank" rel="noopener noreferrer">
            <ButtonColorful
              label="Užsakyti per Wolt"
              className="h-12 px-8 text-base"
            />
          </a>
          <p className="text-sm text-brown-500">
            Pristatome per Wolt — arba atsiimkite kepykloje Justiniškėse.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
