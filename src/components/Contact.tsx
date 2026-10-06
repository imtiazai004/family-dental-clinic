import { clinic, whatsappLink } from "@/content/clinic";

export default function Contact() {
  return (
    <footer id="contact" className="relative z-10 bg-plum-900">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:py-32">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-300">Visit us</p>
          <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-5xl">{clinic.tagline}</h2>
          <a
            href={whatsappLink(`Hello ${clinic.name}, I would like to book an appointment.`)}
            className="mt-8 inline-block rounded-full bg-cream px-6 py-3 text-sm font-semibold text-plum-900 transition hover:bg-white"
          >
            Book on WhatsApp
          </a>
        </div>
        <dl className="grid content-start gap-8 text-cream/80">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-plum-300">Address</dt>
            <dd className="mt-2 text-lg leading-relaxed">{clinic.address}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-plum-300">Phone / WhatsApp</dt>
            <dd className="mt-2 text-lg">
              <a href={`tel:${clinic.phoneDisplay.replace(/\s/g, "")}`} className="hover:text-cream">
                {clinic.phoneDisplay}
              </a>
            </dd>
          </div>
        </dl>
      </div>
      <p className="border-t border-cream/10 px-5 py-6 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {clinic.name}
      </p>
    </footer>
  );
}
