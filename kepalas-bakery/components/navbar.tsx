"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Wheat, X } from "lucide-react";
import { ButtonColorful } from "@/components/ui/button-colorful";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#kepiniai", label: "Kepiniai" },
  { href: "/istorija", label: "Mūsų istorija" },
  { href: "/#kontaktai", label: "Kontaktai" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-sand-50/85 shadow-warm backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-brown-900"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-caramel-500 text-sand-50 transition-transform duration-300 group-hover:rotate-12">
            <Wheat className="h-4.5 w-4.5" size={18} />
          </span>
          Kepalas
          <span className="hidden text-caramel-600 sm:inline">Bakery</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-brown-700 transition-colors hover:text-caramel-600 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-caramel-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/#kontaktai">
            <ButtonColorful label="Užsakyti" className="h-9 px-5" />
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Uždaryti meniu" : "Atidaryti meniu"}
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full text-brown-800 transition-colors hover:bg-sand-200 md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden border-t border-brown-800/10 bg-sand-50/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-brown-800 transition-colors hover:bg-sand-200"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/#kontaktai"
                onClick={() => setOpen(false)}
                className="mt-2"
              >
                <ButtonColorful label="Užsakyti" className="w-full" />
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
