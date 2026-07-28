import "server-only";

import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { cache } from "react";

import { getDb } from "@/db";
import { categories, kitComponents, productImages, productSpecs, products } from "@/db/schema";

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
  }).from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(
      eq(products.storefront, storefront),
      eq(products.isActive, true),
      eq(categories.isActive, true),
      isNull(products.archivedAt),
      isNull(categories.archivedAt),
    ))
    .orderBy(asc(categories.sortOrder), asc(products.sortOrder), asc(products.name));

  const images = items.length
    ? await getDb().select({
      productId: productImages.productId,
      url: productImages.url,
      isCover: productImages.isCover,
      sortOrder: productImages.sortOrder,
    }).from(productImages)
      .where(inArray(productImages.productId, items.map((item) => item.id)))
      .orderBy(asc(productImages.sortOrder))
    : [];

  return {
    items: items.map((item) => {
      const productImages = images.filter((image) => image.productId === item.id);
      const image = productImages.find((candidate) => candidate.isCover) ?? productImages[0];
      return {
        ...item,
        imageUrl: image?.url ?? null,
        shortDescription: item.shortDescription ?? `Solución ${storefront === "housepet" ? "HousePet" : "HouseCam"} para cuidar lo que importa.`,
      };
    }),
    usingDemoData: false,
  };
}

export const getStoreProductBySlug = cache(async (storefront: "housecam" | "housepet", slug: string) => {
  if (!process.env.DATABASE_URL) {
    const product = (storefront === "housepet" ? housepetFallbackProducts : housecamFallbackProducts).find((item) => item.slug === slug);
    if (!product) return null;
    return {
      ...product,
      storefront,
      sku: `DEMO-${product.id.toUpperCase()}`,
      description: product.shortDescription,
      seoTitle: null,
      seoDescription: null,
      images: product.imageUrl ? [{ id: `${product.id}-cover`, url: product.imageUrl, alt: product.name, isCover: true }] : [],
      specs: [],
      availableUnits: 20,
    };
  }

  const db = getDb();
  const [product] = await db.select({
    id: products.id,
    name: products.name,
    slug: products.slug,
    sku: products.sku,
    type: products.type,
    storefront: products.storefront,
    shortDescription: products.shortDescription,
    description: products.description,
    unitPriceCents: products.unitPriceCents,
    pack10PriceCents: products.pack10PriceCents,
    stockOnHand: products.stockOnHand,
    categoryName: categories.name,
    seoTitle: products.seoTitle,
    seoDescription: products.seoDescription,
  }).from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(
      eq(products.storefront, storefront),
      eq(products.slug, slug),
      eq(products.isActive, true),
      eq(categories.isActive, true),
      isNull(products.archivedAt),
      isNull(categories.archivedAt),
    ))
    .limit(1);

  if (!product) return null;

  const [images, specs, components] = await Promise.all([
    db.select({ id: productImages.id, url: productImages.url, alt: productImages.alt, isCover: productImages.isCover })
      .from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder)),
    db.select({ id: productSpecs.id, label: productSpecs.label, value: productSpecs.value })
      .from(productSpecs).where(eq(productSpecs.productId, product.id)).orderBy(asc(productSpecs.sortOrder)),
    product.type === "kit"
      ? db.select({ quantity: kitComponents.quantity, stockOnHand: products.stockOnHand })
        .from(kitComponents)
        .innerJoin(products, eq(kitComponents.componentProductId, products.id))
        .where(eq(kitComponents.kitProductId, product.id))
      : Promise.resolve([]),
  ]);

  const availableUnits = product.type === "kit"
    ? (components.length ? Math.min(...components.map((component) => Math.floor(component.stockOnHand / component.quantity))) : 0)
    : product.stockOnHand;

  return {
    ...product,
    shortDescription: product.shortDescription ?? `Solución ${storefront === "housepet" ? "HousePet" : "HouseCam"} para cuidar lo que importa.`,
    description: product.description ?? product.shortDescription ?? "Una solución simple y confiable para acompañarte todos los días.",
    images,
    specs,
    availableUnits,
  };
});
