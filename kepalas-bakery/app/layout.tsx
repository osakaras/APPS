import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kepalasbakery.lt"),
  title: {
    default: "Kepalas Bakery — Amatininkų kepykla Vilniuje",
    template: "%s — Kepalas Bakery",
  },
  description:
    "Kepalas Bakery — amatininkų kepykla, kurioje kasdien nuo ankstaus ryto kepame babkas, bobas ir raugo duoną iš natūralių ingredientų.",
  keywords: [
    "kepykla",
    "babka",
    "boba",
    "raugo duona",
    "Vilnius",
    "kepiniai",
    "Kepalas Bakery",
  ],
  openGraph: {
    title: "Kepalas Bakery — Amatininkų kepykla",
    description:
      "Kasdien šviežiai kepamos babkos, bobos ir raugo duona. Iškepta su meile Vilniuje.",
    locale: "lt_LT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
