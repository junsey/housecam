import type { Metadata } from "next";

import { PublicProductDetail } from "@/components/public-product-detail";
import { getStoreProductBySlug } from "@/features/catalog/catalog-store.data";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlug("housecam", slug);
  if (!product) return { title: "Producto no encontrado", robots: { index: false, follow: false } };
  const description = product.seoDescription ?? product.shortDescription;
  const canonical = `/productos/${product.slug}`;
  const cover = product.images.find((image) => image.isCover) ?? product.images[0];
  return {
    title: product.seoTitle ?? product.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: "HouseCam",
      title: product.seoTitle ?? product.name,
      description,
      url: canonical,
      images: cover ? [{ url: cover.url, alt: cover.alt ?? product.name }] : undefined,
    },
  };
}

export default async function ProductDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getStoreProductBySlug("housecam", slug);
  const schema = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map((image) => image.url),
    brand: { "@type": "Brand", name: "HouseCam" },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/productos/${product.slug}`),
      priceCurrency: "ARS",
      price: (product.unitPriceCents / 100).toFixed(2),
      availability: product.availableUnits > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  } : null;
  return <><PublicProductDetail brand="housecam" slug={slug} />{schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}</>;
}
