import "server-only";

import { asc, desc, eq, isNull, ne, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { products, saleCharges, saleExpenses, saleItemComponents, saleItems, sales } from "@/db/schema";

export async function getSalesDashboard(showCancelled = false) {
  if (!process.env.DATABASE_URL) return { configured: false as const, sales: [], metrics: null };
  const db = getDb();
  const [items, [metrics]] = await Promise.all([
    db.select().from(sales)
      .where(showCancelled ? eq(sales.status, "cancelled") : ne(sales.status, "cancelled"))
      .orderBy(desc(sales.createdAt))
      .limit(100),
    db.select({
      confirmedCount: sql<number>`count(*) filter (where ${sales.status} = 'confirmed')::int`,
      revenueCents: sql<number>`coalesce(sum(${sales.finalTotalCents}) filter (where ${sales.status} = 'confirmed'), 0)::int`,
      profitCents: sql<number>`coalesce(sum(${sales.profitCents}) filter (where ${sales.status} = 'confirmed'), 0)::int`,
      draftCount: sql<number>`count(*) filter (where ${sales.status} = 'draft')::int`,
      cancelledCount: sql<number>`count(*) filter (where ${sales.status} = 'cancelled')::int`,
    }).from(sales),
  ]);
  return { configured: true as const, sales: items, metrics };
}

export async function getAdminSale(id: string) {
  if (!process.env.DATABASE_URL) return null;
  const db = getDb();
  const [sale] = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
  if (!sale) return null;
  const [items, expenses, charges] = await Promise.all([
    db.select().from(saleItems).where(eq(saleItems.saleId, id)).orderBy(asc(saleItems.productNameSnapshot)),
    db.select().from(saleExpenses).where(eq(saleExpenses.saleId, id)).orderBy(asc(saleExpenses.type)),
    db.select().from(saleCharges).where(eq(saleCharges.saleId, id)).orderBy(asc(saleCharges.type)),
  ]);
  const components = items.length
    ? await db.select().from(saleItemComponents).where(sql`${saleItemComponents.saleItemId} in (${sql.join(items.map((item) => sql`${item.id}`), sql`, `)})`)
    : [];
  return { sale, items, expenses, charges, components };
}

export async function getSaleProductOptions() {
  if (!process.env.DATABASE_URL) return [];
  return getDb().select({
    id: products.id,
    name: products.name,
    sku: products.sku,
    type: products.type,
    storefront: products.storefront,
    unitPriceCents: products.unitPriceCents,
    pack10PriceCents: products.pack10PriceCents,
  }).from(products).where(isNull(products.archivedAt)).orderBy(asc(products.storefront), asc(products.name));
}
