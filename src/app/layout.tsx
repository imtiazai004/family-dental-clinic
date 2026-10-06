import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { clinic } from "@/content/clinic";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${clinic.name} ${clinic.city} — ${clinic.tagline}`,
    template: `%s — ${clinic.name} ${clinic.city}`,
  },
  description:
    "Dental implants, crowns, veneers, root canal treatment, braces, dentures and more in Peshawar. Explore each treatment in 3D and book on WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#160b19",
};

// Turns the 3D scroll chapters on (see lib/live.ts) unless the visitor has asked for less motion or
// the browser has no WebGL. It runs before the page is first drawn, so the layout never jumps.
const LIVE_SCRIPT =
  'if(window.WebGLRenderingContext&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.live=""';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  name: clinic.name,
  slogan: clinic.tagline,
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
