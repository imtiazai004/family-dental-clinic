import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Shell from "@/components/Shell";
import Stage from "@/components/Stage";
import { chapterFor } from "@/content/chapters";
import { clinic, phoneLink, whatsappLink } from "@/content/clinic";
import { services } from "@/content/services";
import { pageMeta } from "@/lib/meta";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return pageMeta({ title: service.name, description: service.description, path: `/services/${slug}/` });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <Shell>
      {/* A treatment opens with its 3D chapter. Until that chapter is built, it opens with its name. */}
      {chapterFor(slug) ? (
        <Stage ids={[slug]} standalone />
      ) : (
        <PageHeader
          eyebrow={
            <Link href="/services" className="hover:text-cream">
              Treatments
            </Link>
          }
          title={service.name}
        />
      )}

      <section className="relative z-10 bg-cream text-ink">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <h2 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">About this treatment</h2>
            <div>
              <p className="max-w-2xl text-lg leading-relaxed text-ink/80 sm:text-xl">{service.description}</p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
                <a
                  href={whatsappLink(`Hello ${clinic.name}, I would like to ask about ${service.name}.`)}
                  className="rounded-full bg-plum-900 px-6 py-3 text-cream transition hover:bg-plum-700"
                >
                  Ask on WhatsApp
                </a>
                <a
                  href={phoneLink}
                  className="rounded-full border border-plum-900/25 px-6 py-3 transition hover:border-plum-900/60"
                >
                  Call {clinic.phoneDisplay}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-20 border-t border-plum-100 pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-500">Other treatments</p>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
              {services
                .filter((s) => s.slug !== slug)
                .map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="block rounded-full border border-plum-900/15 px-4 py-2 transition hover:border-plum-900/50"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </section>
    </Shell>
  );
}
