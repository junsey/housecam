import { describe, expect, it } from "vitest";

import { publicNavigationItems } from "@/config/public-navigation";

import { categoryInputSchema, kitComponentInputSchema, productInputSchema } from "./catalog.schemas";
import { validateCatalogImage } from "./catalog-image.domain";

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

  it("acepta solo imágenes web seguras de hasta 4 MB", () => {
    expect(validateCatalogImage({ type: "image/webp", size: 100_000, alt: "Cámara exterior" }).alt).toBe("Cámara exterior");
    expect(() => validateCatalogImage({ type: "image/svg+xml", size: 100, alt: "SVG" })).toThrow("JPG");
    expect(() => validateCatalogImage({ type: "image/png", size: 5 * 1024 * 1024, alt: "Imagen grande" })).toThrow("4 MB");
  });

  it("valida componentes de kit y rechaza autorreferencias", () => {
    const kitProductId = "11111111-1111-4111-8111-111111111111";
    const componentProductId = "22222222-2222-4222-8222-222222222222";
    expect(kitComponentInputSchema.parse({ kitProductId, componentProductId, quantity: 2 }).quantity).toBe(2);
    expect(() => kitComponentInputSchema.parse({
      kitProductId,
      componentProductId: kitProductId,
      quantity: 1,
    })).toThrow();
  });
});

describe("navegación pública unificada", () => {
  it("no contiene etiquetas ni destinos duplicados", () => {
    const labels = publicNavigationItems.map((item) => item.label);
    const destinations = publicNavigationItems.map((item) => item.href);
    expect(new Set(labels).size).toBe(labels.length);
    expect(new Set(destinations).size).toBe(destinations.length);
  });
});
