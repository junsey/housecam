import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const storefront = pgEnum("storefront", ["housecam", "housepet"]);
export const requestSourceStorefront = pgEnum("request_source_storefront", ["housecam", "housepet", "mixed"]);
export const productType = pgEnum("product_type", ["standard", "kit"]);
export const productBadge = pgEnum("product_badge", ["new", "offer", "recommended", "exclusive"]);
export const purchaseMode = pgEnum("purchase_mode", ["unit", "pack10"]);
export const deliveryMethod = pgEnum("delivery_method", ["pickup_cordoba", "shipping_to_coordinate"]);
export const purchaseRequestStatus = pgEnum("purchase_request_status", ["new", "contacted", "converted", "discarded"]);
export const saleChannel = pgEnum("sale_channel", ["web_request", "whatsapp", "store", "instagram", "mercado_libre", "wholesale", "other"]);
export const saleStatus = pgEnum("sale_status", ["draft", "confirmed", "cancelled", "partially_returned", "returned"]);
export const saleExpenseType = pgEnum("sale_expense_type", ["shipping", "payment_fee", "packaging", "outsourced_installation", "other"]);
export const stockMovementType = pgEnum("stock_movement_type", ["stock_in", "sale_out", "return_in", "correction", "damaged_out", "sale_cancelled_return", "kit_sale_out", "other"]);
export const staticPageSlug = pgEnum("static_page_slug", ["about", "installations", "contact", "privacy", "terms"]);
export const redirectEntityType = pgEnum("redirect_entity_type", ["product", "category", "page"]);
