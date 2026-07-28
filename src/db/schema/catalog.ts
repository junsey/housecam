import { sql } from "drizzle-orm";
import {
  boolean, check, index, integer, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";

import { productBadge, productType, storefront } from "./enums";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  storefront: storefront("storefront").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  imagePathname: text("image_pathname"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("categories_storefront_slug_uidx").on(table.storefront, table.slug),
  index("categories_public_idx").on(table.storefront, table.isActive, table.sortOrder),
]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").notNull().references(() => categories.id),
  storefront: storefront("storefront").notNull(),
  sku: text("sku").notNull(),
  slug: text("slug").notNull(),
  type: productType("type").notNull().default("standard"),
  name: text("name").notNull(),
  shortDescription: text("short_description"),
  description: text("description"),
  unitPriceCents: integer("unit_price_cents").notNull(),
  pack10PriceCents: integer("pack10_price_cents"),
  commercialCostCents: integer("commercial_cost_cents").notNull(),
  stockOnHand: integer("stock_on_hand").notNull().default(0),
  badge: productBadge("badge"),
  isActive: boolean("is_active").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdByClerkId: text("created_by_clerk_id").notNull(),
  updatedByClerkId: text("updated_by_clerk_id").notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("products_sku_uidx").on(table.sku),
  uniqueIndex("products_storefront_slug_uidx").on(table.storefront, table.slug),
  index("products_public_idx").on(table.storefront, table.isActive, table.sortOrder),
  check("products_prices_non_negative", sql`${table.unitPriceCents} >= 0 and (${table.pack10PriceCents} is null or ${table.pack10PriceCents} >= 0)`),
  check("products_cost_non_negative", sql`${table.commercialCostCents} >= 0`),
  check("products_stock_non_negative", sql`${table.stockOnHand} >= 0`),
  check("products_kit_stock_zero", sql`${table.type} <> 'kit' or ${table.stockOnHand} = 0`),
]);

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id),
  url: text("url").notNull(),
  pathname: text("pathname").notNull(),
  alt: text("alt").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isCover: boolean("is_cover").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("product_images_order_uidx").on(table.productId, table.sortOrder),
]);

export const productSpecs = pgTable("product_specs", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id),
  label: text("label").notNull(),
  value: text("value").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const kitComponents = pgTable("kit_components", {
  kitProductId: uuid("kit_product_id").notNull().references(() => products.id),
  componentProductId: uuid("component_product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
}, (table) => [
  primaryKey({ columns: [table.kitProductId, table.componentProductId] }),
  check("kit_components_positive_quantity", sql`${table.quantity} > 0`),
  check("kit_components_distinct_products", sql`${table.kitProductId} <> ${table.componentProductId}`),
]);
