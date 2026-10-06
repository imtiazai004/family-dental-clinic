import Link from "next/link";
import { clinic, whatsappLink } from "@/content/clinic";
import { services } from "@/content/services";

// The ten treatments. The whole card opens the treatment's page; WhatsApp is a second way out.
export function ServiceCards() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-3xl bg-plum-100 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => (
        <li key={s.slug} className="group relative flex flex-col bg-cream py-7 transition-colors hover:bg-white sm:p-8">
          <span className="text-xs font-semibold tracking-[0.2em] text-plum-500">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-4 font-display text-2xl tracking-tight">
            <Link href={`/services/${s.slug}`} className="after:absolute after:inset-0">
              {s.name}
            </Link>
          </h3>
          <p className="mt-3 grow text-sm leading-relaxed text-ink/70">{s.description}</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <span className="text-plum-700 underline-offset-4 group-hover:underline" aria-hidden>
              View treatment →
            </span>
            <a
              href={whatsappLink(`Hello ${clinic.name}, I would like to ask about ${s.name}.`)}
              className="relative text-plum-500 underline-offset-4 hover:text-plum-700 hover:underline"
            >
              Ask on WhatsApp
            </a>
          </div>
        </li>
      ))}
      {/* Ten cards leave a gap at the end of the last row. This fills it. */}
      <li className="flex flex-col items-start justify-center bg-plum-900 px-6 py-10 text-cream sm:col-span-2 sm:p-10">
        <h3 className="font-display text-3xl tracking-tight">Not sure which treatment you need?</h3>
        <p className="mt-3 text-sm leading-relaxed text-cream/75">Tell us what is troubling you and we will guide you.</p>
        <a
          href={whatsappLink(`Hello ${clinic.name}, I am not sure which treatment I need.`)}
          className="mt-6 rounded-full bg-cream px-6 py-3 text-sm font-semibold text-plum-900 transition hover:bg-white"
        >
          Ask on WhatsApp
        </a>
      </li>
    </ul>
  );
}

export default function Services() {
  return (
    <section id="services" className="relative z-10 bg-cream text-ink">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-500">Treatments</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          Care for the whole family, in one place
        </h2>
        <div className="mt-14">
          <ServiceCards />
        </div>
      </div>
    </section>
  );
}
