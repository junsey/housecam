import { describe, expect, it } from "vitest";

import { publicNavigationItems } from "@/config/public-navigation";
import { injectPublicNavigation } from "@/lib/public-html";

import { categoryInputSchema, productInputSchema } from "./catalog.schemas";

describe("catálogo administrativo", () => {
  it("valida categorías por marca y slugs estables", () => {
    expect(categoryInputSchema.parse({
      name: "Cámaras IP",
      slug: "camaras-ip",
      storefront: "housecam",
      isActive: true,
    }).slug).toBe("camaras-ip");
    expect(() => categoryInputSchema.parse({
      name: "Cámaras",
      slug: "Cámaras IP",
      storefront: "housecam",
      isActive: true,
    })).toThrow();
  });

  it("normaliza el SKU y conserva precios enteros", () => {
    const result = productInputSchema.parse({
      categoryId: "1b137a16-49e2-4e33-8f56-37af27085d9c",
      storefront: "housecam",
      sku: " hc-cam-01 ",
      slug: "camara-frente",
      type: "standard",
      name: "Cámara frente",
      unitPriceCents: 120_000,
      commercialCostCents: 75_000,
      isActive: false,
    });
    expect(result.sku).toBe("HC-CAM-01");
    expect(result.unitPriceCents).toBe(120_000);
  });
});

describe("navegación pública unificada", () => {
  it("no contiene etiquetas ni destinos duplicados", () => {
    const labels = publicNavigationItems.map((item) => item.label);
    const destinations = publicNavigationItems.map((item) => item.href);
    expect(new Set(labels).size).toBe(labels.length);
    expect(new Set(destinations).size).toBe(destinations.length);
  });

  it("inyecta el mismo menú y marca la ruta activa", () => {
    const html = '<nav><!-- PUBLIC_NAV_START --><!-- PUBLIC_NAV_END --></nav>';
    const rendered = injectPublicNavigation(html, "/productos");
    expect(rendered).toContain('href="/productos#tienda" aria-current="page"');
    expect(rendered.match(/>HousePet</g)).toHaveLength(1);
    expect(rendered.match(/Hablar con nosotros/g)).toHaveLength(1);
  });
});
