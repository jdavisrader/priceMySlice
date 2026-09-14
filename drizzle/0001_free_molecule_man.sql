CREATE TABLE "app_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"default_sales_tax_rate" numeric(5, 4) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ALTER COLUMN "section" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cakes" ADD COLUMN "supplies_cost" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "cakes" ADD COLUMN "sales_tax_rate" numeric(5, 4) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "g_per_ml" numeric(8, 4);