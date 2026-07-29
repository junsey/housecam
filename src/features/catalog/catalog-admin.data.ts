import "server-only";

import { and, asc, count, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";

import { getDb } from "@/db";
import { categories, kitComponents, productImages, productSpecs, products, siteSettings, stockMovements } from "@/db/schema";

import { getKitAvailability, getKitMaterialCostCents } from "./kit.domain";

export async function getAdminCategories() {
  if (!process.env.DATABASE_URL) return { configured: false as const, items: [] };
  const db = getDb();
  const [categoryItems, usage] = await Promise.all([
    db.select().from(categories).where(isNull(categories.archivedAt))
      .orderBy(asc(categories.storefront), asc(categories.sortOrder), asc(categories.name)),
    db.select({ categoryId: products.categoryId, value: count(products.id) }).from(products)
      .where(isNull(products.archivedAt)).groupBy(products.categoryId),
  ]);
  const usageByCategory = new Map(usage.map((item) => [item.categoryId, item.value]));
  const items = categoryItems.map((item) => ({ ...item, activeProductCount: usageByCategory.get(item.id) ?? 0 }));
  return { configured: true as const, items };
}

export async function getArchivedCategories() {
  if (!process.env.DATABASE_URL) return [];
  return getDb().select().from(categories).where(isNotNull(categories.archivedAt))
    .orderBy(desc(categories.archivedAt), asc(categories.name));
}

export async function getAdminProducts() {
  if (!process.env.DATABASE_URL) return { configured: false as const, items: [] };
  const db = getDb();
  const items = await db
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
  const images = items.length
    ? await db.select({
      productId: productImages.productId,
      url: productImages.url,
      alt: productImages.alt,
      isCover: productImages.isCover,
      sortOrder: productImages.sortOrder,
    }).from(productImages)
      .where(inArray(productImages.productId, items.map((item) => item.id)))
      .orderBy(desc(productImages.isCover), asc(productImages.sortOrder))
    : [];
  return {
    configured: true as const,
    items: items.map((item) => {
      const image = images.find((candidate) => candidate.productId === item.id);
      return { ...item, imageUrl: image?.url ?? null, imageAlt: image?.alt ?? item.name };
    }),
  };
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
  const [specs, images, componentRows, componentOptions, movements] = await Promise.all([
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
    db.select().from(stockMovements).where(eq(stockMovements.productId, id)).orderBy(desc(stockMovements.createdAt)).limit(100),
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
  return { product, specs, images, components, componentOptions, kitSummary, movements };
}

export async function getWhatsappSettings() {
  if (!process.env.DATABASE_URL) return { configured: false as const, value: "" };
  const [settings] = await getDb().select({ whatsappNumber: siteSettings.whatsappNumber }).from(siteSettings).where(eq(siteSettings.id, "global")).limit(1);
  return { configured: true as const, value: settings?.whatsappNumber ?? "" };
}

export async function getGeneralSiteSettings() {
  if (!process.env.DATABASE_URL) {
    return {
      configured: false as const,
      whatsappNumber: "",
      developmentModeEnabled: true,
      homeAppSectionEnabled: true,
      homeAppQrUrl: null,
      homeAppStoreUrl: "",
      homeGooglePlayUrl: "",
    };
  }
  const [settings] = await getDb().select({
    whatsappNumber: siteSettings.whatsappNumber,
    developmentModeEnabled: siteSettings.developmentModeEnabled,
    homeAppSectionEnabled: siteSettings.homeAppSectionEnabled,
    homeAppQrUrl: siteSettings.homeAppQrUrl,
    homeAppStoreUrl: siteSettings.homeAppStoreUrl,
    homeGooglePlayUrl: siteSettings.homeGooglePlayUrl,
  }).from(siteSettings).where(eq(siteSettings.id, "global")).limit(1);
  return {
    configured: true as const,
    whatsappNumber: settings?.whatsappNumber ?? "",
    developmentModeEnabled: settings?.developmentModeEnabled ?? true,
    homeAppSectionEnabled: settings?.homeAppSectionEnabled ?? true,
    homeAppQrUrl: settings?.homeAppQrUrl ?? null,
    homeAppStoreUrl: settings?.homeAppStoreUrl ?? "",
    homeGooglePlayUrl: settings?.homeGooglePlayUrl ?? "",
  };
}

export async function getHomeAppSectionSettings() {
  if (!process.env.DATABASE_URL) {
    return { enabled: true, qrUrl: null, appStoreUrl: "", googlePlayUrl: "" };
  }
  const [settings] = await getDb().select({
    enabled: siteSettings.homeAppSectionEnabled,
    qrUrl: siteSettings.homeAppQrUrl,
    appStoreUrl: siteSettings.homeAppStoreUrl,
    googlePlayUrl: siteSettings.homeGooglePlayUrl,
  }).from(siteSettings).where(eq(siteSettings.id, "global")).limit(1);
  return {
    enabled: settings?.enabled ?? true,
    qrUrl: settings?.qrUrl ?? null,
    appStoreUrl: settings?.appStoreUrl ?? "",
    googlePlayUrl: settings?.googlePlayUrl ?? "",
  };
}

export async function getHomeAppSectionEnabled() {
  return (await getHomeAppSectionSettings()).enabled;
}

export async function getDevelopmentMode() {
  if (!process.env.DATABASE_URL) return true;
  const [settings] = await getDb().select({
    enabled: siteSettings.developmentModeEnabled,
  }).from(siteSettings).where(eq(siteSettings.id, "global")).limit(1);
  return settings?.enabled ?? true;
}
