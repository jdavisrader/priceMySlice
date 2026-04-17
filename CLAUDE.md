# priceMySlice — Project Instructions

## What This Is
A web app for pricing custom cakes. The primary user is non-technical — keep UI clean, simple, and self-explanatory. It replaces manual ingredient cost calculation for a home cake business.

## Tech Stack
- **Framework:** Next.js (App Router), TypeScript
- **Database:** PostgreSQL + Drizzle ORM
- **UI:** shadcn/ui + Lucide icons + Tailwind CSS
- **Font:** Outfit (Google Fonts)
- **Hosting:** Self-hosted private server, single user, no auth

## Project Structure
```
src/
  app/                    # Next.js App Router pages
    page.tsx              # Dashboard
    ingredients/          # Ingredient library
    recipes/              # Recipe management
    cakes/                # Cake history + new pricing
  components/
    layout/               # Sidebar, nav
    ui/                   # shadcn components (do not edit manually)
  db/
    schema.ts             # Drizzle schema — source of truth for data model
    index.ts              # DB connection pool
  server/
    actions/              # Next.js Server Actions (no separate API layer)
      ingredients.ts
      recipes.ts
      cakes.ts
  lib/
    utils.ts              # shadcn utils + unit conversion helpers
```

## Database Schema (4 tables)
- **ingredients** — name, purchase price/quantity/unit, computed price_per_base_unit, base_unit
- **recipes** — name, description, servings, notes
- **recipe_ingredients** — join: recipe ↔ ingredient with quantity + unit
- **cakes** — saved pricing run: ingredient cost + labor + packaging + markup → suggested & final price
- **cake_ingredient_snapshots** — price snapshot at time of calculation (preserves history accuracy)

## Unit Conversion Rules
- Supported within same dimension only: weight (g/kg/oz/lb) and volume (ml/l/tsp/tbsp/cup/fl oz)
- Ingredients normalize to a base unit: g, ml, or each
- Cross-dimension conversion (e.g. cups → grams) is NOT supported — require matching dimensions

## Key Decisions
- **No authentication** — single user, self-hosted
- **Server Actions** — use Next.js Server Actions for all data mutations, no separate API routes
- **Price snapshots** — cake ingredient prices are snapshotted at save time so history stays accurate even when ingredient prices change later
- **Markup** — default 3× multiplier, user can adjust per cake; suggested price can be accepted or overridden
- **Overhead** — labor cost + packaging cost are manual entries per cake pricing run

## Build Chunks
- [x] **Chunk 1** — Scaffold: Next.js + Drizzle + shadcn, schema, nav layout ✓
- [x] **Chunk 2** — Ingredients: CRUD, unit picker, auto price-per-unit calculation ✓
- [x] **Chunk 3** — Recipes: CRUD, ingredient quantity builder ✓
- [x] **Chunk 4** — Cost Calculator: pick recipe, scale servings, add overhead, set markup, save ✓
- [x] **Chunk 5** — Dashboard + History: recent cakes, cost history, breakdown detail page ✓

## npm Scripts
```
npm run dev           # start dev server
npm run db:push       # push schema changes to DB (dev)
npm run db:generate   # generate migration files
npm run db:migrate    # run migrations
npm run db:studio     # open Drizzle Studio
```

## Code Conventions
- Keep files under 200 lines — split into smaller components/modules if they grow
- Functional components + hooks only
- Server Actions live in `src/server/actions/` — one file per domain
- shadcn components in `src/components/ui/` — never edit these directly, use `npx shadcn add` to add new ones
- Use `numeric` strings from Drizzle (not `number`) — parse with `parseFloat()` when doing math
