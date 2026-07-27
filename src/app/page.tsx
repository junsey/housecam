import { BrandHeader } from "@/components/brand-header";
import { StorefrontPlaceholder } from "@/components/storefront-placeholder";

export default function HouseCamPage() {
  return (
    <>
      <BrandHeader />
      <StorefrontPlaceholder
        brand="HouseCam"
        eyebrow="Seguridad inteligente"
        title="Tranquilidad para tu hogar"
        description="La nueva plataforma ya tiene sus fundamentos técnicos: catálogo, solicitudes, ventas e inventario preparados para crecer de forma segura."
      />
    </>
  );
}
