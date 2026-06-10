import type { MetadataRoute } from "next";
import { fetchSitemapEntries } from "@/lib/seo-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await fetchSitemapEntries();
  return entries.map((e) => ({
    url: e.url,
    lastModified: e.lastModified,
    changeFrequency: "weekly",
    priority: e.url.endsWith("/") ? 1 : 0.8,
  }));
}
