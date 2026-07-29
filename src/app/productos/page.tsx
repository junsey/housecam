import type { Metadata } from "next";

import { StorefrontPage } from "@/components/storefront-page";

export const metadata: Metadata = {
  title: "Tienda",
  alternates: { canonical: "/productos" },
  description: "Tienda HouseCam: cámaras, kits y accesorios para cuidar tu hogar.",
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  return <StorefrontPage brand="housecam" selectedCategory={categoria} />;
}
