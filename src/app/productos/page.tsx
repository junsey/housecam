import type { Metadata } from "next";

import { BrandHeader } from "@/components/brand-header";
import { StorefrontPlaceholder } from "@/components/storefront-placeholder";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Tienda HouseCam en preparación.",
};

export default function ProductsPage() {
  return (
    <>
      <BrandHeader />
      <StorefrontPlaceholder
        brand="HouseCam"
        eyebrow="Fase 1 completada"
        title="La tienda está en preparación"
        description="La base de catálogo, precios, kits, stock y solicitudes ya está definida. La carga de productos y la experiencia de compra se habilitarán en las próximas fases."
      />
    </>
  );
}
