import type { Metadata } from "next";

import { PublicProductDetail } from "@/components/public-product-detail";
import { getStoreProductBySlug } from "@/features/catalog/catalog-store.data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProductBySlug("housepet", slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription,
  };
}

export default async function HousePetProductDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicProductDetail brand="housepet" slug={slug} />;
}
