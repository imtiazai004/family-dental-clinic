import Link from "next/link";
import { bookingLink, clinic, phoneLink } from "@/content/clinic";

// The footer of every page. `bare` leaves out the contact details, for the page that already is them.
export default function Contact({ bare = false }: { bare?: boolean }) {
  return (
    <footer id="contact" className="relative z-10 bg-plum-900">
      {!bare && (
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:py-32">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-300">Visit us</p>
            <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-5xl">{clinic.tagline}</h2>
            <a
              href={bookingLink}
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
                <a href={phoneLink} className="hover:text-cream">
                  {clinic.phoneDisplay}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      )}
      <div className="border-t border-cream/10 px-5 py-6 text-center text-xs text-cream/50">
        <nav className="mb-3 flex justify-center gap-6 text-cream/75">
          <Link href="/" className="hover:text-cream">
            Home
          </Link>
          <Link href="/services" className="hover:text-cream">
            Treatments
          </Link>
          <Link href="/contact" className="hover:text-cream">
            Contact
          </Link>
        </nav>
        <p>
          © {new Date().getFullYear()} {clinic.name}
        </p>
      </div>
    </footer>
  );
}
