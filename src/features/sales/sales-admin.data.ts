import "server-only";

import { and, asc, desc, eq, isNotNull, isNull, ne, sql } from "drizzle-orm";

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
  const required = new Map<string, number>();
  const componentsByItem = new Map<string, typeof components>();
  for (const component of components) {
    componentsByItem.set(component.saleItemId, [...(componentsByItem.get(component.saleItemId) ?? []), component]);
  }
  for (const item of items) {
    const itemComponents = componentsByItem.get(item.id) ?? [];
    if (itemComponents.length) {
      for (const component of itemComponents) {
        if (component.componentProductId) {
          required.set(component.componentProductId, (required.get(component.componentProductId) ?? 0) + component.physicalUnits);
        }
      }
    } else {
      required.set(item.productId, (required.get(item.productId) ?? 0) + item.physicalUnits);
    }
  }
  const requiredIds = [...required.keys()];
  const stockProducts = requiredIds.length
    ? await db.select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      stockOnHand: products.stockOnHand,
    }).from(products).where(sql`${products.id} in (${sql.join(requiredIds.map((productId) => sql`${productId}`), sql`, `)})`)
    : [];
  const stockByProduct = new Map(stockProducts.map((product) => [product.id, product]));
  const stockShortages = requiredIds.flatMap((productId) => {
    const product = stockByProduct.get(productId);
    const requiredUnits = required.get(productId) ?? 0;
    const availableUnits = product?.stockOnHand ?? 0;
    return availableUnits < requiredUnits
      ? [{
        productId,
        name: product?.name ?? "Producto no disponible",
        sku: product?.sku ?? "",
        requiredUnits,
        availableUnits,
        missingUnits: requiredUnits - availableUnits,
      }]
      : [];
  });
  return { sale, items, expenses, charges, components, stockShortages };
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

const buenosAiresTimezone = "America/Argentina/Buenos_Aires";

export async function getMonthlySalesHistory(requestedMonth?: string) {
  if (!process.env.DATABASE_URL) {
    return {
      configured: false as const,
      selectedMonth: requestedMonth ?? "",
      months: [],
      summary: null,
      products: [],
      sales: [],
    };
  }

  const db = getDb();
  const monthExpression = sql<string>`to_char(${sales.confirmedAt} at time zone 'America/Argentina/Buenos_Aires', 'YYYY-MM')`;
  const months = await db.select({
    month: monthExpression,
    saleCount: sql<number>`count(*)::int`,
    revenueCents: sql<number>`coalesce(sum(${sales.finalTotalCents}), 0)::int`,
    profitCents: sql<number>`coalesce(sum(${sales.profitCents}), 0)::int`,
  })
    .from(sales)
    .where(and(eq(sales.status, "confirmed"), isNotNull(sales.confirmedAt)))
    .groupBy(monthExpression)
    .orderBy(desc(monthExpression));

  const normalizedRequestedMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth ?? "")
    ? requestedMonth!
    : undefined;
  const selectedMonth = normalizedRequestedMonth ?? months[0]?.month ?? getCurrentBuenosAiresMonth();

  const selectedMonthCondition = and(
    eq(sales.status, "confirmed"),
    isNotNull(sales.confirmedAt),
    sql`${monthExpression} = ${selectedMonth}`,
  );

  const [[summary], selectedSales, soldProducts] = await Promise.all([
    db.select({
      saleCount: sql<number>`count(*)::int`,
      revenueCents: sql<number>`coalesce(sum(${sales.finalTotalCents}), 0)::int`,
      listedCents: sql<number>`coalesce(sum(${sales.listedTotalCents}), 0)::int`,
      discountCents: sql<number>`coalesce(sum(${sales.discountTotalCents}), 0)::int`,
      productCostCents: sql<number>`coalesce(sum(${sales.productCostTotalCents}), 0)::int`,
      expenseCents: sql<number>`coalesce(sum(${sales.expenseTotalCents}), 0)::int`,
      profitCents: sql<number>`coalesce(sum(${sales.profitCents}), 0)::int`,
    }).from(sales).where(selectedMonthCondition),
    db.select().from(sales)
      .where(selectedMonthCondition)
      .orderBy(desc(sales.confirmedAt)),
    db.select({
      productName: saleItems.productNameSnapshot,
      sku: saleItems.skuSnapshot,
      storefront: saleItems.storefrontSnapshot,
      quantity: sql<number>`coalesce(sum(${saleItems.quantity}), 0)::int`,
      physicalUnits: sql<number>`coalesce(sum(${saleItems.physicalUnits}), 0)::int`,
      revenueCents: sql<number>`coalesce(sum(${saleItems.finalSubtotalCents}), 0)::int`,
      historicalCostCents: sql<number>`coalesce(sum(${saleItems.historicalCostSubtotalCents}), 0)::int`,
    })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(selectedMonthCondition)
      .groupBy(
        saleItems.productNameSnapshot,
        saleItems.skuSnapshot,
        saleItems.storefrontSnapshot,
      )
      .orderBy(desc(sql`sum(${saleItems.finalSubtotalCents})`), asc(saleItems.productNameSnapshot)),
  ]);

  return {
    configured: true as const,
    selectedMonth,
    months,
    summary: summary ?? {
      saleCount: 0,
      revenueCents: 0,
      listedCents: 0,
      discountCents: 0,
      productCostCents: 0,
      expenseCents: 0,
      profitCents: 0,
    },
    products: soldProducts,
    sales: selectedSales,
  };
}

function getCurrentBuenosAiresMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: buenosAiresTimezone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}
