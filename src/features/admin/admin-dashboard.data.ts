import "server-only";

import { and, eq, isNull, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { categories, products, sales } from "@/db/schema";

export async function getAdminDashboardMetrics() {
  if (!process.env.DATABASE_URL) {
    return {
      configured: false as const,
      productCount: 0,
      categoryCount: 0,
      confirmedSaleCount: 0,
      inventoryUnits: 0,
      balanceCents: 0,
    };
  }

  const db = getDb();
  const [[productMetrics], [categoryMetrics], [saleMetrics]] = await Promise.all([
    db.select({
      count: sql<number>`count(*)::int`,
      inventoryUnits: sql<number>`coalesce(sum(${products.stockOnHand}) filter (where ${products.type} = 'standard'), 0)::int`,
    }).from(products).where(isNull(products.archivedAt)),
    db.select({ count: sql<number>`count(*)::int` })
      .from(categories)
      .where(and(isNull(categories.archivedAt), eq(categories.isActive, true))),
    db.select({
      count: sql<number>`count(*)::int`,
      balanceCents: sql<number>`coalesce(sum(${sales.profitCents}), 0)::int`,
    }).from(sales).where(eq(sales.status, "confirmed")),
  ]);

  return {
    configured: true as const,
    productCount: productMetrics?.count ?? 0,
    categoryCount: categoryMetrics?.count ?? 0,
    confirmedSaleCount: saleMetrics?.count ?? 0,
    inventoryUnits: productMetrics?.inventoryUnits ?? 0,
    balanceCents: saleMetrics?.balanceCents ?? 0,
  };
}
