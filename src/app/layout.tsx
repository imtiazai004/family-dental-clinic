import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { clinic } from "@/content/clinic";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: `${clinic.name} ${clinic.city} — ${clinic.tagline}`,
  description:
    "Dental implants, crowns, veneers, root canal treatment, braces, dentures and more in Peshawar. Explore each treatment in 3D and book on WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#160b19",
};

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
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
