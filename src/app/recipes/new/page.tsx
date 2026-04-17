import { db } from '@/db'
import { ingredients } from '@/db/schema'
import { asc } from 'drizzle-orm'
import { RecipeForm } from '@/components/recipes/recipe-form'

export default async function NewRecipePage() {
  const ingredientOptions = await db
    .select({ id: ingredients.id, name: ingredients.name, baseUnit: ingredients.baseUnit })
    .from(ingredients)
    .orderBy(asc(ingredients.name))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">New recipe</h2>
        <p className="text-sm text-muted-foreground mt-1">Add a new cake recipe with its ingredients.</p>
      </div>
      <RecipeForm ingredientOptions={ingredientOptions} />
    </div>
  )
}
