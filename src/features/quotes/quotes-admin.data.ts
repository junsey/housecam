import "server-only";

import { asc, desc, eq, isNull, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { productImages, products, quoteItems, quotes, siteSettings } from "@/db/schema";

export async function getQuotes() {
  if (!process.env.DATABASE_URL) return [];
  return getDb().select().from(quotes).orderBy(desc(quotes.createdAt)).limit(100);
}

export async function getQuote(id: string) {
  if (!process.env.DATABASE_URL) return null;
  const db = getDb();
  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  if (!quote) return null;
  const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, id)).orderBy(asc(quoteItems.sortOrder));
  return { quote, items };
}

export async function getQuoteFormData() {
  if (!process.env.DATABASE_URL) return { products: [], whatsappNumber: "" };
  const db = getDb();
  const [items, [settings]] = await Promise.all([
    db.select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      storefront: products.storefront,
      unitPriceCents: products.unitPriceCents,
      pack10PriceCents: products.pack10PriceCents,
      stockOnHand: products.stockOnHand,
      imageUrl: sql<string | null>`(
        select ${productImages.url} from ${productImages}
        where ${productImages.productId} = ${products.id}
        order by ${productImages.isCover} desc, ${productImages.sortOrder} asc limit 1
      )`,
    }).from(products).where(isNull(products.archivedAt)).orderBy(asc(products.storefront), asc(products.name)),
    db.select({ whatsappNumber: siteSettings.whatsappNumber }).from(siteSettings).limit(1),
  ]);
  return { products: items, whatsappNumber: settings?.whatsappNumber ?? "" };
}
