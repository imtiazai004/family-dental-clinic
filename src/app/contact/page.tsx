import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Shell from "@/components/Shell";
import { bookingLink, clinic, directionsLink, phoneLink } from "@/content/clinic";

export const metadata: Metadata = {
  title: "Contact",
  description: `Address, phone and WhatsApp for ${clinic.name}, ${clinic.city}.`,
};

const LABEL = "text-xs font-semibold uppercase tracking-[0.2em] text-plum-500";
const ACTION = "mt-6 text-sm font-semibold text-plum-700 underline-offset-4 hover:underline";

export default function ContactPage() {
  return (
    <Shell bareFooter>
      <PageHeader eyebrow="Contact" title={`Visit us in ${clinic.city}`}>
        <p>Message us on WhatsApp or call to book an appointment.</p>
      </PageHeader>
      <section className="bg-cream text-ink">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <dl className="grid gap-px overflow-hidden rounded-3xl bg-plum-100 lg:grid-cols-3">
            <div className="flex flex-col bg-cream py-7 sm:p-8">
              <dt className={LABEL}>Address</dt>
              <dd className="mt-4 flex grow flex-col items-start">
                <span className="grow font-display text-2xl leading-snug tracking-tight">{clinic.address}</span>
                <a href={directionsLink} className={ACTION}>
                  Get directions →
                </a>
              </dd>
            </div>
            <div className="flex flex-col bg-cream py-7 sm:p-8">
              <dt className={LABEL}>Phone</dt>
              <dd className="mt-4 flex grow flex-col items-start">
                <span className="grow font-display text-2xl leading-snug tracking-tight">{clinic.phoneDisplay}</span>
                <a href={phoneLink} className={ACTION}>
                  Call now →
                </a>
              </dd>
            </div>
            <div className="flex flex-col bg-cream py-7 sm:p-8">
              <dt className={LABEL}>WhatsApp</dt>
              <dd className="mt-4 flex grow flex-col items-start">
                <span className="grow font-display text-2xl leading-snug tracking-tight">
                  Book or ask a question
                </span>
                <a href={bookingLink} className={ACTION}>
                  Book on WhatsApp →
                </a>
              </dd>
            </div>
            {clinic.hours.length > 0 && (
              <div className="bg-cream py-7 sm:p-8 lg:col-span-3">
                <dt className={LABEL}>Opening hours</dt>
                <dd className="mt-4 grid gap-2 text-lg sm:grid-cols-2 lg:grid-cols-3">
                  {clinic.hours.map((h) => (
                    <p key={h.days}>
                      {h.days}: <span className="text-ink/70">{h.time}</span>
                    </p>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    </Shell>
  );
}
