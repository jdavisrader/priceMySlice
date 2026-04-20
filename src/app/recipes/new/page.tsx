import { db } from '@/db'
import { ingredients } from '@/db/schema'
import { asc } from 'drizzle-orm'
import { RecipeForm } from '@/components/recipes/recipe-form'
import { getRecipesForCopy, getRecipeFullCopy } from '@/server/actions/recipes'

export default async function NewRecipePage({
  searchParams,
}: {
  searchParams: Promise<{ copyFrom?: string }>
}) {
  const { copyFrom } = await searchParams

  const [ingredientOptions, recipesForCopy] = await Promise.all([
    db
      .select({ id: ingredients.id, name: ingredients.name, baseUnit: ingredients.baseUnit, gPerMl: ingredients.gPerMl })
      .from(ingredients)
      .orderBy(asc(ingredients.name)),
    getRecipesForCopy(),
  ])

  const copySource = copyFrom ? await getRecipeFullCopy(parseInt(copyFrom)) : null

  const initialValues = copySource
    ? {
        name: copySource.name,
        description: copySource.description,
        servings: copySource.servings,
        notes: copySource.notes,
        ingredients: copySource.ingredients.map((ing, idx) => ({ ...ing, sortOrder: idx })),
      }
    : undefined

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">New recipe</h2>
        <p className="text-sm text-muted-foreground mt-1">Add a new cake recipe with its ingredients.</p>
      </div>
      <RecipeForm
        ingredientOptions={ingredientOptions}
        recipesForCopy={recipesForCopy}
        initialValues={initialValues}
      />
    </div>
  )
}
