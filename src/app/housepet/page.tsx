import type { Metadata } from "next";

import { BrandHeader } from "@/components/brand-header";
import { StorefrontPlaceholder } from "@/components/storefront-placeholder";

export const metadata: Metadata = { title: "HousePet" };

export default function HousePetPage() {
  return (
    <>
      <BrandHeader brand="housepet" />
      <StorefrontPlaceholder
        brand="HousePet"
        eyebrow="Cuidado conectado"
        title="Tecnología para quienes son familia"
        description="HousePet comparte la misma base comercial y operativa, conservando una identidad y un catálogo propios."
      />
    </>
  );
}
