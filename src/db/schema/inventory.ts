import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { products } from "./catalog";
import { stockMovementType } from "./enums";
import { sales } from "./sales";

export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id),
  saleId: uuid("sale_id").references(() => sales.id),
  type: stockMovementType("type").notNull(),
  delta: integer("delta").notNull(),
  stockBefore: integer("stock_before").notNull(),
  stockAfter: integer("stock_after").notNull(),
  note: text("note"),
  actorClerkId: text("actor_clerk_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("stock_movements_product_created_idx").on(table.productId, table.createdAt),
  index("stock_movements_sale_idx").on(table.saleId),
  check("stock_movements_stock_non_negative", sql`${table.stockAfter} >= 0`),
  check("stock_movements_math", sql`${table.stockAfter} = ${table.stockBefore} + ${table.delta}`),
]);
