import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Shell from "@/components/Shell";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Shell bareFooter>
      <PageHeader eyebrow="404" title="This page could not be found" fill>
        <p>The link may be old, or the address may have a typing mistake.</p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-cream">
          <Link href="/" className="rounded-full bg-cream px-6 py-3 text-plum-900 transition hover:bg-white">
            Go to the home page
          </Link>
          <Link
            href="/services"
            className="rounded-full border border-cream/30 px-6 py-3 transition hover:border-cream/70"
          >
            See all treatments
          </Link>
        </div>
      </PageHeader>
    </Shell>
  );
}
