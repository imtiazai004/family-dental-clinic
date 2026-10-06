import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/clinic";
import { services } from "@/content/services";

export const dynamic = "force-static";

// Every page of the site, for search engines. Add a line here when a page is added outside /services.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/services/", ...services.map((s) => `/services/${s.slug}/`), "/contact/"];
  return paths.map((path) => ({ url: siteUrl + path }));
}
