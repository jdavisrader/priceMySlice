# Every Recipe Ingredient Belongs to a Section

## Context

Recipes are meant to be assembled from parts: build a cake by pulling the "Cake" section from
one recipe and the "Buttercream" section from another. Recipe 7 works this way. Recipe 3 does
not — its ingredients were added through the top-level "Add ingredient" button, which writes
rows with `section: null`.

Those loose ingredients are invisible to the assembly workflow. `getRecipesForCopy`
(`src/server/actions/recipes.ts:30`) filters `.where(isNotNull(recipeIngredients.section))`,
so recipe 3 never appears in the "Copy section from recipe" modal. Its ingredients cannot be
pulled into anything, and because per-section scaling keys off the section name, they can't be
scaled as a unit either.

The fix is to make "section" mandatory rather than optional: the only way to add an ingredient
is into a section. Target journey — **create recipe → add a section → add ingredients to it.**

Decisions confirmed with user: backfill existing loose ingredients into a section named after
their recipe; enforce with `NOT NULL` in the database; new recipes start with one empty,
unnamed section; fix the section-name collision bug by keying rows to a stable section uid.

## Changes

### 1. Backfill migration — loose ingredients get a section

`npm run db:generate` after step 2, then hand-edit the generated SQL so the backfill runs
**before** the `SET NOT NULL`:

```sql
UPDATE recipe_ingredients ri
SET section = LEFT(r.name, 100)
FROM recipes r
WHERE ri.recipe_id = r.id AND ri.section IS NULL;

ALTER TABLE recipe_ingredients ALTER COLUMN section SET NOT NULL;
```

`LEFT(r.name, 100)` matters: `recipes.name` is `varchar(255)` but `section` is `varchar(100)`,
so an untruncated copy fails on long recipe names.

Edge case to accept: a recipe with *both* sectioned and loose ingredients gets a new section
named after the recipe. If a section by that exact name already exists, the two merge. Worth a
quick look at the data before running — see Verification step 1.

Apply with `npm run db:migrate` (not `db:push` — the backfill must run with the DDL).

### 2. `src/db/schema.ts` — make the column non-nullable

On `recipeIngredients`, change:

```ts
section: varchar('section', { length: 100 }),
// →
section: varchar('section', { length: 100 }).notNull(),
```

**Leave `cakeIngredientSnapshots.section` nullable.** Snapshots are historical records of past
pricing runs; existing rows legitimately have nulls and must not be rewritten. The
unsectioned-rendering branches in `cake-calculator.tsx` / `ingredient-cost-table.tsx` /
`src/app/cakes/[id]/page.tsx` stay as-is to render those old cakes correctly.

### 3. `src/server/actions/recipes.ts` — drop the null filter

Remove `.where(isNotNull(recipeIngredients.section))` from `getRecipesForCopy` (line 30) and
the now-unused `isNotNull` import. After the backfill there are no null sections, so the filter
only risks hiding data. Simplify `row.section!` and the `section: i.section ?? null` fallbacks
(lines 120, 151) now that the type is non-nullable.

### 4. Row state keys off section uid, not section name

Today `RowData.section` is the section's *name* string, so `updateSectionName` has to
find-and-replace across every row (`recipe-form.tsx:114-120`) and two sections sharing a name
silently merge their ingredients.

- `src/components/recipes/recipe-ingredient-row.tsx` — `RowData.section: string | null`
  becomes `RowData.sectionUid: string`.
- `src/components/recipes/recipe-form.tsx` — `updateSectionName` becomes a plain name set with
  no row rewriting; `removeSection` filters by uid; `addRowToSection` takes a uid.
  On load, group DB rows by section name, mint one uid per distinct name, assign to rows.
  On submit, walk `sections` in order and emit `section: section.name` with a running
  `sortOrder`, preserving today's ordering behavior.
- `src/components/recipes/section-block.tsx` — `onAddRow` passes `section.uid`.
- `src/components/recipes/copy-from-recipe-modal.tsx` — `onCopy` hands back the section name
  and bare ingredient data; the parent mints the uid and assigns it, instead of the modal
  stamping `section: selectedSection` (line 37).

### 5. `recipe-form.tsx` — remove the standalone ingredient path

Delete the `unsectionedRows` state derivation (line 161), its render block (lines 227-235), and
the top-level "Add ingredient" button (lines 236-239). "Add ingredient" then exists only inside
`SectionBlock`.

New recipes initialize with one section: `[{ uid: crypto.randomUUID(), name: '' }]`, name field
empty against the existing `"Section name…"` placeholder. Also change `addSection` (line 111)
to use `''` rather than `'New section'`, so a forgotten rename fails validation loudly instead
of persisting a section literally called "New section".

Empty state copy becomes section-oriented rather than "No ingredients added yet."

### 6. Save validation

Sections are not entities — a section exists only as a string denormalized onto its ingredient
rows. A section with zero ingredients therefore cannot be saved and would silently vanish. Block
that at submit rather than losing the user's work. Validate:

- every section has a non-empty trimmed name;
- every section has at least one complete ingredient row;
- section names are unique within the recipe (case-insensitive).

Uniqueness still matters despite the uid work in step 4: persistence is by name, so two
same-named sections would merge on reload even though the form keeps them distinct.

Put these in a `validateSections` helper in `src/lib/recipe-validation.ts` and surface the
message inline above the submit button. `recipe-form.tsx` is already 293 lines, over the
200-line guide in CLAUDE.md — keeping validation out of it avoids making that worse.

## Files

- `src/db/schema.ts` — one column modifier
- `drizzle/<generated>.sql` — hand-edited backfill + NOT NULL
- `src/server/actions/recipes.ts` — drop null filter, tighten types
- `src/components/recipes/recipe-form.tsx` — uid keying, remove standalone path, validation
- `src/components/recipes/recipe-ingredient-row.tsx` — `RowData` type
- `src/components/recipes/section-block.tsx` — pass uid
- `src/components/recipes/copy-from-recipe-modal.tsx` — return name + rows, not stamped section
- `src/lib/recipe-validation.ts` — new

Not touched: cake calculator and cake detail rendering (legacy snapshots keep null sections).

## Verification

1. **Before migrating**, inspect what will change:
   `SELECT r.id, r.name, count(*) FROM recipe_ingredients ri JOIN recipes r ON r.id=ri.recipe_id WHERE ri.section IS NULL GROUP BY 1,2;`
   Confirm recipe 3 appears and no recipe already owns a section matching its own name.
2. `npm run db:migrate`, then re-run the query — expect zero rows.
3. `npm run dev`. Open `/recipes/3`: former loose ingredients now render under a section named
   "…" (the recipe's name), same quantities and costs as before.
4. `/recipes/new`: confirm one empty section is present, there is no top-level "Add ingredient",
   and ingredients can only be added inside a section.
5. Try to save with a blank section name, with an empty section, and with two sections named
   the same — each should be blocked with a clear message.
6. Build a recipe with two sections. Reopen it in edit — sections and ingredient assignments
   round-trip intact. Rename a section and confirm its ingredients follow it.
7. In another recipe, use **Add section → Copy from recipe** and confirm recipe 3 now appears
   with its backfilled section selectable. Copy it in and save.
8. `/cakes/new`: pick recipe 3, confirm its section header and per-section `Scale ×` now apply
   to those ingredients.
9. Open a cake saved *before* this change and confirm its old unsectioned rows still render.
10. `npm run lint` and `npm run build` clean.
