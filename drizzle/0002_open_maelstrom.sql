CREATE TABLE "sale_charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" uuid NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"amount_cents" integer NOT NULL,
	CONSTRAINT "sale_charges_amount_non_negative" CHECK ("sale_charges"."amount_cents" >= 0)
);
--> statement-breakpoint
ALTER TABLE "sale_charges" ADD CONSTRAINT "sale_charges_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sale_charges_sale_idx" ON "sale_charges" USING btree ("sale_id");