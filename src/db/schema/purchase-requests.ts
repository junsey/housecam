import { sql } from "drizzle-orm";
import { bigint, check, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { deliveryMethod, purchaseMode, purchaseRequestStatus, requestSourceStorefront, storefront } from "./enums";
import { products } from "./catalog";
import { userProfiles } from "./users";

export const purchaseRequests = pgTable("purchase_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestNumber: bigint("request_number", { mode: "number" }).generatedAlwaysAsIdentity(),
  code: text("code"),
  publicToken: text("public_token").notNull(),
  userProfileId: uuid("user_profile_id").references(() => userProfiles.id),
  customerSnapshot: jsonb("customer_snapshot").$type<Record<string, unknown>>().notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  dniCuit: text("dni_cuit"),
  sourceStorefront: requestSourceStorefront("source_storefront").notNull(),
  deliveryMethod: deliveryMethod("delivery_method").notNull(),
  deliveryNotes: text("delivery_notes"),
  status: purchaseRequestStatus("status").notNull().default("new"),
  listedTotalCents: integer("listed_total_cents").notNull(),
  whatsappNumberSnapshot: text("whatsapp_number_snapshot").notNull(),
  whatsappMessageSnapshot: text("whatsapp_message_snapshot").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("purchase_requests_number_uidx").on(table.requestNumber),
  uniqueIndex("purchase_requests_code_uidx").on(table.code),
  uniqueIndex("purchase_requests_public_token_uidx").on(table.publicToken),
  index("purchase_requests_status_created_idx").on(table.status, table.createdAt),
  check("purchase_requests_total_non_negative", sql`${table.listedTotalCents} >= 0`),
]);

export const purchaseRequestItems = pgTable("purchase_request_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseRequestId: uuid("purchase_request_id").notNull().references(() => purchaseRequests.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  skuSnapshot: text("sku_snapshot").notNull(),
  storefrontSnapshot: storefront("storefront_snapshot").notNull(),
  purchaseMode: purchaseMode("purchase_mode").notNull(),
  quantity: integer("quantity").notNull(),
  physicalUnits: integer("physical_units").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  subtotalCents: integer("subtotal_cents").notNull(),
}, (table) => [
  index("purchase_request_items_request_idx").on(table.purchaseRequestId),
  check("purchase_request_items_quantities_positive", sql`${table.quantity} > 0 and ${table.physicalUnits} > 0`),
  check("purchase_request_items_money_non_negative", sql`${table.unitPriceCents} >= 0 and ${table.subtotalCents} >= 0`),
]);
