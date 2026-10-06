"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { bookingLink, clinic, phoneLink } from "@/content/clinic";
import { services } from "@/content/services";

const links = [
  { href: "/services", label: "Treatments" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // While the phone menu is open the page behind it stays put.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const wide = window.matchMedia("(min-width: 768px)");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onWide = () => {
      if (wide.matches) setOpen(false);
    };
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    // `data-lenis-prevent` stops the smooth scroller from moving the page under the open menu.
    <header className="fixed inset-x-0 top-0 z-50" data-lenis-prevent={open || undefined}>
      <div className="bg-plum-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/" onClick={close} className="font-display text-lg tracking-tight">
            Family Dental <span className="text-plum-300">Clinic</span>
          </Link>
          <nav className="hidden gap-8 text-sm text-cream/75 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname.startsWith(l.href) ? "page" : undefined}
                className="transition hover:text-cream aria-[current=page]:text-cream"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={bookingLink}
              className="rounded-full border border-cream/30 px-4 py-2 text-sm font-semibold transition hover:border-cream/70"
            >
              WhatsApp
            </a>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen(!open)}
              className="relative -mr-2 size-10 md:hidden"
            >
              <span
                className={`absolute left-2.5 h-px w-5 bg-cream transition ${open ? "top-5 rotate-45" : "top-4"}`}
              />
              <span
                className={`absolute left-2.5 h-px w-5 bg-cream transition ${open ? "top-5 -rotate-45" : "top-6"}`}
              />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav
          id="menu"
          aria-label="Menu"
          className="h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-plum-950 px-5 pb-10 pt-6 md:hidden"
        >
          <ul className="font-display text-3xl tracking-tight">
            <li>
              <Link href="/" onClick={close} className="block py-2">
                Home
              </Link>
            </li>
            <li>
              <Link href="/services" onClick={close} className="block py-2">
                Treatments
              </Link>
              <ul className="mb-3 mt-1 grid grid-cols-2 gap-x-4 font-sans text-sm tracking-normal text-cream/75">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} onClick={close} className="block py-2">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link href="/contact" onClick={close} className="block py-2">
                Contact
              </Link>
            </li>
          </ul>
          <div className="mt-8 grid gap-3 text-center text-sm font-semibold">
            <a href={bookingLink} className="rounded-full bg-cream px-6 py-3 text-plum-900">
              Book on WhatsApp
            </a>
            <a href={phoneLink} className="rounded-full border border-cream/30 px-6 py-3">
              Call {clinic.phoneDisplay}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
