import "server-only";

import { and, asc, desc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db";
import { categories, kitComponents, productImages, productSpecs, products, siteSettings } from "@/db/schema";

import { getKitAvailability, getKitMaterialCostCents } from "./kit.domain";

export async function getAdminCategories() {
  if (!process.env.DATABASE_URL) return { configured: false as const, items: [] };
  const items = await getDb().select().from(categories)
    .where(isNull(categories.archivedAt))
    .orderBy(asc(categories.storefront), asc(categories.sortOrder), asc(categories.name));
  return { configured: true as const, items };
}

export async function getAdminProducts() {
  if (!process.env.DATABASE_URL) return { configured: false as const, items: [] };
  const items = await getDb()
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      storefront: products.storefront,
      type: products.type,
      unitPriceCents: products.unitPriceCents,
      stockOnHand: products.stockOnHand,
      isActive: products.isActive,
      categoryName: categories.name,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(isNull(products.archivedAt))
    .orderBy(desc(products.updatedAt));
  return { configured: true as const, items };
}

export async function getAdminCategory(id: string) {
  if (!process.env.DATABASE_URL) return null;
  const [item] = await getDb().select().from(categories).where(eq(categories.id, id)).limit(1);
  return item ?? null;
}

export async function getAdminProduct(id: string) {
  if (!process.env.DATABASE_URL) return null;
  const db = getDb();
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) return null;
  const [specs, images, componentRows, componentOptions] = await Promise.all([
    db.select().from(productSpecs).where(eq(productSpecs.productId, id)).orderBy(asc(productSpecs.sortOrder)),
    db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.sortOrder)),
    db.select().from(kitComponents).where(eq(kitComponents.kitProductId, id)),
    db.select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      stockOnHand: products.stockOnHand,
      commercialCostCents: products.commercialCostCents,
    }).from(products).where(and(
      eq(products.storefront, product.storefront),
      eq(products.type, "standard"),
      isNull(products.archivedAt),
    )).orderBy(asc(products.name)),
  ]);
  const componentById = new Map(componentOptions.map((item) => [item.id, item]));
  const components = componentRows.flatMap((row) => {
    const component = componentById.get(row.componentProductId);
    return component ? [{ ...component, quantity: row.quantity }] : [];
  });
  const domainComponents = components.map((item) => ({
    productId: item.id,
    quantityPerKit: item.quantity,
    stockOnHand: item.stockOnHand,
    commercialUnitCostCents: item.commercialCostCents,
  }));
  const kitSummary = product.type === "kit" ? {
    availability: getKitAvailability(domainComponents),
    materialCostCents: getKitMaterialCostCents(domainComponents),
  } : null;
  return { product, specs, images, components, componentOptions, kitSummary };
}

export async function getWhatsappSettings() {
  if (!process.env.DATABASE_URL) return { configured: false as const, value: "" };
  const [settings] = await getDb().select({ whatsappNumber: siteSettings.whatsappNumber }).from(siteSettings).where(eq(siteSettings.id, "global")).limit(1);
  return { configured: true as const, value: settings?.whatsappNumber ?? "" };
}
