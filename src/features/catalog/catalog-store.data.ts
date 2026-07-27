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

const fallbackProducts: StoreProduct[] = [
  { id: "demo-cam-interior", name: "Cámara Wi‑Fi Interior", slug: "camara-wifi-interior", type: "standard", shortDescription: "Visión nocturna, audio bidireccional y acceso desde tu celular.", unitPriceCents: 6499000, pack10PriceCents: null, categoryName: "Cámaras", imageUrl: null },
  { id: "demo-cam-exterior", name: "Cámara Exterior Full HD", slug: "camara-exterior-full-hd", type: "standard", shortDescription: "Protección resistente para entradas, patios y espacios exteriores.", unitPriceCents: 8999000, pack10PriceCents: null, categoryName: "Cámaras", imageUrl: null },
  { id: "demo-kit-inicial", name: "Kit Hogar Inicial", slug: "kit-hogar-inicial", type: "kit", shortDescription: "Una solución simple para empezar a proteger los puntos principales.", unitPriceCents: 17499000, pack10PriceCents: null, categoryName: "Kits", imageUrl: null },
  { id: "demo-kit-completo", name: "Kit Hogar Completo", slug: "kit-hogar-completo", type: "kit", shortDescription: "Cobertura integral con cámaras para interior y exterior.", unitPriceCents: 28999000, pack10PriceCents: null, categoryName: "Kits", imageUrl: null },
  { id: "demo-micro-sd", name: "Memoria microSD 128 GB", slug: "memoria-microsd-128", type: "standard", shortDescription: "Almacenamiento confiable para grabación continua o por eventos.", unitPriceCents: 2499000, pack10PriceCents: 21990000, categoryName: "Accesorios", imageUrl: null },
  { id: "demo-fuente", name: "Fuente de alimentación", slug: "fuente-alimentacion", type: "standard", shortDescription: "Repuesto compatible para instalaciones HouseCam.", unitPriceCents: 1299000, pack10PriceCents: 10990000, categoryName: "Accesorios", imageUrl: null },
];

export async function getStoreProducts() {
  if (!process.env.DATABASE_URL) return { items: fallbackProducts, usingDemoData: true };

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
      eq(products.storefront, "housecam"),
      eq(products.isActive, true),
      eq(categories.isActive, true),
      isNull(products.archivedAt),
      isNull(categories.archivedAt),
    ))
    .orderBy(asc(categories.sortOrder), asc(products.sortOrder), asc(products.name));

  return {
    items: items.map((item) => ({ ...item, shortDescription: item.shortDescription ?? "Solución HouseCam para cuidar tu hogar." })),
    usingDemoData: false,
  };
}
