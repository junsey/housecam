import type { Metadata } from "next";

import { StorefrontPage } from "@/components/storefront-page";

export const metadata: Metadata = {
  title: "Tienda HousePet",
  alternates: { canonical: "/housepet/productos" },
  description: "Monitoreo, alimentación y bienestar conectado para tus mascotas.",
};

export default async function HousePetProductsPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  return <StorefrontPage brand="housepet" selectedCategory={categoria} />;
}
