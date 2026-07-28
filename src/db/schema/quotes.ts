import { sql } from "drizzle-orm";
import { bigint, check, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { products } from "./catalog";
import { purchaseMode, storefront } from "./enums";

export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteNumber: bigint("quote_number", { mode: "number" }).generatedAlwaysAsIdentity(),
  code: text("code"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  status: text("status").notNull().default("draft"),
  notes: text("notes"),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  totalCents: integer("total_cents").notNull().default(0),
  whatsappNumberSnapshot: text("whatsapp_number_snapshot"),
  convertedSaleId: uuid("converted_sale_id"),
  createdByClerkId: text("created_by_clerk_id").notNull(),
  convertedAt: timestamp("converted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("quotes_number_uidx").on(table.quoteNumber),
  uniqueIndex("quotes_code_uidx").on(table.code),
  index("quotes_status_created_idx").on(table.status, table.createdAt),
  check("quotes_total_non_negative", sql`${table.totalCents} >= 0`),
  check("quotes_status_valid", sql`${table.status} in ('draft', 'sent', 'converted', 'cancelled')`),
]);

export const quoteItems = pgTable("quote_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteId: uuid("quote_id").notNull().references(() => quotes.id),
  kind: text("kind").notNull(),
  productId: uuid("product_id").references(() => products.id),
  label: text("label").notNull(),
  description: text("description"),
  imageUrlSnapshot: text("image_url_snapshot"),
  skuSnapshot: text("sku_snapshot"),
  storefrontSnapshot: storefront("storefront_snapshot"),
  purchaseMode: purchaseMode("purchase_mode"),
  additionalType: text("additional_type"),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  subtotalCents: integer("subtotal_cents").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [
  index("quote_items_quote_idx").on(table.quoteId, table.sortOrder),
  check("quote_items_kind_valid", sql`${table.kind} in ('product', 'additional')`),
  check("quote_items_additional_type_valid", sql`${table.additionalType} is null or ${table.additionalType} in ('installation', 'shipping', 'other')`),
  check("quote_items_quantity_positive", sql`${table.quantity} > 0`),
  check("quote_items_money_non_negative", sql`${table.unitPriceCents} >= 0 and ${table.subtotalCents} >= 0`),
]);
