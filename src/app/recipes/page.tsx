import { db } from '@/db'
import { recipes, recipeIngredients } from '@/db/schema'
import { desc, count } from 'drizzle-orm'
import { RecipesClient } from '@/components/recipes/recipes-client'

export default async function RecipesPage() {
  const [recipesData, counts] = await Promise.all([
    db.select().from(recipes).orderBy(desc(recipes.createdAt)),
    db.select({ recipeId: recipeIngredients.recipeId, count: count() })
      .from(recipeIngredients)
      .groupBy(recipeIngredients.recipeId),
  ])

  const ingredientCounts = Object.fromEntries(
    counts.map((c) => [c.recipeId, Number(c.count)])
  )

  return <RecipesClient recipes={recipesData} ingredientCounts={ingredientCounts} />
}
