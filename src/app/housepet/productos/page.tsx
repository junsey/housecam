import type { Metadata } from "next";

import { StorefrontPage } from "@/components/storefront-page";

export const metadata: Metadata = {
  title: "Tienda HousePet",
  description: "Monitoreo, alimentación y bienestar conectado para tus mascotas.",
};

export default function HousePetProductsPage() {
  return <StorefrontPage brand="housepet" />;
}
