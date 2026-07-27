import "server-only";

import { asc, desc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db";
import { categories, products } from "@/db/schema";

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
