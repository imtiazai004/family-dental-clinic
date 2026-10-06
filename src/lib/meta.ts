import type { Metadata } from "next";
import { clinic } from "@/content/clinic";

export const siteTitle = `${clinic.name} ${clinic.city} — ${clinic.tagline}`;
export const siteDescription =
  "Dental implants, crowns, veneers, root canal treatment, braces, dentures and more in Peshawar. Explore each treatment in 3D and book on WhatsApp.";

// The picture that shows when a link to the site is shared. `npm run posters` makes it.
const shareImage = {
  url: "/share.jpg",
  width: 1200,
  height: 630,
  alt: `${clinic.name}, ${clinic.city}. ${clinic.tagline}. Beside the words, a dental implant shown in cross-section.`,
};

// What a page tells search engines, and what shows when its link is shared: title, description and
// its own address. `path` is the page's address on the site, ending in a slash. Leave `title` out on
// the home page.
export function pageMeta({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  return {
    // Left out, not passed empty, so the home page keeps the title set in app/layout.tsx.
    ...(title && { title }),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: title ? `${title} — ${clinic.name} ${clinic.city}` : siteTitle,
      description,
      url: path,
      siteName: clinic.name,
      type: "website",
      locale: "en_PK",
      images: [shareImage],
    },
  };
}
