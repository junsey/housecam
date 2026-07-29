import type { MetadataRoute } from "next";

import { getStoreProducts } from "@/features/catalog/catalog-store.data";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [housecam, housepet] = await Promise.all([
    getStoreProducts("housecam"),
    getStoreProducts("housepet"),
  ]);
  const now = new Date();
  return [
    { url: absoluteUrl("/desarrollo"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/productos"), lastModified: now, changeFrequency: "daily", priority: .9 },
    { url: absoluteUrl("/housepet"), lastModified: now, changeFrequency: "weekly", priority: .8 },
    { url: absoluteUrl("/housepet/productos"), lastModified: now, changeFrequency: "daily", priority: .8 },
    { url: absoluteUrl("/nosotros"), lastModified: now, changeFrequency: "monthly", priority: .6 },
    ...(housecam.usingDemoData ? [] : housecam.items.map((product) => ({
      url: absoluteUrl(`/productos/${product.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: .7,
    }))),
    ...(housepet.usingDemoData ? [] : housepet.items.map((product) => ({
      url: absoluteUrl(`/housepet/productos/${product.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: .7,
    }))),
  ];
}
