import { notFound } from 'next/navigation'
import { db } from '@/db'
import { recipes, recipeIngredients, ingredients } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { RecipeForm } from '@/components/recipes/recipe-form'

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const recipeId = parseInt(id)

  const [recipeRows, ingredientRows, ingredientOptions] = await Promise.all([
    db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1),
    db
      .select({
        ingredientId: recipeIngredients.ingredientId,
        quantity: recipeIngredients.quantity,
        unit: recipeIngredients.unit,
        section: recipeIngredients.section,
        sortOrder: recipeIngredients.sortOrder,
      })
      .from(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, recipeId))
      .orderBy(asc(recipeIngredients.sortOrder)),
    db
      .select({ id: ingredients.id, name: ingredients.name, baseUnit: ingredients.baseUnit })
      .from(ingredients)
      .orderBy(asc(ingredients.name)),
  ])

  if (recipeRows.length === 0) notFound()

  const recipe = recipeRows[0]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Edit recipe</h2>
        <p className="text-sm text-muted-foreground mt-1">{recipe.name}</p>
      </div>
      <RecipeForm
        ingredientOptions={ingredientOptions}
        recipe={recipe}
        existingIngredients={ingredientRows}
      />
    </div>
  )
}
