import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { clinic, siteUrl } from "@/content/clinic";
import { siteDescription, siteTitle } from "@/lib/meta";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

// Each page adds its own with pageMeta() in lib/meta.ts.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s — ${clinic.name} ${clinic.city}`,
  },
  description: siteDescription,
};

export const viewport: Viewport = {
  themeColor: "#160b19",
};

// Turns the 3D scroll chapters on (see lib/live.ts) unless the visitor has asked for less motion or
// the browser has no WebGL. It runs before the page is first drawn, so the layout never jumps.
const LIVE_SCRIPT =
  'if(window.WebGLRenderingContext&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.live=""';

// The clinic's details in the form search engines read. Opening hours and a map location are not in
// it yet: add them here once the clinic has given them.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  name: clinic.name,
  slogan: clinic.tagline,
  url: clinic.url || undefined,
  telephone: clinic.phoneDisplay,
  address: {
    "@type": "PostalAddress",
    streetAddress: clinic.address,
    addressLocality: clinic.city,
    addressCountry: "PK",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The script marks <html> before React takes over the page, so React must not flag the difference.
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LIVE_SCRIPT }} />
      </head>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
