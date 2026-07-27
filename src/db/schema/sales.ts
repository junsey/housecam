import { sql } from "drizzle-orm";
import { bigint, check, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { products } from "./catalog";
import { purchaseMode, saleChannel, saleExpenseType, saleStatus, storefront } from "./enums";
import { purchaseRequests } from "./purchase-requests";
import { userProfiles } from "./users";

export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleNumber: bigint("sale_number", { mode: "number" }).generatedAlwaysAsIdentity(),
  code: text("code"),
  purchaseRequestId: uuid("purchase_request_id").references(() => purchaseRequests.id),
  customerProfileId: uuid("customer_profile_id").references(() => userProfiles.id),
  customerSnapshot: jsonb("customer_snapshot").$type<Record<string, unknown>>(),
  customerLabel: text("customer_label"),
  channel: saleChannel("channel").notNull(),
  status: saleStatus("status").notNull().default("draft"),
  listedTotalCents: integer("listed_total_cents").notNull().default(0),
  discountTotalCents: integer("discount_total_cents").notNull().default(0),
  finalTotalCents: integer("final_total_cents").notNull().default(0),
  productCostTotalCents: integer("product_cost_total_cents").notNull().default(0),
  expenseTotalCents: integer("expense_total_cents").notNull().default(0),
  profitCents: integer("profit_cents").notNull().default(0),
  notes: text("notes"),
  createdByClerkId: text("created_by_clerk_id").notNull(),
  confirmedByClerkId: text("confirmed_by_clerk_id"),
  cancelledByClerkId: text("cancelled_by_clerk_id"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("sales_number_uidx").on(table.saleNumber),
  uniqueIndex("sales_code_uidx").on(table.code),
  index("sales_status_created_idx").on(table.status, table.createdAt),
  check("sales_totals_non_negative", sql`${table.listedTotalCents} >= 0 and ${table.discountTotalCents} >= 0 and ${table.finalTotalCents} >= 0 and ${table.productCostTotalCents} >= 0 and ${table.expenseTotalCents} >= 0`),
]);

export const saleItems = pgTable("sale_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleId: uuid("sale_id").notNull().references(() => sales.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  skuSnapshot: text("sku_snapshot").notNull(),
  storefrontSnapshot: storefront("storefront_snapshot").notNull(),
  purchaseMode: purchaseMode("purchase_mode").notNull(),
  quantity: integer("quantity").notNull(),
  physicalUnits: integer("physical_units").notNull(),
  listedUnitPriceCents: integer("listed_unit_price_cents").notNull(),
  finalUnitPriceCents: integer("final_unit_price_cents").notNull(),
  historicalUnitCostCents: integer("historical_unit_cost_cents").notNull(),
  listedSubtotalCents: integer("listed_subtotal_cents").notNull(),
  finalSubtotalCents: integer("final_subtotal_cents").notNull(),
  historicalCostSubtotalCents: integer("historical_cost_subtotal_cents").notNull(),
}, (table) => [
  index("sale_items_sale_idx").on(table.saleId),
  check("sale_items_quantities_positive", sql`${table.quantity} > 0 and ${table.physicalUnits} > 0`),
  check("sale_items_money_non_negative", sql`${table.listedUnitPriceCents} >= 0 and ${table.finalUnitPriceCents} >= 0 and ${table.historicalUnitCostCents} >= 0`),
]);

export const saleItemComponents = pgTable("sale_item_components", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleItemId: uuid("sale_item_id").notNull().references(() => saleItems.id),
  componentProductId: uuid("component_product_id").references(() => products.id),
  componentNameSnapshot: text("component_name_snapshot").notNull(),
  componentSkuSnapshot: text("component_sku_snapshot").notNull(),
  physicalUnits: integer("physical_units").notNull(),
  historicalUnitCostCents: integer("historical_unit_cost_cents").notNull(),
  historicalCostSubtotalCents: integer("historical_cost_subtotal_cents").notNull(),
}, (table) => [
  index("sale_item_components_item_idx").on(table.saleItemId),
  check("sale_item_components_positive_units", sql`${table.physicalUnits} > 0`),
  check("sale_item_components_money_non_negative", sql`${table.historicalUnitCostCents} >= 0 and ${table.historicalCostSubtotalCents} >= 0`),
]);

export const saleExpenses = pgTable("sale_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleId: uuid("sale_id").notNull().references(() => sales.id),
  type: saleExpenseType("type").notNull(),
  description: text("description"),
  amountCents: integer("amount_cents").notNull(),
}, (table) => [
  index("sale_expenses_sale_idx").on(table.saleId),
  check("sale_expenses_amount_non_negative", sql`${table.amountCents} >= 0`),
]);
