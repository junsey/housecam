import type { Metadata } from "next";

import { PublicProductDetail } from "@/components/public-product-detail";
import { getStoreProductBySlug } from "@/features/catalog/catalog-store.data";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlug("housepet", slug);
  if (!product) return { title: "Producto no encontrado", robots: { index: false, follow: false } };
  const description = product.seoDescription ?? product.shortDescription;
  const canonical = `/housepet/productos/${product.slug}`;
  const cover = product.images.find((image) => image.isCover) ?? product.images[0];
  return {
    title: product.seoTitle ?? product.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: "HousePet",
      title: product.seoTitle ?? product.name,
      description,
      url: canonical,
      images: cover ? [{ url: cover.url, alt: cover.alt ?? product.name }] : undefined,
    },
  };
}

export default async function HousePetProductDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getStoreProductBySlug("housepet", slug);
  const schema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map((image) => image.url),
    brand: { "@type": "Brand", name: "HousePet" },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/housepet/productos/${product.slug}`),
      priceCurrency: "ARS",
      price: (product.unitPriceCents / 100).toFixed(2),
      availability: product.availableUnits > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  } : null;
  return <><PublicProductDetail brand="housepet" slug={slug} />{schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}</>;
}
