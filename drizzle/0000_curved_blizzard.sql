CREATE TABLE "cake_ingredient_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"cake_id" integer NOT NULL,
	"ingredient_name" varchar(255) NOT NULL,
	"quantity" numeric(10, 4) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"price_per_base_unit" numeric(12, 8) NOT NULL,
	"line_total" numeric(10, 4) NOT NULL,
	"section" varchar(100),
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cakes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"recipe_id" integer,
	"servings" integer DEFAULT 1 NOT NULL,
	"labor_cost" numeric(10, 2) DEFAULT '0' NOT NULL,
	"packaging_cost" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_ingredient_cost" numeric(10, 2) NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"markup_multiplier" numeric(5, 2) DEFAULT '3' NOT NULL,
	"suggested_price" numeric(10, 2) NOT NULL,
	"final_price" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"purchase_price" numeric(10, 4) NOT NULL,
	"purchase_quantity" numeric(10, 4) NOT NULL,
	"purchase_unit" varchar(50) NOT NULL,
	"price_per_base_unit" numeric(12, 8) NOT NULL,
	"base_unit" varchar(50) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipe_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"quantity" numeric(10, 4) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"section" varchar(100),
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"servings" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cake_ingredient_snapshots" ADD CONSTRAINT "cake_ingredient_snapshots_cake_id_cakes_id_fk" FOREIGN KEY ("cake_id") REFERENCES "public"."cakes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cakes" ADD CONSTRAINT "cakes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;