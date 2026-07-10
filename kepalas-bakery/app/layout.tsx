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
    default: "Kepalas Bakery — Šeimos kepykla Justiniškėse",
    template: "%s — Kepalas Bakery",
  },
  description:
    "„KEPALAS“ – šeimos kepykla Justiniškėse, Vilniuje. Kasdien kepame sourdough duoną ir saldžius kepinius iš aukščiausios kokybės produktų. Taikos g. 104.",
  keywords: [
    "kepykla",
    "sourdough duona",
    "suktinukai",
    "saldūs kepiniai",
    "Justiniškės",
    "Vilnius",
    "Kepalas Bakery",
  ],
  openGraph: {
    title: "Kepalas Bakery — Šeimos kepykla Justiniškėse",
    description:
      "Skoniai, kurie artimi jūsų namams. Sourdough duona ir saldūs kepiniai, iškepti su meile Vilniuje, Taikos g. 104.",
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
