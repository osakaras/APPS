import Link from "next/link";
import { Clock, Mail, MapPin, Wheat } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brown-900 text-sand-200">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-3">
        <div>
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-2xl font-semibold text-sand-50"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-caramel-500 text-sand-50">
              <Wheat size={18} />
            </span>
            Kepalas <span className="text-caramel-400">Bakery</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand-300/80">
            Šeimos kepykla Justiniškėse, kurioje kiekvienas kepinys gimsta iš
            aukščiausios kokybės produktų, tradicinių metodų ir rankų šilumos.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-sand-50">
            Naršykite
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { href: "/", label: "Pradžia" },
              { href: "/#kepiniai", label: "Kepiniai" },
              { href: "/istorija", label: "Apie mus" },
              { href: "/#kontaktai", label: "Kontaktai" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sand-300/80 transition-colors hover:text-caramel-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-sand-50">
            Užsukite
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-sand-300/80">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-caramel-400" />
              Taikos g. 104, Vilnius
            </li>
            <li className="flex items-start gap-3">
              <Clock size={16} className="mt-0.5 shrink-0 text-caramel-400" />
              <span>
                III–V 9:00–17:00
                <br />
                VI–VII 9:00–16:00
                <br />
                I–II nedirbame
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={16} className="mt-0.5 shrink-0 text-caramel-400" />
              kepalasbakery@gmail.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-sand-50/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-sand-300/60 sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} Kepalas Bakery. Visos teisės saugomos.</p>
          <p>kepalasbakery.lt</p>
        </div>
      </div>
    </footer>
  );
}
