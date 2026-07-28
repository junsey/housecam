CREATE TABLE "quote_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"product_id" uuid,
	"label" text NOT NULL,
	"description" text,
	"image_url_snapshot" text,
	"sku_snapshot" text,
	"storefront_snapshot" "storefront",
	"purchase_mode" "purchase_mode",
	"additional_type" text,
	"quantity" integer NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"subtotal_cents" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "quote_items_kind_valid" CHECK ("quote_items"."kind" in ('product', 'additional')),
	CONSTRAINT "quote_items_additional_type_valid" CHECK ("quote_items"."additional_type" is null or "quote_items"."additional_type" in ('installation', 'shipping', 'other')),
	CONSTRAINT "quote_items_quantity_positive" CHECK ("quote_items"."quantity" > 0),
	CONSTRAINT "quote_items_money_non_negative" CHECK ("quote_items"."unit_price_cents" >= 0 and "quote_items"."subtotal_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_number" bigint GENERATED ALWAYS AS IDENTITY (sequence name "quotes_quote_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"code" text,
	"customer_name" text NOT NULL,
	"customer_phone" text,
	"customer_email" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"notes" text,
	"valid_until" timestamp with time zone,
	"total_cents" integer DEFAULT 0 NOT NULL,
	"whatsapp_number_snapshot" text,
	"converted_sale_id" uuid,
	"created_by_clerk_id" text NOT NULL,
	"converted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quotes_total_non_negative" CHECK ("quotes"."total_cents" >= 0),
	CONSTRAINT "quotes_status_valid" CHECK ("quotes"."status" in ('draft', 'sent', 'converted', 'cancelled'))
);
--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quote_items_quote_idx" ON "quote_items" USING btree ("quote_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_number_uidx" ON "quotes" USING btree ("quote_number");--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_code_uidx" ON "quotes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "quotes_status_created_idx" ON "quotes" USING btree ("status","created_at");