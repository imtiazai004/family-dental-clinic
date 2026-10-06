import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { ServiceCards } from "@/components/Services";
import Shell from "@/components/Shell";
import { clinic } from "@/content/clinic";

export const metadata: Metadata = {
  title: "Treatments",
  description: `Every treatment at ${clinic.name}, ${clinic.city}: implants, crowns, veneers, root canal treatment, fillings, braces, bleaching, dentures and extractions.`,
};

export default function ServicesPage() {
  return (
    <Shell>
      <PageHeader eyebrow="Treatments" title="Care for the whole family, in one place" />
      <section className="bg-cream text-ink">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <ServiceCards />
        </div>
      </section>
    </Shell>
  );
}
