import type { MetadataRoute } from "next";
import { fetchSitemapEntries } from "@/lib/seo-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await fetchSitemapEntries();

  const sitelinkBoost = new Set([
    "/",
    "/discover",
    "/boutique",
    "/blog",
    "/contact",
    "/categorie/accessoires",
  ]);

  return entries.map((e) => {
    let path = "/";
    try {
      path = new URL(e.url).pathname;
    } catch {
      /* ignore */
    }
    const priority = path === "/" ? 1 : sitelinkBoost.has(path) ? 0.95 : path.startsWith("/blog/") ? 0.75 : 0.8;

    return {
      url: e.url,
      lastModified: e.lastModified,
      changeFrequency: "weekly" as const,
      priority,
    };
  });
}
