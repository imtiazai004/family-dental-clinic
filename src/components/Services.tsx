import { clinic, whatsappLink } from "@/content/clinic";
import { services } from "@/content/services";

export default function Services() {
  return (
    <section id="services" className="relative z-10 bg-cream text-ink">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-500">Treatments</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          Care for the whole family, in one place
        </h2>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-plum-100 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <li key={s.slug} className="flex flex-col bg-cream py-7 sm:p-8">
              <span className="text-xs font-semibold tracking-[0.2em] text-plum-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-2xl tracking-tight">{s.name}</h3>
              <p className="mt-3 grow text-sm leading-relaxed text-ink/70">{s.description}</p>
              <a
                href={whatsappLink(`Hello ${clinic.name}, I would like to ask about ${s.name}.`)}
                className="mt-6 text-sm font-semibold text-plum-700 underline-offset-4 hover:underline"
              >
                Ask on WhatsApp →
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
