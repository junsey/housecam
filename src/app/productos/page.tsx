import type { Metadata } from "next";

import { StorefrontPage } from "@/components/storefront-page";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Tienda HouseCam: cámaras, kits y accesorios para cuidar tu hogar.",
};

export default function ProductsPage() {
  return <StorefrontPage brand="housecam" />;
}
