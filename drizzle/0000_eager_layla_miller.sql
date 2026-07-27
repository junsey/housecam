CREATE TYPE "public"."delivery_method" AS ENUM('pickup_cordoba', 'shipping_to_coordinate');--> statement-breakpoint
CREATE TYPE "public"."product_badge" AS ENUM('new', 'offer', 'recommended', 'exclusive');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('standard', 'kit');--> statement-breakpoint
CREATE TYPE "public"."purchase_mode" AS ENUM('unit', 'pack10');--> statement-breakpoint
CREATE TYPE "public"."purchase_request_status" AS ENUM('new', 'contacted', 'converted', 'discarded');--> statement-breakpoint
CREATE TYPE "public"."redirect_entity_type" AS ENUM('product', 'category', 'page');--> statement-breakpoint
CREATE TYPE "public"."request_source_storefront" AS ENUM('housecam', 'housepet', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."sale_channel" AS ENUM('web_request', 'whatsapp', 'store', 'instagram', 'mercado_libre', 'wholesale', 'other');--> statement-breakpoint
CREATE TYPE "public"."sale_expense_type" AS ENUM('shipping', 'payment_fee', 'packaging', 'outsourced_installation', 'other');--> statement-breakpoint
CREATE TYPE "public"."sale_status" AS ENUM('draft', 'confirmed', 'cancelled', 'partially_returned', 'returned');--> statement-breakpoint
CREATE TYPE "public"."static_page_slug" AS ENUM('about', 'installations', 'contact', 'privacy', 'terms');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_type" AS ENUM('stock_in', 'sale_out', 'return_in', 'correction', 'damaged_out', 'sale_cancelled_return', 'kit_sale_out', 'other');--> statement-breakpoint
CREATE TYPE "public"."storefront" AS ENUM('housecam', 'housepet');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_clerk_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storefront" "storefront" NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image_url" text,
	"image_pathname" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kit_components" (
	"kit_product_id" uuid NOT NULL,
	"component_product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "kit_components_kit_product_id_component_product_id_pk" PRIMARY KEY("kit_product_id","component_product_id"),
	CONSTRAINT "kit_components_positive_quantity" CHECK ("kit_components"."quantity" > 0),
	CONSTRAINT "kit_components_distinct_products" CHECK ("kit_components"."kit_product_id" <> "kit_components"."component_product_id")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"pathname" text NOT NULL,
	"alt" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_specs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"storefront" "storefront" NOT NULL,
	"sku" text NOT NULL,
	"slug" text NOT NULL,
	"type" "product_type" DEFAULT 'standard' NOT NULL,
	"name" text NOT NULL,
	"short_description" text,
	"description" text,
	"unit_price_cents" integer NOT NULL,
	"pack10_price_cents" integer,
	"commercial_cost_cents" integer NOT NULL,
	"stock_on_hand" integer DEFAULT 0 NOT NULL,
	"badge" "product_badge",
	"is_active" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_by_clerk_id" text NOT NULL,
	"updated_by_clerk_id" text NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_prices_non_negative" CHECK ("products"."unit_price_cents" >= 0 and ("products"."pack10_price_cents" is null or "products"."pack10_price_cents" >= 0)),
	CONSTRAINT "products_cost_non_negative" CHECK ("products"."commercial_cost_cents" >= 0),
	CONSTRAINT "products_stock_non_negative" CHECK ("products"."stock_on_hand" >= 0),
	CONSTRAINT "products_kit_stock_zero" CHECK ("products"."type" <> 'kit' or "products"."stock_on_hand" = 0)
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storefront" "storefront",
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'global' NOT NULL,
	"business_name" text DEFAULT 'HouseCam' NOT NULL,
	"whatsapp_number" text NOT NULL,
	"pickup_address" text,
	"instagram_url" text,
	"facebook_url" text,
	"default_seo_title" text DEFAULT 'HouseCam' NOT NULL,
	"default_seo_description" text DEFAULT 'Seguridad y tranquilidad para tu hogar.' NOT NULL,
	"timezone" text DEFAULT 'America/Argentina/Cordoba' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slug_redirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"old_path" text NOT NULL,
	"new_path" text NOT NULL,
	"storefront" "storefront" NOT NULL,
	"entity_type" "redirect_entity_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "static_pages" (
	"slug" "static_page_slug" PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content_markdown" text NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storefront_content" (
	"storefront" "storefront" PRIMARY KEY NOT NULL,
	"hero_title" text NOT NULL,
	"hero_description" text NOT NULL,
	"sections" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sale_id" uuid,
	"type" "stock_movement_type" NOT NULL,
	"delta" integer NOT NULL,
	"stock_before" integer NOT NULL,
	"stock_after" integer NOT NULL,
	"note" text,
	"actor_clerk_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_movements_stock_non_negative" CHECK ("stock_movements"."stock_after" >= 0),
	CONSTRAINT "stock_movements_math" CHECK ("stock_movements"."stock_after" = "stock_movements"."stock_before" + "stock_movements"."delta")
);
--> statement-breakpoint
CREATE TABLE "purchase_request_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_request_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name_snapshot" text NOT NULL,
	"sku_snapshot" text NOT NULL,
	"storefront_snapshot" "storefront" NOT NULL,
	"purchase_mode" "purchase_mode" NOT NULL,
	"quantity" integer NOT NULL,
	"physical_units" integer NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"subtotal_cents" integer NOT NULL,
	CONSTRAINT "purchase_request_items_quantities_positive" CHECK ("purchase_request_items"."quantity" > 0 and "purchase_request_items"."physical_units" > 0),
	CONSTRAINT "purchase_request_items_money_non_negative" CHECK ("purchase_request_items"."unit_price_cents" >= 0 and "purchase_request_items"."subtotal_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "purchase_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_number" bigint GENERATED ALWAYS AS IDENTITY (sequence name "purchase_requests_request_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"code" text,
	"public_token" text NOT NULL,
	"user_profile_id" uuid,
	"customer_snapshot" jsonb NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"dni_cuit" text,
	"source_storefront" "request_source_storefront" NOT NULL,
	"delivery_method" "delivery_method" NOT NULL,
	"delivery_notes" text,
	"status" "purchase_request_status" DEFAULT 'new' NOT NULL,
	"listed_total_cents" integer NOT NULL,
	"whatsapp_number_snapshot" text NOT NULL,
	"whatsapp_message_snapshot" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_requests_total_non_negative" CHECK ("purchase_requests"."listed_total_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sale_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" uuid NOT NULL,
	"type" "sale_expense_type" NOT NULL,
	"description" text,
	"amount_cents" integer NOT NULL,
	CONSTRAINT "sale_expenses_amount_non_negative" CHECK ("sale_expenses"."amount_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sale_item_components" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_item_id" uuid NOT NULL,
	"component_product_id" uuid,
	"component_name_snapshot" text NOT NULL,
	"component_sku_snapshot" text NOT NULL,
	"physical_units" integer NOT NULL,
	"historical_unit_cost_cents" integer NOT NULL,
	"historical_cost_subtotal_cents" integer NOT NULL,
	CONSTRAINT "sale_item_components_positive_units" CHECK ("sale_item_components"."physical_units" > 0),
	CONSTRAINT "sale_item_components_money_non_negative" CHECK ("sale_item_components"."historical_unit_cost_cents" >= 0 and "sale_item_components"."historical_cost_subtotal_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name_snapshot" text NOT NULL,
	"sku_snapshot" text NOT NULL,
	"storefront_snapshot" "storefront" NOT NULL,
	"purchase_mode" "purchase_mode" NOT NULL,
	"quantity" integer NOT NULL,
	"physical_units" integer NOT NULL,
	"listed_unit_price_cents" integer NOT NULL,
	"final_unit_price_cents" integer NOT NULL,
	"historical_unit_cost_cents" integer NOT NULL,
	"listed_subtotal_cents" integer NOT NULL,
	"final_subtotal_cents" integer NOT NULL,
	"historical_cost_subtotal_cents" integer NOT NULL,
	CONSTRAINT "sale_items_quantities_positive" CHECK ("sale_items"."quantity" > 0 and "sale_items"."physical_units" > 0),
	CONSTRAINT "sale_items_money_non_negative" CHECK ("sale_items"."listed_unit_price_cents" >= 0 and "sale_items"."final_unit_price_cents" >= 0 and "sale_items"."historical_unit_cost_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_number" bigint GENERATED ALWAYS AS IDENTITY (sequence name "sales_sale_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"code" text,
	"purchase_request_id" uuid,
	"customer_profile_id" uuid,
	"customer_snapshot" jsonb,
	"customer_label" text,
	"channel" "sale_channel" NOT NULL,
	"status" "sale_status" DEFAULT 'draft' NOT NULL,
	"listed_total_cents" integer DEFAULT 0 NOT NULL,
	"discount_total_cents" integer DEFAULT 0 NOT NULL,
	"final_total_cents" integer DEFAULT 0 NOT NULL,
	"product_cost_total_cents" integer DEFAULT 0 NOT NULL,
	"expense_total_cents" integer DEFAULT 0 NOT NULL,
	"profit_cents" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_by_clerk_id" text NOT NULL,
	"confirmed_by_clerk_id" text,
	"cancelled_by_clerk_id" text,
	"confirmed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sales_totals_non_negative" CHECK ("sales"."listed_total_cents" >= 0 and "sales"."discount_total_cents" >= 0 and "sales"."final_total_cents" >= 0 and "sales"."product_cost_total_cents" >= 0 and "sales"."expense_total_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"normalized_email" text NOT NULL,
	"phone" text,
	"dni_cuit" text,
	"address_line_1" text,
	"address_line_2" text,
	"city" text,
	"province" text,
	"postal_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kit_components" ADD CONSTRAINT "kit_components_kit_product_id_products_id_fk" FOREIGN KEY ("kit_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kit_components" ADD CONSTRAINT "kit_components_component_product_id_products_id_fk" FOREIGN KEY ("component_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_purchase_request_id_purchase_requests_id_fk" FOREIGN KEY ("purchase_request_id") REFERENCES "public"."purchase_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_user_profile_id_user_profiles_id_fk" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_expenses" ADD CONSTRAINT "sale_expenses_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_item_components" ADD CONSTRAINT "sale_item_components_sale_item_id_sale_items_id_fk" FOREIGN KEY ("sale_item_id") REFERENCES "public"."sale_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_item_components" ADD CONSTRAINT "sale_item_components_component_product_id_products_id_fk" FOREIGN KEY ("component_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_purchase_request_id_purchase_requests_id_fk" FOREIGN KEY ("purchase_request_id") REFERENCES "public"."purchase_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_profile_id_user_profiles_id_fk" FOREIGN KEY ("customer_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_storefront_slug_uidx" ON "categories" USING btree ("storefront","slug");--> statement-breakpoint
CREATE INDEX "categories_public_idx" ON "categories" USING btree ("storefront","is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "product_images_order_uidx" ON "product_images" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "products_sku_uidx" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "products_storefront_slug_uidx" ON "products" USING btree ("storefront","slug");--> statement-breakpoint
CREATE INDEX "products_public_idx" ON "products" USING btree ("storefront","is_active","sort_order");--> statement-breakpoint
CREATE INDEX "faqs_public_idx" ON "faqs" USING btree ("storefront","is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "slug_redirects_old_path_uidx" ON "slug_redirects" USING btree ("old_path");--> statement-breakpoint
CREATE INDEX "stock_movements_product_created_idx" ON "stock_movements" USING btree ("product_id","created_at");--> statement-breakpoint
CREATE INDEX "stock_movements_sale_idx" ON "stock_movements" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "purchase_request_items_request_idx" ON "purchase_request_items" USING btree ("purchase_request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_requests_number_uidx" ON "purchase_requests" USING btree ("request_number");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_requests_code_uidx" ON "purchase_requests" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_requests_public_token_uidx" ON "purchase_requests" USING btree ("public_token");--> statement-breakpoint
CREATE INDEX "purchase_requests_status_created_idx" ON "purchase_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "sale_expenses_sale_idx" ON "sale_expenses" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sale_item_components_item_idx" ON "sale_item_components" USING btree ("sale_item_id");--> statement-breakpoint
CREATE INDEX "sale_items_sale_idx" ON "sale_items" USING btree ("sale_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sales_number_uidx" ON "sales" USING btree ("sale_number");--> statement-breakpoint
CREATE UNIQUE INDEX "sales_code_uidx" ON "sales" USING btree ("code");--> statement-breakpoint
CREATE INDEX "sales_status_created_idx" ON "sales" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_profiles_clerk_user_id_uidx" ON "user_profiles" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "user_profiles_normalized_email_idx" ON "user_profiles" USING btree ("normalized_email");--> statement-breakpoint
CREATE UNIQUE INDEX "product_images_one_cover_uidx" ON "product_images" ("product_id") WHERE "is_cover" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "sales_one_confirmed_per_request_uidx" ON "sales" ("purchase_request_id")
  WHERE "purchase_request_id" IS NOT NULL AND "status" IN ('confirmed', 'partially_returned', 'returned');--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_single_row" CHECK ("id" = 'global');--> statement-breakpoint
CREATE OR REPLACE FUNCTION set_purchase_request_code() RETURNS trigger AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := CASE NEW.source_storefront
      WHEN 'housecam' THEN 'HC'
      WHEN 'housepet' THEN 'HP'
      ELSE 'MX'
    END || '-' || lpad(NEW.request_number::text, 8, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER purchase_requests_set_code
  BEFORE INSERT ON "purchase_requests"
  FOR EACH ROW EXECUTE FUNCTION set_purchase_request_code();--> statement-breakpoint
CREATE OR REPLACE FUNCTION enforce_product_category_storefront() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM categories
    WHERE id = NEW.category_id AND storefront = NEW.storefront
  ) THEN
    RAISE EXCEPTION 'Product and category storefront must match';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER products_category_storefront
  BEFORE INSERT OR UPDATE OF category_id, storefront ON "products"
  FOR EACH ROW EXECUTE FUNCTION enforce_product_category_storefront();--> statement-breakpoint
CREATE OR REPLACE FUNCTION enforce_kit_component_rules() RETURNS trigger AS $$
DECLARE parent_type product_type;
DECLARE parent_store storefront;
DECLARE child_type product_type;
DECLARE child_store storefront;
BEGIN
  SELECT type, storefront INTO parent_type, parent_store FROM products WHERE id = NEW.kit_product_id;
  SELECT type, storefront INTO child_type, child_store FROM products WHERE id = NEW.component_product_id;
  IF parent_type <> 'kit' OR child_type <> 'standard' OR parent_store <> child_store THEN
    RAISE EXCEPTION 'Kit parent, standard component and matching storefront are required';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER kit_components_validate
  BEFORE INSERT OR UPDATE ON "kit_components"
  FOR EACH ROW EXECUTE FUNCTION enforce_kit_component_rules();
