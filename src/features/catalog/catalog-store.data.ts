import "server-only";

import { and, asc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db";
import { categories, productImages, products } from "@/db/schema";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  type: "standard" | "kit";
  shortDescription: string;
  unitPriceCents: number;
  pack10PriceCents: number | null;
  categoryName: string;
  imageUrl: string | null;
};

const housecamFallbackProducts: StoreProduct[] = [
  { id: "demo-cam-interior", name: "Cámara Wi‑Fi Interior", slug: "camara-wifi-interior", type: "standard", shortDescription: "Visión nocturna, audio bidireccional y acceso desde tu celular.", unitPriceCents: 6499000, pack10PriceCents: null, categoryName: "Cámaras", imageUrl: null },
  { id: "demo-cam-exterior", name: "Cámara Exterior Full HD", slug: "camara-exterior-full-hd", type: "standard", shortDescription: "Protección resistente para entradas, patios y espacios exteriores.", unitPriceCents: 8999000, pack10PriceCents: null, categoryName: "Cámaras", imageUrl: null },
  { id: "demo-kit-inicial", name: "Kit Hogar Inicial", slug: "kit-hogar-inicial", type: "kit", shortDescription: "Una solución simple para empezar a proteger los puntos principales.", unitPriceCents: 17499000, pack10PriceCents: null, categoryName: "Kits", imageUrl: null },
  { id: "demo-kit-completo", name: "Kit Hogar Completo", slug: "kit-hogar-completo", type: "kit", shortDescription: "Cobertura integral con cámaras para interior y exterior.", unitPriceCents: 28999000, pack10PriceCents: null, categoryName: "Kits", imageUrl: null },
  { id: "demo-micro-sd", name: "Memoria microSD 128 GB", slug: "memoria-microsd-128", type: "standard", shortDescription: "Almacenamiento confiable para grabación continua o por eventos.", unitPriceCents: 2499000, pack10PriceCents: 21990000, categoryName: "Accesorios", imageUrl: null },
  { id: "demo-fuente", name: "Fuente de alimentación", slug: "fuente-alimentacion", type: "standard", shortDescription: "Repuesto compatible para instalaciones HouseCam.", unitPriceCents: 1299000, pack10PriceCents: 10990000, categoryName: "Accesorios", imageUrl: null },
];

const housepetFallbackProducts: StoreProduct[] = [
  { id: "pet-cam", name: "Cámara Pet View", slug: "camara-pet-view", type: "standard", shortDescription: "Mirá y escuchá a tus mascotas desde cualquier lugar.", unitPriceCents: 7499000, pack10PriceCents: null, categoryName: "Monitoreo", imageUrl: null },
  { id: "pet-feeder", name: "Comedero Smart", slug: "comedero-smart", type: "standard", shortDescription: "Programá porciones y horarios desde tu celular.", unitPriceCents: 11999000, pack10PriceCents: null, categoryName: "Alimentación", imageUrl: null },
  { id: "pet-fountain", name: "Fuente Smart Flow", slug: "fuente-smart-flow", type: "standard", shortDescription: "Agua fresca y circulación continua para todos los días.", unitPriceCents: 6999000, pack10PriceCents: null, categoryName: "Bienestar", imageUrl: null },
  { id: "pet-kit", name: "Kit HousePet Conectado", slug: "kit-housepet-conectado", type: "kit", shortDescription: "Monitoreo, alimentación y bienestar en una solución completa.", unitPriceCents: 23999000, pack10PriceCents: null, categoryName: "Kits", imageUrl: null },
];

export async function getStoreProducts(storefront: "housecam" | "housepet" = "housecam") {
  if (!process.env.DATABASE_URL) return {
    items: storefront === "housepet" ? housepetFallbackProducts : housecamFallbackProducts,
    usingDemoData: true,
  };

  const items = await getDb().select({
    id: products.id,
    name: products.name,
    slug: products.slug,
    type: products.type,
    shortDescription: products.shortDescription,
    unitPriceCents: products.unitPriceCents,
    pack10PriceCents: products.pack10PriceCents,
    categoryName: categories.name,
    imageUrl: productImages.url,
  }).from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isCover, true)))
    .where(and(
      eq(products.storefront, storefront),
      eq(products.isActive, true),
      eq(categories.isActive, true),
      isNull(products.archivedAt),
      isNull(categories.archivedAt),
    ))
    .orderBy(asc(categories.sortOrder), asc(products.sortOrder), asc(products.name));

  return {
    items: items.map((item) => ({ ...item, shortDescription: item.shortDescription ?? `Solución ${storefront === "housepet" ? "HousePet" : "HouseCam"} para cuidar lo que importa.` })),
    usingDemoData: false,
  };
}
