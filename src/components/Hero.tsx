import { bookingLink, clinic } from "@/content/clinic";

// The home page opening. It sits over the first chapter's model, which is already on screen.
export default function Hero() {
  return (
    <section
      id="top"
      className="relative z-10 mx-auto flex h-svh max-w-7xl items-end px-5 pb-14 sm:px-8 lg:items-center lg:pb-0"
    >
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-300">
          {clinic.name} · {clinic.city}
        </p>
        <h1 className="mt-4 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          Smiles for every generation
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-cream/75 sm:text-lg">
          See your treatment before you sit in the chair. Scroll to look inside an implant, a crown and a root
          canal.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={bookingLink}
            className="rounded-full bg-cream px-6 py-3 text-sm font-semibold text-plum-900 transition hover:bg-white"
          >
            Book on WhatsApp
          </a>
          <a
            href="#services"
            className="rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold transition hover:border-cream/70"
          >
            Our treatments
          </a>
        </div>
      </div>
    </section>
  );
}
