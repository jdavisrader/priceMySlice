import {
  pgTable,
  serial,
  varchar,
  numeric,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core'

export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  purchasePrice: numeric('purchase_price', { precision: 10, scale: 4 }).notNull(),
  purchaseQuantity: numeric('purchase_quantity', { precision: 10, scale: 4 }).notNull(),
  purchaseUnit: varchar('purchase_unit', { length: 50 }).notNull(),
  pricePerBaseUnit: numeric('price_per_base_unit', { precision: 12, scale: 8 }).notNull(),
  baseUnit: varchar('base_unit', { length: 50 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  servings: integer('servings').notNull().default(1),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const recipeIngredients = pgTable('recipe_ingredients', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id')
    .notNull()
    .references(() => recipes.id, { onDelete: 'cascade' }),
  ingredientId: integer('ingredient_id')
    .notNull()
    .references(() => ingredients.id),
  quantity: numeric('quantity', { precision: 10, scale: 4 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  section: varchar('section', { length: 100 }),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const cakes = pgTable('cakes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  recipeId: integer('recipe_id').references(() => recipes.id),
  servings: integer('servings').notNull().default(1),
  laborCost: numeric('labor_cost', { precision: 10, scale: 2 }).notNull().default('0'),
  packagingCost: numeric('packaging_cost', { precision: 10, scale: 2 }).notNull().default('0'),
  suppliesCost: numeric('supplies_cost', { precision: 10, scale: 2 }).notNull().default('0'),
  salesTaxRate: numeric('sales_tax_rate', { precision: 5, scale: 4 }).notNull().default('0'),
  totalIngredientCost: numeric('total_ingredient_cost', { precision: 10, scale: 2 }).notNull(),
  totalCost: numeric('total_cost', { precision: 10, scale: 2 }).notNull(),
  markupMultiplier: numeric('markup_multiplier', { precision: 5, scale: 2 }).notNull().default('3'),
  suggestedPrice: numeric('suggested_price', { precision: 10, scale: 2 }).notNull(),
  finalPrice: numeric('final_price', { precision: 10, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const appSettings = pgTable('app_settings', {
  id: serial('id').primaryKey(),
  defaultSalesTaxRate: numeric('default_sales_tax_rate', { precision: 5, scale: 4 }).notNull().default('0'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const cakeIngredientSnapshots = pgTable('cake_ingredient_snapshots', {
  id: serial('id').primaryKey(),
  cakeId: integer('cake_id')
    .notNull()
    .references(() => cakes.id, { onDelete: 'cascade' }),
  ingredientName: varchar('ingredient_name', { length: 255 }).notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 4 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  pricePerBaseUnit: numeric('price_per_base_unit', { precision: 12, scale: 8 }).notNull(),
  lineTotal: numeric('line_total', { precision: 10, scale: 4 }).notNull(),
  section: varchar('section', { length: 100 }),
  sortOrder: integer('sort_order').notNull().default(0),
})
