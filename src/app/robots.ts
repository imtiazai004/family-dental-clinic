import type { MetadataRoute } from "next";
import { clinic } from "@/content/clinic";

export const dynamic = "force-static";

// Search engines are let in only once the site has its real address. Before that, any copy of it that
// is online is a preview.
export default function robots(): MetadataRoute.Robots {
  if (!clinic.url) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${clinic.url}/sitemap.xml` };
}
